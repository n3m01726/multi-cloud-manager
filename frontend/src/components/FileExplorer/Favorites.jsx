// frontend/src/components/FileExplorer/Favorites.jsx
import { useState, useEffect } from 'react';
import FileItem from './partials/FileItem';
import { filesService } from '../../services/api';

export default function Favorites({ userId, onDownload }) {
  const [starredFiles, setStarredFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState('');

  useEffect(() => {
    if (userId) loadFavorites();
  }, [userId]);

  const loadFavorites = async () => {
    setLoading(true);
    setWarning('');
    try {
      const response = await filesService.getStarred(userId);
      if (response.success) {
        setStarredFiles(response.files || []);
        if (response.warning) setWarning(response.warning);
      } else {
        setStarredFiles([]);
        console.error('Erreur API:', response.error);
      }
    } catch (error) {
      console.error('Erreur loadFavorites:', error);
      setStarredFiles([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Chargement des favoris...</p>;
  if (starredFiles.length === 0) return <p>Aucun fichier favori trouvé.</p>;

  return (
    <div className="space-y-2">
      {warning && (
        <div className="text-yellow-700 bg-yellow-100 px-3 py-2 rounded">
          {warning}
        </div>
      )}

      {starredFiles.map(file => (
        <FileItem
          key={`${file.provider}-${file.id}`}
          file={file}
          userId={userId}
          onDownload={onDownload}
        />
      ))}
    </div>
  );
}
