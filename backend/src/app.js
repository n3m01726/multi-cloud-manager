// Point d'entrée du serveur Express
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { checkDatabaseConnection } = require('./config/database');

// Import des routes
const authRoutes = require('./routes/auth');
const filesRoutes = require('./routes/files');

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging des requêtes (développement)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/files', filesRoutes);

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Multi-Cloud Manager API is running',
    timestamp: new Date().toISOString()
  });
});

// Route par défaut
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bienvenue sur Multi-Cloud Manager API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/auth',
      files: '/files'
    }
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route non trouvée' 
  });
});

// Middleware de gestion d'erreurs global
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Démarrage du serveur
async function startServer() {
  try {
    // Vérifier la connexion à la base de données
    const dbConnected = await checkDatabaseConnection();
    
    if (!dbConnected) {
      console.error('❌ Impossible de démarrer le serveur sans connexion à la base de données');
      process.exit(1);
    }

    // Démarrer le serveur Express
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════╗
║   Multi-Cloud Manager API                  ║
║   Serveur démarré sur le port ${PORT}        ║
║   URL: http://localhost:${PORT}              ║
╚════════════════════════════════════════════╝
      `);
    });

  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

// Gestion de l'arrêt propre du serveur
process.on('SIGTERM', () => {
  console.log('SIGTERM reçu, arrêt du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT reçu, arrêt du serveur...');
  process.exit(0);
});

// Démarrer le serveur
startServer();

module.exports = app;