// frontend/src/components/FileExplorer/partials/FileItem.jsx
// REMPLACER le fichier existant par cette version améliorée

import { useState, useEffect } from "react";
import { Folder, File, Download, Image, Music, Film, FileText, RefreshCw, MoreVertical, Star, Tag as TagIcon } from "lucide-react";
import FilePreviewModal from "./FilePreviewModal";
import FileActions from "./FileActions";
import TagManager from "../../Tags/TagManager";
import TagBadge from "../../Tags/TagBadge";
import { metadataService } from "../../../services/api";

const fileIcons = {
  jpg: Image,
  jpeg: Image,
  png: Image,
  gif: Image,
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  xls: FileText,
  xlsx: FileText,
  mp3: Music,
  mp4: Film,
  default: File,
};

export default function FileItem({ 
  file, 
  userId, 
  onFolderClick, 
  onDownload, 
  downloading, 
  onFileMoved, 
  onFileCopied 
}) {
  const [showPreview, setShowPreview] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  const ext = file.name.split('.').pop().toLowerCase();
  const IconComponent = file.type === 'folder' ? Folder : (fileIcons[ext] || fileIcons.default);

  // Charger les métadonnées au montage du composant
  useEffect(() => {
    loadMetadata();
  }, [file.id]);

  const loadMetadata = async () => {
    setLoadingMetadata(true);
    try {
      const response = await metadataService.getMetadata(
        userId,
        file.id,
        file.provider
      );
      
      if (response.success && response.metadata) {
        setMetadata(response.metadata);
      }
    } catch (error) {
      console.error('Erreur chargement métadonnées:', error);
    } finally {
      setLoadingMetadata(false);
    }
  };

  const handleShare = (file) => {
    navigator.clipboard.writeText(file.url);
    alert("Lien copié !");
  };

  const handlePrint = (file) => {
    window.open(file.url, "_blank")?.print();
  };

  const handleActionSuccess = (action, result) => {
    if (action === 'move') {
      onFileMoved?.(file, result);
    } else if (action === 'copy') {
      onFileCopied?.(file, result);
    }
  };

  const handleActionError = (error) => {
    alert(`Erreur: ${error}`);
  };

  const handleMetadataUpdate = (newMetadata) => {
    setMetadata(newMetadata);
  };

  const displayName = metadata?.customName || file.name;
  const tags = metadata?.tags || [];
  const tagColors = metadata?.tagColors || {};
  const starred = metadata?.starred || false;

  return (
    <>
      <div
        className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group ${
          file.type === 'folder' ? 'cursor-pointer' : ''
        } ${starred ? 'ring-2 ring-yellow-400' : ''}`}
        onClick={() => {
          if (file.type === 'folder') onFolderClick(file);
          else setShowPreview(true);
        }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <IconComponent className={`w-8 h-8 ${file.type === 'folder' ? 'text-blue-500' : 'text-gray-400'} flex-shrink-0`} />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">{displayName}</h3>
              {starred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
            </div>
                       {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.slice(0, 3).map((tag) => (
                  <TagBadge 
                    key={tag} 
                    tag={tag} 
                    size="sm"
                    color={tagColors[tag] || 'blue'}
                  />
                ))}
                {tags.length > 3 && (
                  <span className="text-xs text-gray-500 px-2 py-0.5">
                    +{tags.length - 3} autres
                  </span>
                )}
              </div>
            )}
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                file.provider === 'google_drive' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {file.provider === 'google_drive' ? 'Google Drive' : 'Dropbox'}
              </span>
              {file.type !== 'folder' && <span>{file.size ? `${file.size} octets` : 'N/A'}</span>}
            </div>


            {/* Description */}
            {metadata?.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                {metadata.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Bouton Tags - pour fichiers ET dossiers */}
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              setShowTagManager(true); 
            }}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
            title="Gérer les tags"
          >
            <TagIcon className="w-5 h-5" />
          </button>
          {/* Bouton Download */}
          {file.type !== 'folder' && (
            <button
              onClick={(e) => { e.stopPropagation(); onDownload(file); }}
              disabled={downloading === file.id}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-100"
            >
              {downloading === file.id ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
            </button>
          )}
          {/* Bouton Actions */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowActions(true); }}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <FilePreviewModal
          file={file}
          userId={userId}
          onClose={() => setShowPreview(false)}
          onDownload={onDownload}
          onShare={handleShare}
          onPrint={handlePrint}
        />
      )}

      {/* Actions Modal */}
      {showActions && (
        <FileActions
          file={file}
          userId={userId}
          isOpen={showActions}
          onClose={() => setShowActions(false)}
          onSuccess={handleActionSuccess}
          onError={handleActionError}
        />
      )}

      {/* Tag Manager Modal */}
      {showTagManager && (
        <TagManager
          file={file}
          userId={userId}
          isOpen={showTagManager}
          onClose={() => setShowTagManager(false)}
          onUpdate={handleMetadataUpdate}
        />
      )}
    </>
  );
}