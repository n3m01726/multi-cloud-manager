// frontend/src/components/Tags/TagManager.jsx
import { useState, useEffect } from 'react';
import { X, Tag as TagIcon, Palette, Star } from 'lucide-react';
import TagBadge from './TagBadge';
import TagInput from './TagInput';
import { metadataService } from '../../services/api';

const PREDEFINED_TAGS = [
  'Important',
  'Urgent',
  'À faire',
  'Travail',
  'Personnel',
  'Projet',
  'Archive',
  'Brouillon',
  'Final',
  'À revoir'
];

const COLOR_OPTIONS = [
  { name: 'blue', label: 'Bleu' },
  { name: 'green', label: 'Vert' },
  { name: 'yellow', label: 'Jaune' },
  { name: 'red', label: 'Rouge' },
  { name: 'purple', label: 'Violet' },
  { name: 'pink', label: 'Rose' },
  { name: 'gray', label: 'Gris' },
  { name: 'indigo', label: 'Indigo' }
];

export default function TagManager({ 
  file, 
  userId, 
  isOpen, 
  onClose, 
  onUpdate 
}) {
  const [tags, setTags] = useState([]);
  const [tagColors, setTagColors] = useState({});
  const [customName, setCustomName] = useState('');
  const [description, setDescription] = useState('');
  const [starred, setStarred] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && file) {
      loadMetadata();
    }
  }, [isOpen, file]);

  const loadMetadata = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await metadataService.getMetadata(
        userId, 
        file.id, 
        file.provider
      );

      if (response.success && response.metadata) {
        setTags(response.metadata.tags || []);
        setCustomName(response.metadata.customName || '');
        setDescription(response.metadata.description || '');
        setStarred(response.metadata.starred || false);
        
        // Charger les couleurs des tags
        const colors = {};
        (response.metadata.tags || []).forEach((tag, index) => {
          colors[tag] = COLOR_OPTIONS[index % COLOR_OPTIONS.length].name;
        });
        setTagColors(colors);
      }
    } catch (err) {
      console.error('Erreur chargement métadonnées:', err);
      setError('Impossible de charger les métadonnées');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = async (tag) => {
    const newTags = [...tags, tag];
    setTags(newTags);
    
    // Assigner une couleur aléatoire au nouveau tag
    setTagColors(prev => ({
      ...prev,
      [tag]: COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)].name
    }));

    await saveMetadata({ tags: newTags });
  };

  const handleRemoveTag = async (tagToRemove) => {
    const newTags = tags.filter(t => t !== tagToRemove);
    setTags(newTags);
    
    // Supprimer la couleur associée
    setTagColors(prev => {
      const newColors = { ...prev };
      delete newColors[tagToRemove];
      return newColors;
    });

    await saveMetadata({ tags: newTags });
  };

  const handleChangeTagColor = (tag, color) => {
    setTagColors(prev => ({
      ...prev,
      [tag]: color
    }));
  };

  const saveMetadata = async (updates = {}) => {
    setSaving(true);
    setError(null);

    try {
      const metadata = {
        tags: updates.tags !== undefined ? updates.tags : tags,
        customName: updates.customName !== undefined ? updates.customName : customName,
        description: updates.description !== undefined ? updates.description : description,
        starred: updates.starred !== undefined ? updates.starred : starred,
        tagColors: { ...tagColors, ...(updates.tagColors || {}) }
      };

      // Utiliser updateMetadata pour sauvegarder toutes les métadonnées
      await metadataService.updateMetadata(
        userId,
        file.id,
        file.provider,
        metadata
      );

      onUpdate?.(metadata);
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      setError('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <TagIcon className="w-5 h-5 text-indigo-600" />
            Métadonnées du fichier
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-600">Chargement...</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Nom du fichier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fichier
              </label>
              <p className="text-gray-900 font-medium">{file.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                {file.provider === 'google_drive' ? 'Google Drive' : 'Dropbox'}
              </p>
            </div>

            {/* Nom personnalisé */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom personnalisé (optionnel)
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onBlur={() => saveMetadata({ customName })}
                placeholder={file.name}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => saveMetadata({ description })}
                placeholder="Ajoutez une description..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Favoris */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const newStarred = !starred;
                  setStarred(newStarred);
                  saveMetadata({ starred: newStarred });
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  starred 
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Star className={`w-5 h-5 ${starred ? 'fill-yellow-500' : ''}`} />
                <span className="font-medium">
                  {starred ? 'Favori' : 'Ajouter aux favoris'}
                </span>
              </button>
            </div>

            {/* Tags existants */}
            {tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags actuels
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag) => (
                    <div key={tag} className="group relative">
                      <TagBadge
                        tag={tag}
                        color={tagColors[tag] || 'blue'}
                        onRemove={handleRemoveTag}
                      />
                      
                      {/* Color picker tooltip */}
                      <div className="absolute top-full mt-1 left-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
                          <div className="flex gap-1">
                            {COLOR_OPTIONS.map(({ name, label }) => (
                              <button
                                key={name}
                                onClick={() => handleChangeTagColor(tag, name)}
                                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                                  tagColors[tag] === name ? 'border-gray-400' : 'border-transparent'
                                }`}
                                style={{
                                  backgroundColor: name === 'blue' ? '#dbeafe' :
                                    name === 'green' ? '#dcfce7' :
                                    name === 'yellow' ? '#fef9c3' :
                                    name === 'red' ? '#fee2e2' :
                                    name === 'purple' ? '#f3e8ff' :
                                    name === 'pink' ? '#fce7f3' :
                                    name === 'gray' ? '#f3f4f6' :
                                    '#e0e7ff'
                                }}
                                title={label}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ajouter un tag */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ajouter des tags
              </label>
              <TagInput
                onAddTag={handleAddTag}
                existingTags={tags}
                suggestions={PREDEFINED_TAGS}
              />
              
              {/* Suggestions de tags */}
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">Suggestions :</p>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_TAGS.filter(t => !tags.includes(t)).slice(0, 5).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleAddTag(tag)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Statut de sauvegarde */}
            {saving && (
              <div className="text-center text-sm text-gray-600">
                <div className="inline-block w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                Sauvegarde en cours...
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}