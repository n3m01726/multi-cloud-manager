import FileItem from './FileItem';
import { RefreshCw, File } from 'lucide-react';

export default function Files({ files, loading, userId, onFolderClick, onDownload, downloading, onFileMoved, onFileCopied }) {
  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500 border-b border-gray-200">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
        Chargement des fichiers...
      </div>
    );
  }

  if (!files.length) {
    return (
      <div className="text-center py-12 text-gray-500 border-b border-gray-200">
        <File className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Aucun fichier trouvé</p>
      </div>
    );
  }

  return (
    <div className="border-b border-gray-200">
      <div className="p-6 space-y-2">
        {files.map(file => (
          <FileItem
            key={`${file.provider}-${file.id}`}
            file={file}
            userId={userId}
            onFolderClick={onFolderClick}
            onDownload={onDownload}
            downloading={downloading}
            onFileMoved={onFileMoved}
            onFileCopied={onFileCopied}
          />
        ))}
      </div>
    </div>
  );
}