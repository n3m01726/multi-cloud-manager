import { useState, useRef, useEffect } from 'react';
import { Menu } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <nav>
      <div className="relative bg-primary" ref={dropdownRef}>
        {/* Bouton de menu */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 rounded-lg hover:bg-gray-50 transition-colors p-2 md:pr-4"
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium">
            {(user.name || user.email || '?')[0].toUpperCase()}
          </div>

          {/* Nom et email - caché sur mobile */}
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium text-gray-900">{user.name || user.email}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
        </button>

        {/* Menu déroulant */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
            {menuItems.map((item, index) => (
              <div key={index} className="px-1">
                {item.href ? (
                  <a
                    href={item.href}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 rounded-md"
                  >
                    {item.label}
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      item.onClick?.();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 rounded-md"
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