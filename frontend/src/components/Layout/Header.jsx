import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '../Navbar/Navbar';
import { authService } from '../../services/api';

function Header({ user, onLogout }) {
  const location = useLocation();
  const [userName, setUserName] = useState(user?.name || '');
  const [userPicture, setUserPicture] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user?.id) return;
      
      try {
        const response = await authService.getUserInfo(user.id);
        if (response.success && response.user) {
          setUserName(response.user.Name || response.user.name || user.name);
          setUserPicture(response.user.picture);
        }
      } catch (error) {
        console.error('Erreur récupération info utilisateur:', error);
        // Fallback sur les données existantes
        setUserName(user.name || 'Utilisateur');
      }
    };

    fetchUserInfo();
  }, [user]);

  if (!user) return null;

  const navLinks = [
    { path: '/files', label: 'Fichiers', icon: '📁' },
    { path: '/connections', label: 'Connexions', icon: '🔗' },
    { path: '/settings', label: 'Paramètres', icon: '⚙️' },
    { path: '/roadmap', label: 'Roadmap', icon: '🗺️' },
  ];

  return (
    <header className="w-full bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto pl-4 pr-6 sm:pl-6 sm:pr-8 lg:pl-8 lg:pr-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo et titre */}
          <Link to="/files" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
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
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Multi-Cloud Manager</h1>
              {userName && (
                <span className="text-xs text-gray-500">{userName}!</span>
              )}
            </div>
          </Link>

          {/* Menu utilisateur à droite */}
          <Navbar 
            user={{ ...user, name: userName, picture: userPicture }} 
            onLogout={onLogout} 
          />
        </div>
      </div>
    </header>
  );
}

export default Header;