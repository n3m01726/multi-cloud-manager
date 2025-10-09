// frontend/src/components/FileExplorer/partials/ThumbnailImage.jsx
import { useState } from 'react';

/**
 * Composant pour afficher les thumbnails via proxy backend
 * Utilise directement le proxy car thumbnailLink Google échoue souvent
 */
export default function ThumbnailImage({ file, userId, className = '', alt = '' }) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  
  // ✅ Utiliser DIRECTEMENT le proxy backend
  const imgSrc = `${API_URL}/files/${userId}/thumbnail/${file.provider}/${file.id}`;
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    console.error('❌ Impossible de charger le thumbnail pour:', file.name);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center`}>
        <span className="text-gray-400 text-xs">Erreur</span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt || file.name}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
}