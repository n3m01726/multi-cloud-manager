// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Instance axios configurée
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Intercepteur pour log des erreurs
api.interceptors.response.use(
  response => response,
  error => {
    console.error('Erreur API:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// --------------------------
// Auth Service
// --------------------------
export const authService = {
  async getGoogleAuthUrl() {
    const res = await api.get('/auth/google');
    return res.data;
  },
  async getDropboxAuthUrl() {
    const res = await api.get('/auth/dropbox');
    return res.data;
  },
  async checkStatus(userId) {
    const res = await api.get(`/auth/status/${userId}`);
    return res.data;
  },
  async disconnect(userId, provider) {
    const res = await api.delete(`/auth/disconnect/${userId}/${provider}`);
    return res.data;
  },
  async getUserInfo(userId) {
    const res = await api.get(`/auth/user/info/${userId}`);
    return res.data;
  }
};

// --------------------------
// Files Service
// --------------------------
export const filesService = {
  async listFiles(userId, folderId = null) {
    const url = folderId ? `/files/${userId}?folderId=${folderId}` : `/files/${userId}`;
    const res = await api.get(url);
    return res.data;
  },

  async searchFiles(userId, query) {
    const res = await api.get(`/files/${userId}/search`, { params: { q: query } });
    return res.data;
  },

  async getFileMetadata(userId, provider, fileId) {
    const res = await api.get(`/files/${userId}/metadata/${provider}/${fileId}`);
    return res.data;
  },

  async downloadFile(userId, provider, fileId, fileName) {
    const res = await api.post(
      `/files/${userId}/download`,
      { provider, fileId, fileName },
      { responseType: 'blob' }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName || 'download');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return { success: true };
  },

  async getPreviewUrl(userId, provider, fileId) {
    const res = await api.get(`/files/${userId}/preview/${provider}/${fileId}`);
    return res.data;
  },

  async moveFile(userId, provider, fileId, newParentId, oldParentId = null) {
    const res = await api.post(`/files/${userId}/move`, { provider, fileId, newParentId, oldParentId });
    return res.data;
  },

  async copyFile(userId, provider, fileId, newParentId, newName = null) {
    const res = await api.post(`/files/${userId}/copy`, { provider, fileId, newParentId, newName });
    return res.data;
  },

  /**
   * 🔹 Obtenir tous les fichiers favoris (starred) pour tous les providers
   */
  async getStarred(userId) {
    const res = await api.get(`/files/${userId}/starred`);
    return res.data;
  }
};

// --------------------------
// Metadata Service
// --------------------------
export const metadataService = {
  async updateTags(userId, fileId, cloudType, tags, options = {}) {
    const { itemType = 'file', cascade = false } = options;
    const res = await api.put(
      `/metadata/${userId}/${fileId}/tags?cascade=${cascade}`,
      { tags, cloudType, itemType }
    );
    return res.data;
  },

  async getMetadata(userId, fileId, cloudType) {
    const res = await api.get(`/metadata/${userId}/${fileId}`, { params: { cloudType } });
    return res.data;
  },

  async updateMetadata(userId, fileId, cloudType, metadata) {
    const res = await api.put(`/metadata/${userId}/${fileId}`, { cloudType, ...metadata });
    return res.data;
  },

  async searchByTags(userId, tags, cloudType = null, itemType = null) {
    const params = { tags: tags.join(',') };
    if (cloudType) params.cloudType = cloudType;
    if (itemType) params.itemType = itemType;
    const res = await api.get(`/metadata/${userId}/search`, { params });
    return res.data;
  }
};