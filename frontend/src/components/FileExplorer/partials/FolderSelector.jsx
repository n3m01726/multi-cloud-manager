import React, { useState, useEffect } from 'react';
import { Folder, ChevronRight, Search, X, Check } from 'lucide-react';
import { filesService } from '../../../services/api';

export default function FolderSelector({ 
  isOpen, 
  onClose, 
  onSelect, 
  userId, 
  currentProvider = 'google_drive',
  title = "Sélectionner un dossier de destination"
}) {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState('root');

  useEffect(() => {
    if (isOpen) {
      loadFolders();
    }
  }, [isOpen, currentFolderId]);

  const loadFolders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await filesService.listFiles(userId, currentFolderId);
      const folderList = (response.files || []).filter(file => file.type === 'folder');
      setFolders(folderList);
    } catch (err) {
      console.error('Erreur lors du chargement des dossiers:', err);
      setError('Erreur lors du chargement des dossiers');
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folder) => {
    setCurrentPath(prev => [...prev, {
      id: currentFolderId,
      name: currentFolderId === 'root' ? 'Accueil' : folders.find(f => f.id === currentFolderId)?.name || 'Dossier'
    }]);
    setCurrentFolderId(folder.id);
  };

  const handleBackClick = () => {
    if (currentPath.length > 0) {
      const newPath = [...currentPath];
      const previousFolder = newPath.pop();
      setCurrentPath(newPath);
      setCurrentFolderId(previousFolder.id);
    }
  };

  const handleHomeClick = () => {
    setCurrentPath([]);
    setCurrentFolderId('root');
  };

  const handleSelect = () => {
    if (selectedFolder) {
      onSelect(selectedFolder);
      onClose();
    }
  };

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un dossier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-2 text-sm">
            <button
              onClick={handleHomeClick}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Accueil
            </button>
            {currentPath.map((folder, index) => (
              <React.Fragment key={folder.id}>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <button
                  onClick={() => {
                    const newPath = currentPath.slice(0, index + 1);
                    setCurrentPath(newPath);
                    setCurrentFolderId(folder.id);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {folder.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Back button */}
        {currentPath.length > 0 && (
          <div className="px-4 py-2">
            <button
              onClick={handleBackClick}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span>Retour</span>
            </button>
          </div>
        )}

        {/* Folders list */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>{error}</p>
              <button
                onClick={loadFolders}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Réessayer
              </button>
            </div>
          ) : filteredFolders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucun dossier trouvé</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFolders.map(folder => (
                <div
                  key={folder.id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedFolder?.id === folder.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                  onClick={() => setSelectedFolder(folder)}
                >
                  <div className="flex items-center space-x-3">
                    <Folder className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">{folder.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedFolder?.id === folder.id && (
                      <Check className="w-5 h-5 text-blue-500" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFolderClick(folder);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Annuler
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedFolder}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Sélectionner
          </button>
        </div>
      </div>
    </div>
  );
}
