import { useState } from "react";
import { Folder, File, Download, Image, Music, Film, FileText, RefreshCw, MoreVertical } from "lucide-react";
import FilePreviewModal from "./FilePreviewModal";
import FileActions from "./FileActions";

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

export default function FileItem({ file, userId, onFolderClick, onDownload, downloading, onFileMoved, onFileCopied }) {
  const [showPreview, setShowPreview] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const ext = file.name.split('.').pop().toLowerCase();
  const IconComponent = file.type === 'folder' ? Folder : (fileIcons[ext] || fileIcons.default);

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

  return (
    <>
      <div
        className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group ${file.type === 'folder' ? 'cursor-pointer' : ''}`}
        onClick={() => {
          if (file.type === 'folder') onFolderClick(file);
          else setShowPreview(true);
        }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <IconComponent className={`w-8 h-8 ${file.type === 'folder' ? 'text-blue-500' : 'text-gray-400'} flex-shrink-0`} />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{file.name}</h3>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${file.provider === 'google_drive' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {file.provider === 'google_drive' ? 'Google Drive' : 'Dropbox'}
              </span>
              {file.type !== 'folder' && <span>{file.size ? `${file.size} octets` : 'N/A'}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
          {file.type !== 'folder' && (
            <button
              onClick={(e) => { e.stopPropagation(); onDownload(file); }}
              disabled={downloading === file.id}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-100"
            >
              {downloading === file.id ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            </button>
          )}
          
          <button
            onClick={(e) => { e.stopPropagation(); setShowActions(true); }}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

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
    </>
  );
}
