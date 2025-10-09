import { useState, useRef, useEffect } from 'react';
import { Menu } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const dropdownRef = useRef(null);

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { label: 'Connexions', href: '/connections' },
    { label: 'Paramètres', href: '/settings' },
    { label: 'Déconnexion', onClick: onLogout },
  ];

  // Obtenir l'initiale pour le fallback
  const getInitial = () => {
    return (user.name || user.email || '?')[0].toUpperCase();
  };

  return (
    <nav>
      <div className="relative bg-primary" ref={dropdownRef}>
        {/* Bouton de menu */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 rounded-lg hover:bg-gray-50 transition-colors p-2 md:pr-4"
        >
          {/* Avatar avec photo ou initiale */}
          <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-500 flex items-center justify-center text-white font-medium flex-shrink-0">
            {user.picture && !imageError ? (
              <img
                src={user.picture}
                alt={user.name || user.email}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <span>{getInitial()}</span>
            )}
          </div>

          {/* Nom et email - caché sur mobile */}
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium text-gray-900">{user.name || user.email}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
        </button>

        {/* Menu déroulant */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
            {menuItems.map((item, index) => (
              <div key={index} className="px-1">
                {item.href ? (
                  <a
                    href={item.href}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 rounded-md transition-colors"
                  >
                    {item.label}
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      item.onClick?.();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 rounded-md transition-colors"
                  >
                    {item.label}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}