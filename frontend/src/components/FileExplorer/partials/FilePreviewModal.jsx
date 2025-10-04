import React, { useState, useEffect } from "react";
import { X, Download, Share2, Printer, Loader2 } from "lucide-react";
import { filesService } from "../../../services/api";

export default function FilePreviewModal({ file, userId, onClose, onDownload, onShare, onPrint }) {
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPreview = async () => {
      if (!file || !userId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await filesService.getPreviewUrl(userId, file.provider, file.id);
        if (response.success) {
          setPreviewData(response.preview);
        } else {
          setError('Impossible de charger la prévisualisation');
        }
      } catch (err) {
        console.error('Erreur lors du chargement de la prévisualisation:', err);
        setError('Erreur lors du chargement de la prévisualisation');
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [file, userId]);

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-[70vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Chargement de la prévisualisation...</span>
        </div>
      );
    }

    if (error || !previewData) {
      return (
        <div className="flex flex-col items-center justify-center h-[70vh] text-gray-500">
          <p className="text-center">{error || 'Prévisualisation non disponible'}</p>
          {previewData?.webViewLink && (
            <a 
              href={previewData.webViewLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Ouvrir dans Google Drive
            </a>
          )}
        </div>
      );
    }

    const ext = file.name.split(".").pop().toLowerCase();
    const mimeType = previewData.mimeType || file.mimeType;

    // Documents Google (Docs, Sheets, Slides)
    if (mimeType.includes('google-apps')) {
      return (
        <iframe
          src={previewData.previewUrl}
          className="w-full h-[70vh] border rounded"
          title={file.name}
          sandbox="allow-same-origin allow-scripts allow-forms"
        />
      );
    }

    // Images
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext) || mimeType.startsWith('image/')) {
      // Construire l'URL complète du backend
      const fullPreviewUrl = previewData.previewUrl.startsWith('http') 
        ? previewData.previewUrl 
        : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${previewData.previewUrl}`;
      
      return (
        <img 
          src={fullPreviewUrl} 
          alt={file.name} 
          className="max-h-[70vh] object-contain mx-auto rounded"
          onError={() => setError('Impossible de charger l\'image')}
        />
      );
    }

    // Vidéos
    if (["mp4", "webm", "mov", "avi"].includes(ext) || mimeType.startsWith('video/')) {
      const fullPreviewUrl = previewData.previewUrl.startsWith('http') 
        ? previewData.previewUrl 
        : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${previewData.previewUrl}`;
      
      return (
        <video controls className="max-h-[70vh] mx-auto rounded">
          <source src={fullPreviewUrl} type={mimeType} />
          Votre navigateur ne supporte pas la vidéo.
        </video>
      );
    }

    // PDF
    if (ext === "pdf" || mimeType === "application/pdf") {
      const fullPreviewUrl = previewData.previewUrl.startsWith('http') 
        ? previewData.previewUrl 
        : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${previewData.previewUrl}`;
      
      return (
        <iframe
          src={fullPreviewUrl}
          className="w-full h-[70vh] border rounded"
          title={file.name}
        />
      );
    }

    // Documents Office (Word, Excel, PowerPoint)
    if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext)) {
      return (
        <div className="flex flex-col items-center justify-center h-[70vh] text-gray-500">
          <p className="text-center mb-4">Prévisualisation non disponible pour ce type de fichier</p>
          <div className="flex gap-2">
            <a 
              href={previewData.previewUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Ouvrir dans Google Drive
            </a>
            <button 
              onClick={() => onDownload(file)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Télécharger
            </button>
          </div>
        </div>
      );
    }

    // Fallback
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-gray-500">
        <p className="text-center mb-4">Prévisualisation non disponible</p>
        <div className="flex gap-2">
          <a 
            href={previewData.previewUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Ouvrir dans Google Drive
          </a>
          <button 
            onClick={() => onDownload(file)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Télécharger
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white rounded-lg shadow-lg max-w-3xl w-full p-4">
        {/* Float menu */}
        <div className="absolute top-3 right-3 flex space-x-2">
          <button onClick={() => onDownload(file)} className="p-2 hover:bg-gray-100 rounded">
            <Download className="w-5 h-5 text-gray-700" />
          </button>
          <button onClick={() => onShare(file)} className="p-2 hover:bg-gray-100 rounded">
            <Share2 className="w-5 h-5 text-gray-700" />
          </button>
          <button onClick={() => onPrint(file)} className="p-2 hover:bg-gray-100 rounded">
            <Printer className="w-5 h-5 text-gray-700" />
          </button>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Preview content */}
        <div className="mt-8">{renderPreview()}</div>

        {/* Nom du fichier */}
        <h3 className="mt-4 text-center font-medium truncate">{file.name}</h3>
      </div>
    </div>
  );
}
