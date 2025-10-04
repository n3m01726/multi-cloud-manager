// frontend/src/components/FileExplorer/partials/TagFilter.jsx
// CRÉER ce nouveau fichier

import { useState, useEffect } from 'react';
import { Filter, X, Tag } from 'lucide-react';
import TagBadge from '../../Tags/TagBadge';
import { metadataService } from '../../../services/api';

export default function TagFilter({ userId, onFilterChange, activeFilters = [] }) {
  const [showFilter, setShowFilter] = useState(false);
  const [popularTags, setPopularTags] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPopularTags();
  }, [userId]);

  const loadPopularTags = async () => {
    setLoading(true);
    try {
      const response = await metadataService.getPopularTags(userId, 20);
      if (response.success) {
        setPopularTags(response.tags);
      }
    } catch (error) {
      console.error('Erreur chargement tags populaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTag = (tag) => {
    if (activeFilters.includes(tag)) {
      onFilterChange(activeFilters.filter(t => t !== tag));
    } else {
      onFilterChange([...activeFilters, tag]);
    }
  };

  const handleClearFilters = () => {
    onFilterChange([]);
  };

  return (
    <div className="relative">
      {/* Bouton Filter */}
      <button
        onClick={() => setShowFilter(!showFilter)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          activeFilters.length > 0
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <Filter className="w-4 h-4" />
        <span className="hidden sm:inline">Filtrer par tags</span>
        {activeFilters.length > 0 && (
          <span className="bg-white text-indigo-600 px-2 py-0.5 rounded-full text-xs font-bold">
            {activeFilters.length}
          </span>
        )}
      </button>

      {/* Dropdown des tags */}
      {showFilter && (
        <>
          {/* Overlay pour fermer */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowFilter(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-96 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Filtrer par tags
                </h3>
                <button
                  onClick={() => setShowFilter(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Filtres actifs */}
              {activeFilters.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Filtres actifs :</span>
                    <button
                      onClick={handleClearFilters}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Tout effacer
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.map(tag => (
                      <TagBadge
                        key={tag}
                        tag={tag}
                        size="sm"
                        color="indigo"
                        onRemove={() => handleToggleTag(tag)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Liste des tags */}
            <div className="p-4">
              {loading ? (
                <div className="text-center py-4">
                  <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
              ) : popularTags.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Tag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucun tag disponible</p>
                  <p className="text-xs mt-1">Ajoutez des tags à vos fichiers pour les filtrer</p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-600 mb-3">
                    Tags disponibles ({popularTags.length})
                  </p>
                  <div className="space-y-2">
                    {popularTags.map(({ tag, count }) => (
                      <button
                        key={tag}
                        onClick={() => handleToggleTag(tag)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                          activeFilters.includes(tag)
                            ? 'bg-indigo-50 border-2 border-indigo-500'
                            : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            activeFilters.includes(tag) ? 'bg-indigo-600' : 'bg-gray-400'
                          }`} />
                          <span className="font-medium">{tag}</span>
                        </div>
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                          {count} fichier{count > 1 ? 's' : ''}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}