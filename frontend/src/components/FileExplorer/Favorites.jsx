// frontend/src/components/FileExplorer/Favorites.jsx
// REMPLACER par cette version corrigée

import { useState, useEffect } from 'react';
import { Star, RefreshCw } from 'lucide-react';
import FileItem from './partials/FileItem';
import { filesService } from '../../services/api';

export default function Favorites({ userId, onDownload, onFolderClick, onFileMoved, onFileCopied }) {
  const [starredFiles, setStarredFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState('');

  useEffect(() => {
    if (userId) {
      loadFavorites();
    }
  }, [userId]);

  const loadFavorites = async () => {
    setLoading(true);
    setWarning('');
    setError(null);
    
    try {
      console.log('🌟 Chargement des favoris pour userId:', userId);
      const response = await filesService.getStarred(userId);
      
      console.log('📦 Réponse API:', response);
      
      if (response.success) {
        setStarredFiles(response.files || []);
        if (response.warning) {
          setWarning(response.warning);
        }
        if (response.message && response.files.length === 0) {
          setWarning(response.message);
        }
      } else {
        setError(response.error || 'Erreur lors du chargement');
        setStarredFiles([]);
      }
    } catch (err) {
      console.error('❌ Erreur loadFavorites:', err);
      setError('Erreur lors du chargement des favoris');
      setStarredFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadFavorites();
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
        <p>Chargement des favoris...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <p>{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (starredFiles.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {warning && (
          <div className="mb-4 p-4 mx-6 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
            {warning}
          </div>
        )}
        <Star className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium mb-2">Aucun fichier favori</p>
        <p className="text-sm">
          Marquez des fichiers comme favoris en cliquant sur l'icône de tag 🏷️
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {warning && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
          {warning}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          Fichiers favoris ({starredFiles.length})
        </h3>
        <button
          onClick={handleRefresh}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Actualiser"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2">
        {starredFiles.map(file => (
          <FileItem
            key={`${file.provider}-${file.id}`}
            file={file}
            userId={userId}
            onFolderClick={onFolderClick}
            onDownload={onDownload}
            onFileMoved={onFileMoved}
            onFileCopied={onFileCopied}
          />
        ))}
      </div>
    </div>
  );
}