import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Connections from './pages/Connections';
import Settings from './pages/Settings';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import Home from './pages/Home';
import FileExplorerPage from './pages/FileExplorerPage';

import Roadmap from './pages/Roadmap';
import NotFound from './pages/NotFound';
import { authService } from './services/api';

function App() {
  const [userId, setUserId] = useState(null);
  const [connectedServices, setConnectedServices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur revient d'une authentification OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    const returnedUserId = urlParams.get('userId');
    const error = urlParams.get('error');

    if (error) {
      alert(`Erreur d'authentification: ${error}`);
      window.history.replaceState({}, document.title, window.location.pathname);
      setLoading(false);
      return;
    }

    if (authStatus === 'success' && returnedUserId) {
      // Sauvegarder l'ID utilisateur dans localStorage
      localStorage.setItem('userId', returnedUserId);
      setUserId(returnedUserId);
      
      // Nettoyer l'URL et rediriger vers les fichiers
      window.history.replaceState({}, document.title, '/files');
      
      // Charger les informations de l'utilisateur
      loadUserStatus(returnedUserId);
    } else {
      // Vérifier si un utilisateur est déjà connecté
      const savedUserId = localStorage.getItem('userId');
      if (savedUserId) {
        setUserId(savedUserId);
        loadUserStatus(savedUserId);
      } else {
        setLoading(false);
      }
    }
  }, []);

  const loadUserStatus = async (id) => {
    try {
      const response = await authService.checkStatus(id);
      setUser(response.user);
      setConnectedServices(response.connectedServices);
    } catch (err) {
      console.error('Erreur lors du chargement du statut:', err);
      // Si l'utilisateur n'existe plus, on nettoie
      localStorage.removeItem('userId');
      setUserId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleServicesUpdate = () => {
    if (userId) {
      loadUserStatus(userId);
    }
  };

  const handleLogout = () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      localStorage.removeItem('userId');
      setUserId(null);
      setUser(null);
      setConnectedServices(null);
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <Header user={user} onLogout={handleLogout} />
      
      <main className={`${user ? 'pt-24' : 'pt-8'} pb-8`}>
        <Routes>
          {/* Route publique - Page d'accueil */}
          <Route 
            path="/" 
            element={
              userId ? <Navigate to="/files" replace /> : <Home />
            } 
          />

          {/* Routes protégées */}
          <Route 
            path="/files" 
            element={
              <ProtectedRoute userId={userId}>
                <FileExplorerPage userId={userId} />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/connections" 
            element={
              <ProtectedRoute userId={userId}>
                <Connections 
                  userId={userId}
                  connectedServices={connectedServices}
                  onUpdate={handleServicesUpdate}
                />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/settings" 
            element={
              <ProtectedRoute userId={userId}>
                <Settings user={user} />
              </ProtectedRoute>
            } 
          />

          {/* Route publique - Roadmap */}
          <Route path="/roadmap" element={<Roadmap />} />

          {/* Route de déconnexion */}
          <Route 
            path="/logout" 
            element={
              <Navigate to="/" replace state={{ logout: true }} />
            } 
          />

          {/* Page 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;