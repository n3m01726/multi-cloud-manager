import React, { useState } from 'react';
import { Move, Copy, Trash2, MoreVertical, X } from 'lucide-react';
import { filesService } from '../../../services/api';
import FolderSelector from './FolderSelector';

export default function FileActions({ 
  file, 
  userId, 
  isOpen, 
  onClose, 
  onSuccess,
  onError 
}) {
  const [showFolderSelector, setShowFolderSelector] = useState(false);
  const [action, setAction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAction = (actionType) => {
    setAction(actionType);
    setShowFolderSelector(true);
  };

  const handleFolderSelect = async (folder) => {
    if (!action) return;

    setLoading(true);
    try {
      let response;
      
      if (action === 'move') {
        response = await filesService.moveFile(
          userId, 
          file.provider, 
          file.id, 
          folder.id
        );
      } else if (action === 'copy') {
        response = await filesService.copyFile(
          userId, 
          file.provider, 
          file.id, 
          folder.id
        );
      }

      if (response.success) {
        onSuccess?.(action, response.result);
        onClose();
      } else {
        onError?.(response.error || 'Erreur lors de l\'opération');
      }
    } catch (err) {
      console.error('Erreur lors de l\'opération:', err);
      onError?.(err.message || 'Erreur lors de l\'opération');
    } finally {
      setLoading(false);
      setShowFolderSelector(false);
      setAction(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${file.name}" ?`)) {
      return;
    }

    setLoading(true);
    try {
      // Note: L'API de suppression n'est pas encore implémentée
      // Vous pouvez l'ajouter si nécessaire
      onError?.('Fonction de suppression non implémentée');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      onError?.(err.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      
      <div className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 min-w-48">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Actions</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="py-2">
          <button
            onClick={() => handleAction('move')}
            disabled={loading}
            className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Move className="w-4 h-4 text-gray-600" />
            <span>Déplacer</span>
          </button>

          <button
            onClick={() => handleAction('copy')}
            disabled={loading}
            className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Copy className="w-4 h-4 text-gray-600" />
            <span>Copier</span>
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-red-50 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            <span>Supprimer</span>
          </button>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="px-3 py-2 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span>Traitement en cours...</span>
            </div>
          </div>
        )}
      </div>

      {/* Folder Selector */}
      <FolderSelector
        isOpen={showFolderSelector}
        onClose={() => {
          setShowFolderSelector(false);
          setAction(null);
        }}
        onSelect={handleFolderSelect}
        userId={userId}
        currentProvider={file.provider}
        title={action === 'move' ? 'Déplacer vers...' : 'Copier vers...'}
      />
    </>
  );
}
