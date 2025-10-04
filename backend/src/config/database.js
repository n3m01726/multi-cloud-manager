// Configuration de la base de données avec Prisma
const { PrismaClient } = require('@prisma/client');

// Instance unique de Prisma Client (singleton pattern)
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'], // Logs pour le développement
});

/**
 * Vérifie la connexion à la base de données
 */
async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Connexion à la base de données établie');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
    return false;
  }
}

/**
 * Ferme proprement la connexion à la base de données
 */
async function closeDatabaseConnection() {
  await prisma.$disconnect();
  console.log('Base de données déconnectée');
}

// Gestion de la fermeture propre lors de l'arrêt du serveur
process.on('beforeExit', async () => {
  await closeDatabaseConnection();
});

module.exports = {
  prisma,
  checkDatabaseConnection,
  closeDatabaseConnection,
};