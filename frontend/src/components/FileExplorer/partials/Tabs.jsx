import { Search, RefreshCw } from 'lucide-react';

export default function Tabs({ activeTab, setActiveTab, toggleSearchBar, showSearchBar, onRefresh }) {
  const tabs = [
    { id: 'all', label: 'Tous', activeColor: 'bg-indigo-100 text-indigo-600' },
    { id: 'google_drive', label: 'Google Drive', activeColor: 'bg-[#0F9D58] text-green-100' },
    { id: 'dropbox', label: 'Dropbox', activeColor: 'bg-[#0061FE] text-blue-100' },
  ];

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      {/* Tabs à gauche */}
      <div className="flex gap-2 text-md">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === tab.id 
                ? tab.activeColor
                : 'text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Boutons d'action à droite */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSearchBar}
          className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
            showSearchBar
              ? 'text-white bg-indigo-600 hover:bg-indigo-700'
              : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
          }`}
          title={showSearchBar ? 'Fermer la recherche' : 'Rechercher'}
        >
          {showSearchBar ? '✕' : <Search className="w-4 h-4" />}
        </button>

        <button
          onClick={onRefresh}
          className="flex items-center justify-center w-9 h-9 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          title="Actualiser"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
