import { useState, useEffect } from 'react';
import { X, Download, Share2, Printer, Loader2, Calendar, HardDrive, Tag, Star, ExternalLink, AlertCircle } from 'lucide-react';

export default function FilePreviewModal({ 
  file, 
  userId, 
  metadata,
  onClose, 
  onDownload, 
  onShare, 
  onPrint 
}) {
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMetadata, setShowMetadata] = useState(true);

  useEffect(() => {
    loadPreview();
  }, [file, userId]);

  const loadPreview = async () => {
    if (!file || !userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      // ✅ CORRECTION: Suppression du /api dans l'URL
      const response = await fetch(
        `${API_URL}/files/${userId}/preview/${file.provider}/${file.id}`
      );
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Données preview reçues:', data);
      
      if (data.success && data.preview) {
        setPreviewData(data.preview);
      } else {
        setError(data.error || 'Impossible de charger la prévisualisation');
      }
    } catch (err) {
      console.error('❌ Erreur preview:', err);
      setError(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-[500px] bg-gray-50 rounded-lg">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-3" />
          <span className="text-gray-600 font-medium">Chargement...</span>
        </div>
      );
    }

    if (error || !previewData) {
      return (
        <div className="flex flex-col items-center justify-center h-[500px] bg-gray-50 rounded-lg">
          <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-600 mb-2 font-medium">{error || 'Prévisualisation non disponible'}</p>
          <p className="text-sm text-gray-500 mb-4">Le fichier ne peut pas être prévisualisé dans le navigateur</p>
          <div className="flex gap-2">
            {previewData?.webViewLink && (
              <a 
                href={previewData.webViewLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Ouvrir dans le cloud
              </a>
            )}
            <button 
              onClick={() => onDownload(file)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Télécharger
            </button>
          </div>
        </div>
      );
    }

    const ext = file.name.split('.').pop().toLowerCase();
    const mimeType = previewData.mimeType || file.mimeType || '';
    
    // ✅ CORRECTION: Construction correcte de l'URL de prévisualisation
    let previewUrl = previewData.previewUrl || previewData.url || previewData.webContentLink;
    
    console.log('🖼️ Tentative d\'affichage:', {
      ext,
      mimeType,
      previewUrl,
      previewData
    });

    // Documents Google (Google Docs, Sheets, Slides)
    if (mimeType.includes('google-apps')) {
      const embedUrl = previewData.embedLink || `${previewData.webViewLink}?embedded=true`;
      return (
        <iframe
          src={embedUrl}
          className="w-full h-[500px] border-0 rounded-lg bg-white"
          title={file.name}
          sandbox="allow-same-origin allow-scripts allow-forms"
        />
      );
    }

    // Images - Support amélioré
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext) || mimeType.startsWith('image/')) {
      // Pour Google Drive, utiliser le thumbnailLink en haute résolution
      // C'est la seule URL qui fonctionne de manière fiable sans authentification
      const imageUrl = previewUrl || previewData.thumbnailUrl;
      const imageUrlOK = previewData.webContentLink.replace('export=download', 'export=view');

      console.log('🖼️ URL image finale:', imageUrl);
      
      if (!imageUrl) {
        return (
          <div className="flex flex-col items-center justify-center h-[500px] bg-gray-50 rounded-lg">
            <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-600 mb-2">Impossible de charger l'image</p>
            <p className="text-sm text-gray-500 mb-4">URL de prévisualisation non disponible</p>
            <a 
              href={previewData.webViewLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Ouvrir dans Google Drive
            </a>
          </div>
        );
      }
      
      return (
        <div className="flex items-center justify-center bg-gray-900 rounded-lg p-4 h-[500px]">
          <img 
            src={imageUrlOK} 
            alt={file.name} 
            className="max-h-full max-w-full object-contain rounded shadow-lg"
            onError={(e) => {
              console.error('❌ Erreur chargement image:', imageUrl);
              setError('Impossible de charger l\'image. Essayez de l\'ouvrir dans Google Drive.');
            }}
            onLoad={() => console.log('✅ Image chargée avec succès')}
          />
        </div>
      );
    }

    // Vidéos
    if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext) || mimeType.startsWith('video/')) {
      const videoUrl = previewUrl || `https://drive.google.com/uc?export=download&id=${file.id}`;
      
      return (
        <div className="flex items-center justify-center bg-black rounded-lg h-[500px]">
          <video 
            controls 
            className="max-h-full max-w-full rounded"
            preload="metadata"
          >
            <source src={videoUrl} type={mimeType} />
            Votre navigateur ne supporte pas la vidéo.
          </video>
        </div>
      );
    }

    // Audio
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext) || mimeType.startsWith('audio/')) {
      const audioUrl = previewUrl || `https://drive.google.com/uc?export=download&id=${file.id}`;
      
      return (
        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg h-[500px]">
          <div className="text-white mb-6">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
              </svg>
            </div>
            <p className="text-center font-medium">{file.name}</p>
          </div>
          <audio 
            controls 
            className="w-full max-w-md"
            preload="metadata"
          >
            <source src={audioUrl} type={mimeType} />
            Votre navigateur ne supporte pas l'audio.
          </audio>
        </div>
      );
    }

    // PDF
    if (ext === 'pdf' || mimeType === 'application/pdf') {
      const pdfUrl = previewUrl || `https://drive.google.com/file/d/${file.id}/preview`;
      
      return (
        <iframe
          src={pdfUrl}
          className="w-full h-[500px] border-0 rounded-lg"
          title={file.name}
        />
      );
    }

    // Texte
    if (['txt', 'md', 'json', 'xml', 'csv', 'log'].includes(ext) || mimeType.startsWith('text/')) {
      return (
        <div className="bg-gray-50 rounded-lg h-[500px] overflow-auto">
          <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-words">
            {previewData.content || 'Contenu texte non disponible'}
          </pre>
        </div>
      );
    }

    // Fallback - Types non supportés
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-gray-50 rounded-lg">
        <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
        <p className="text-gray-600 mb-2 font-medium">Prévisualisation non disponible</p>
        <p className="text-sm text-gray-500 mb-4">Type de fichier: {ext.toUpperCase()}</p>
        <div className="flex gap-2">
          {previewData.webViewLink && (
            <a 
              href={previewData.webViewLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Ouvrir dans Google Drive
            </a>
          )}
          <button 
            onClick={() => onDownload(file)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            Télécharger
          </button>
        </div>
      </div>
    );
  };

  const displayName = metadata?.customName || file.name;
  const tags = metadata?.tags || [];
  const starred = metadata?.starred || false;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate flex items-center gap-2">
                {displayName}
                {starred && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
              </h3>
              {metadata?.description && (
                <p className="text-sm text-gray-600 truncate mt-0.5">
                  {metadata.description}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button 
              onClick={() => onDownload(file)} 
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Télécharger"
            >
              <Download className="w-5 h-5 text-gray-700" />
            </button>
            <button 
              onClick={() => onShare(file)} 
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Partager"
            >
              <Share2 className="w-5 h-5 text-gray-700" />
            </button>
            <button 
              onClick={() => onPrint(file)} 
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Imprimer"
            >
              <Printer className="w-5 h-5 text-gray-700" />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Fermer"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex overflow-hidden" style={{ height: 'calc(90vh - 120px)' }}>
          {/* Preview */}
          <div className={`${showMetadata ? 'w-2/3' : 'w-full'} p-4 overflow-auto transition-all`}>
            {renderPreview()}
          </div>

          {/* Metadata sidebar */}
          {showMetadata && (
            <div className="w-1/3 border-l bg-gray-50 p-4 overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Détails</h4>
                <button 
                  onClick={() => setShowMetadata(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Taille */}
                {file.size && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <HardDrive className="w-4 h-4" />
                      <span className="text-sm font-medium">Taille</span>
                    </div>
                    <p className="text-sm text-gray-900 pl-6">{formatFileSize(file.size)}</p>
                  </div>
                )}

                {/* Date */}
                {file.modifiedTime && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">Modifié le</span>
                    </div>
                    <p className="text-sm text-gray-900 pl-6">{formatDate(file.modifiedTime)}</p>
                  </div>
                )}

                {/* Provider */}
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
                    <span className="text-sm font-medium">Source</span>
                  </div>
                  <p className="text-sm text-gray-900 pl-6 capitalize">
                    {file.provider?.replace('_', ' ')}
                  </p>
                </div>

                {/* Type */}
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <span className="text-sm font-medium">Type</span>
                  </div>
                  <p className="text-sm text-gray-900 pl-6">
                    {file.name.split('.').pop().toUpperCase()} {file.type === 'folder' ? 'Dossier' : 'Fichier'}
                  </p>
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Tag className="w-4 h-4" />
                      <span className="text-sm font-medium">Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pl-6">
                      {tags.map((tag, idx) => {
                        const color = metadata?.tagColors?.[tag] || 'blue';
                        const colorClasses = {
                          blue: 'bg-blue-100 text-blue-700 border-blue-200',
                          green: 'bg-green-100 text-green-700 border-green-200',
                          red: 'bg-red-100 text-red-700 border-red-200',
                          yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                          purple: 'bg-purple-100 text-purple-700 border-purple-200',
                          pink: 'bg-pink-100 text-pink-700 border-pink-200',
                          indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
                          gray: 'bg-gray-100 text-gray-700 border-gray-200'
                        };
                        
                        return (
                          <span 
                            key={idx} 
                            className={`px-2 py-1 rounded text-xs border ${colorClasses[color] || colorClasses.blue}`}
                          >
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Description complète */}
                {metadata?.description && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <span className="text-sm font-medium">Description</span>
                    </div>
                    <p className="text-sm text-gray-700 pl-6 whitespace-pre-wrap">
                      {metadata.description}
                    </p>
                  </div>
                )}

                {/* Nom original si renommé */}
                {metadata?.customName && metadata.customName !== file.name && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <span className="text-sm font-medium">Nom original</span>
                    </div>
                    <p className="text-sm text-gray-700 pl-6 break-words">
                      {file.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Toggle metadata button */}
          {!showMetadata && (
            <button
              onClick={() => setShowMetadata(true)}
              className="absolute right-4 top-20 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
              title="Afficher les détails"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}