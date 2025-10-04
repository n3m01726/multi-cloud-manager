import { Home, ChevronRight } from 'lucide-react';

export default function Breadcrumbs({ folderHistory, currentFolder, files, onNavigate }) {
  const currentFolderName = files.find(f => f.id === currentFolder)?.name || '';

  return (
    <div className="flex items-center justify-center gap-2 mb-4 text-sm bg-gray-50 px-4 py-2 rounded-lg">
      <button onClick={() => onNavigate(null)} className="flex items-center gap-1">
        <Home className="w-4 h-4 text-gray-400" />
        <span className="text-gray-600">Home</span>
      </button>

      {folderHistory.map((folder) => (
        <div key={folder.id} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <button onClick={() => onNavigate(folder.id)} className="font-medium text-gray-900">
            {folder.name}
          </button>
        </div>
      ))}

      {currentFolderName && folderHistory.length > 0 && (
        <>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900">{currentFolderName}</span>
        </>
      )}
    </div>
  );
}
