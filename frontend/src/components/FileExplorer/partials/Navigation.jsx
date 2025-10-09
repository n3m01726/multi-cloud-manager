import { ArrowLeft, Home } from 'lucide-react';

export default function Navigation({ folderHistory, currentFolderName, onBack, onHome, onBreadcrumbClick }) {
  // Si nous sommes à la racine et qu'il n'y a pas d'historique, ne pas afficher la navigation
  if (folderHistory.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-200 bg-gray-50">
      {/* GAUCHE : Back + Home */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-8 h-8 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          title="Retour"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onHome}
          className="flex items-center justify-center w-8 h-8 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          title="Accueil"
        >
          <Home className="w-4 h-4" />
        </button>
      </div>

      {/* CENTRE : Breadcrumb */}
      <div className="flex-1 flex items-center min-w-0">
        <div className="flex items-center gap-2 text-sm truncate">
          {folderHistory.map((folder, index) => (
            <div key={index} className="flex items-center gap-1">
              <button
                onClick={() => onBreadcrumbClick && onBreadcrumbClick(index)}
                className="text-blue-600 hover:text-blue-800 hover:underline truncate"
              >
                {folder.name}
              </button>
              {index < folderHistory.length - 0 && (
                <span className="text-gray-400 ml-1">/</span>
              )}
            </div>
          ))}
          {currentFolderName && (
            <span className="font-medium text-gray-900 truncate">{currentFolderName}</span>
          )}
        </div>
      </div>
    </div>
  );
}
