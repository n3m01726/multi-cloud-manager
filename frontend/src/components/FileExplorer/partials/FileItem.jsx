// frontend/src/components/FileExplorer/partials/FileItem.jsx
import { useState, useEffect } from "react";
import { Folder, File, Download, Image, Music, Film, FileText, RefreshCw, MoreVertical, Star, Tag, Info } from "lucide-react";
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
  webp: Image,
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  xls: FileText,
  xlsx: FileText,
  mp3: Music,
  wav: Music,
  mp4: Film,
  mov: Film,
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
  const [showTooltip, setShowTooltip] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  const ext = file.name.split('.').pop().toLowerCase();
  const IconComponent = file.type === 'folder' ? Folder : (fileIcons[ext] || fileIcons.default);

  useEffect(() => {
    loadMetadata();
  }, [file.id, file.provider, userId]);

  const loadMetadata = async () => {
    setLoadingMetadata(true);
    try {
      const response = await metadataService.getMetadata(userId, file.id, file.provider);
      
      if (response.success && response.metadata) {
        setMetadata(response.metadata);
      } else {
        setMetadata(null);
      }
    } catch (error) {
      console.error('Erreur chargement métadonnées:', error);
      setMetadata(null);
    } finally {
      setLoadingMetadata(false);
    }
  };

  const handleShare = (file) => {
    navigator.clipboard.writeText(file.webViewLink || file.url || '');
    alert("Lien copié !");
  };

  const handlePrint = (file) => {
    window.open(file.webViewLink || file.url, "_blank")?.print();
  };

  const handleActionSuccess = (action, result) => {
    if (action === 'move') {
      onFileMoved?.(file, result);
    } else if (action === 'copy') {
      onFileCopied?.(file, result);
    }
  };

  const handleCloseTagManager = () => {
    setShowTagManager(false);
    setTimeout(() => loadMetadata(), 100);
  };

  const handleItemClick = () => {
    if (file.type === 'folder') {
      onFolderClick(file);
    } else {
      setShowPreview(true);
    }
  };

  const handleTagClick = (e) => {
    e.stopPropagation();
    setShowTagManager(true);
  };

  const handleActionsClick = (e) => {
    e.stopPropagation();
    setShowActions(true);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
    return `Il y a ${Math.floor(diffDays / 365)} ans`;
  };

  const displayName = metadata?.customName || file.name;
  const tags = metadata?.tags || [];
  const tagColors = metadata?.tagColors || {};
  const starred = metadata?.starred || false;

  // Tooltip content
  const TooltipContent = () => (
    <div className="absolute left-0 top-full mt-2 z-50 bg-gray-900 text-white text-xs rounded-lg shadow-xl p-3 min-w-[280px] max-w-[400px]">
      {/* Triangle pointer */}
      <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
      
      <div className="space-y-2">
        {/* Nom complet */}
        <div>
          <p className="font-semibold text-sm mb-1 break-words">{displayName}</p>
          {metadata?.customName && metadata.customName !== file.name && (
            <p className="text-gray-400 text-xs">Original: {file.name}</p>
          )}
        </div>

        {/* Description */}
        {metadata?.description && (
          <p className="text-gray-300 text-xs leading-relaxed border-t border-gray-700 pt-2">
            {metadata.description}
          </p>
        )}

        {/* Infos fichier */}
        <div className="border-t border-gray-700 pt-2 space-y-1">
          {file.size && (
            <div className="flex justify-between">
              <span className="text-gray-400">Taille:</span>
              <span className="text-white">{formatFileSize(file.size)}</span>
            </div>
          )}
          
          {file.type !== 'folder' && (
            <div className="flex justify-between">
              <span className="text-gray-400">Type:</span>
              <span className="text-white uppercase">{ext}</span>
            </div>
          )}
          
          {file.modifiedTime && (
            <div className="flex justify-between">
              <span className="text-gray-400">Modifié:</span>
              <span className="text-white">{formatDate(file.modifiedTime)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-400">Source:</span>
            <span className="text-white capitalize">{file.provider?.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="border-t border-gray-700 pt-2">
            <p className="text-gray-400 text-xs mb-1.5">Tags:</p>
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => {
                const color = tagColors[tag] || 'blue';
                const colorClasses = {
                  blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                  green: 'bg-green-500/20 text-green-300 border-green-500/30',
                  red: 'bg-red-500/20 text-red-300 border-red-500/30',
                  yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
                  purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                  pink: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
                  indigo: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
                  gray: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                };
                
                return (
                  <span 
                    key={tag} 
                    className={`px-1.5 py-0.5 rounded text-xs border ${colorClasses[color] || colorClasses.blue}`}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Hint */}
        <p className="text-gray-500 text-xs italic border-t border-gray-700 pt-2">
          {file.type === 'folder' ? 'Cliquez pour ouvrir le dossier' : 'Cliquez pour prévisualiser'}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <div
        className={`relative flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 hover:shadow-md transition-all duration-200 group ${
          file.type === 'folder' ? 'cursor-pointer' : 'cursor-pointer'
        } ${starred ? 'ring-2 ring-yellow-400 bg-yellow-50/30' : ''}`}
        onClick={handleItemClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative">
            <IconComponent 
              className={`w-8 h-8 ${
                file.type === 'folder' ? 'text-blue-500' : 'text-gray-400'
              } flex-shrink-0 transition-transform group-hover:scale-110`} 
            />
            {starred && (
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 absolute -top-1 -right-1" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium truncate max-w-[300px]">{displayName}</h3>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.slice(0, 3).map((tag) => {
                    const color = tagColors[tag] || 'blue';
                    return (
                      <TagBadge 
                        key={tag} 
                        tag={tag} 
                        size="sm"
                        color={color}
                      />
                    );
                  })}
                  {tags.length > 3 && (
                    <span className="text-xs text-gray-500 px-2 py-0.5">
                      +{tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              {file.size && file.type !== 'folder' && (
                <span>{formatFileSize(file.size)}</span>
              )}
              {file.modifiedTime && (
                <>
                  {file.size && file.type !== 'folder' && <span>•</span>}
                  <span>{formatDate(file.modifiedTime)}</span>
                </>
              )}
            </div>

            {metadata?.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                {metadata.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleTagClick}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all hover:scale-110"
            title="Gérer les tags"
          >
            <Tag className="w-5 h-5" />
          </button>
          
          {file.type !== 'folder' && (
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                onDownload(file); 
              }}
              disabled={downloading === file.id}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all hover:scale-110 disabled:opacity-100 disabled:hover:scale-100"
              title="Télécharger"
            >
              {downloading === file.id ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
            </button>
          )}
          
          <button
            onClick={handleActionsClick}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all hover:scale-110"
            title="Plus d'actions"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Tooltip amélioré */}
        {showTooltip && <TooltipContent />}
      </div>

      {showPreview && (
        <FilePreviewModal
          file={file}
          userId={userId}
          metadata={metadata}
          onClose={() => setShowPreview(false)}
          onDownload={onDownload}
          onShare={handleShare}
          onPrint={handlePrint}
        />
      )}

      {showActions && (
        <FileActions
          file={file}
          userId={userId}
          isOpen={showActions}
          onClose={() => setShowActions(false)}
          onSuccess={handleActionSuccess}
          onError={(error) => alert(`Erreur: ${error}`)}
        />
      )}

      {showTagManager && (
        <TagManager
          file={file}
          userId={userId}
          isOpen={showTagManager}
          onClose={handleCloseTagManager}
          onUpdate={(newMetadata) => setMetadata(newMetadata)}
        />
      )}
    </>
  );
}