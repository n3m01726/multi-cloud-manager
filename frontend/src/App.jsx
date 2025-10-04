// Composant principal de l'application
import { useState, useEffect } from 'react';
import ConnectServices from './components/Auth/ConnectServices';
import FileList from './components/FileExplorer/FileExplorer';
import Navbar from './components/Navbar/Navbar';
import { authService } from './services/api';

function App() {
  const [userId, setUserId] = useState(null);
  const [connectedServices, setConnectedServices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

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
      
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
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
    }
  };

  const hasConnectedServices = connectedServices && 
    (connectedServices.google_drive || connectedServices.dropbox);

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
      {/* Header fixe */}
      {user && (
        <header className="w-full bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto pl-4 pr-6 sm:pl-6 sm:pr-8 lg:pl-8 lg:pr-10">
            <div className="flex items-center justify-between h-16">
              {/* Logo et titre */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-white"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                    <path d="M12 12v9"></path>
                    <path d="m8 17 4 4 4-4"></path>
                  </svg>
                </div>
                <h1 className="text-lg font-bold text-gray-900">Multi-Cloud Manager</h1>
              </div>

              {/* Menu utilisateur à droite */}
              <Navbar user={user} onLogout={handleLogout} />
            </div>
          </div>
        </header>
      )}

      {/* Contenu principal avec padding-top pour compenser le header fixed */}
      <main className={`${user ? 'pt-24' : ''} pb-8`}>
        {!userId ? (
          // Écran de bienvenue
          <div className="max-w-2xl mx-auto px-6 text-center">
            <div className="bg-white rounded-lg shadow-xl p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Bienvenue sur Multi-Cloud Manager
              </h2>
              <p className="text-gray-600 mb-8">
                Connectez vos services cloud préférés et gérez tous vos fichiers depuis une seule interface.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={async () => {
                    try {
                      const { authUrl } = await authService.getGoogleAuthUrl();
                      window.location.href = authUrl;
                    } catch (err) {
                      alert('Erreur lors de la connexion');
                    }
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Commencer avec Google Drive
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section de connexion des services */}

            {/* Liste des fichiers (affichée seulement si au moins un service est connecté) */}
            {hasConnectedServices && (
              <FileList userId={userId} />
              
            )}
              <ConnectServices
              userId={userId}
              connectedServices={connectedServices}
              onUpdate={handleServicesUpdate}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-sm text-gray-900">
        <p>Multi-Cloud Manager v1.0.0 - MVP</p>
        <p className="mt-1 text-gray-900">Google Drive connecté • Dropbox connecté</p>
      </footer>
    </div>
  );
}

export default App;