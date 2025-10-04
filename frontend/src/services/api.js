// Service API pour communiquer avec le backend
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Instance axios configurée
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erreur API:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Service d'authentification
 */
export const authService = {
  // Obtenir l'URL d'authentification Google
  async getGoogleAuthUrl() {
    const response = await api.get('/auth/google');
    return response.data;
  },

  // 🔹 Obtenir l'URL d'authentification Dropbox
  async getDropboxAuthUrl() {
    const response = await api.get('/auth/dropbox');
    return response.data;
  },

  // Vérifier le statut de connexion
  async checkStatus(userId) {
    const response = await api.get(`/auth/status/${userId}`);
    return response.data;
  },

  // Déconnecter un service
  async disconnect(userId, provider) {
    const response = await api.delete(`/auth/disconnect/${userId}/${provider}`);
    return response.data;
  },
};

/**
 * Service de gestion des fichiers
 */
export const filesService = {
  // Lister tous les fichiers
  async listFiles(userId, folderId = null) {
    const url = folderId 
      ? `/files/${userId}?folderId=${folderId}` 
      : `/files/${userId}`;
    const response = await api.get(url);
    return response.data;
  },

  // Rechercher des fichiers
  async searchFiles(userId, query) {
    const response = await api.get(`/files/${userId}/search`, {
      params: { q: query }
    });
    return response.data;
  },

  // Récupérer les métadonnées d'un fichier
  async getFileMetadata(userId, provider, fileId) {
    const response = await api.get(`/files/${userId}/metadata/${provider}/${fileId}`);
    return response.data;
  },

  // Télécharger un fichier
  async downloadFile(userId, provider, fileId, fileName) {
    const response = await api.post(
      `/files/${userId}/download`,
      { provider, fileId, fileName },
      { responseType: 'blob' }
    );
    
    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  },

  // Obtenir l'URL de prévisualisation d'un fichier
  async getPreviewUrl(userId, provider, fileId) {
    const response = await api.get(`/files/${userId}/preview/${provider}/${fileId}`);
    return response.data;
  },

  // Déplacer un fichier
  async moveFile(userId, provider, fileId, newParentId, oldParentId = null) {
    const response = await api.post(`/files/${userId}/move`, {
      provider,
      fileId,
      newParentId,
      oldParentId
    });
    return response.data;
  },

  // Copier un fichier
  async copyFile(userId, provider, fileId, newParentId, newName = null) {
    const response = await api.post(`/files/${userId}/copy`, {
      provider,
      fileId,
      newParentId,
      newName
    });
    return response.data;
  },
};

/**
 * Service de métadonnées (mise à jour)
 */
export const metadataService = {
  /**
   * Met à jour les tags d’un fichier ou dossier
   * @param {string} userId
   * @param {string} fileId
   * @param {string} cloudType
   * @param {Array} tags
   * @param {Object} options { itemType: "file" | "folder", cascade: boolean }
   */
  async updateTags(userId, fileId, cloudType, tags, options = {}) {
    const { itemType = 'file', cascade = false } = options;

    const response = await api.put(
      `/metadata/${userId}/${fileId}/tags?cascade=${cascade}`,
      {
        tags,
        cloudType,
        itemType
      }
    );

    return response.data;
  },

  /**
   * Récupère les métadonnées d’un fichier ou dossier
   */
  async getMetadata(userId, fileId, cloudType) {
    const response = await api.get(`/metadata/${userId}/${fileId}`, {
      params: { cloudType }
    });
    return response.data;
  },

  /**
   * Met à jour toutes les métadonnées d’un fichier ou dossier
   */
  async updateMetadata(userId, fileId, cloudType, metadata) {
    const response = await api.put(`/metadata/${userId}/${fileId}`, {
      cloudType,
      ...metadata
    });
    return response.data;
  },

  /**
   * Recherche des fichiers ou dossiers par tags
   */
  async searchByTags(userId, tags, cloudType = null, itemType = null) {
    const params = { tags: tags.join(',') };
    if (cloudType) params.cloudType = cloudType;
    if (itemType) params.itemType = itemType; // facultatif pour filtrer

    const response = await api.get(`/metadata/${userId}/search`, { params });
    return response.data;
  },

  /**
   * Récupère tous les fichiers et dossiers favoris (starred) pour tous les providers
   */
  async getStarred(userId) {
    const providers = ['google_drive', 'dropbox'];
    const allResults = await Promise.all(
      providers.map(async (cloudType) => {
        const params = { starred: 'true', cloudType };
        const response = await api.get(`/metadata/${userId}/search`, { params });
        return response.data.results || [];
      })
    );
    return allResults.flat();
  }
};