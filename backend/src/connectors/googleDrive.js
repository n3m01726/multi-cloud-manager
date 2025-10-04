// Connecteur pour Google Drive API
const { google } = require('googleapis');
const { createAuthenticatedGoogleClient } = require('../config/oauth');

/**
 * Classe pour gérer les interactions avec Google Drive
 */
class GoogleDriveConnector {
  constructor(accessToken, refreshToken = null, userId = null) {
    this.auth = createAuthenticatedGoogleClient(accessToken, refreshToken, userId);
    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }

  /**
   * Liste les fichiers d'un dossier Google Drive
   * @param {string} folderId - ID du dossier (optionnel, 'root' par défaut)
   * @param {number} pageSize - Nombre de résultats par page
   * @returns {Promise<Array>} Liste des fichiers
   */
  async listFiles(folderId = 'root', pageSize = 100) {
    try {
      // Construction de la requête
      const query = folderId === 'root' 
        ? "'root' in parents and trashed = false"
        : `'${folderId}' in parents and trashed = false`;

      const response = await this.drive.files.list({
        q: query,
        pageSize: pageSize,
        fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, createdTime, iconLink, webViewLink, parents)',
        orderBy: 'folder,name', // Dossiers en premier, puis tri alphabétique
      });

      const files = response.data.files || [];

      // Formater les fichiers pour une structure unifiée
      return files.map(file => ({
        id: file.id,
        name: file.name,
        type: file.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
        mimeType: file.mimeType,
        size: file.size ? parseInt(file.size) : 0,
        modifiedTime: file.modifiedTime,
        createdTime: file.createdTime,
        iconLink: file.iconLink,
        webViewLink: file.webViewLink,
        provider: 'google_drive',
        path: folderId === 'root' ? '/' : folderId,
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers Google Drive:', error.message);
      throw new Error(`Google Drive API error: ${error.message}`);
    }
  }

  /**
   * Recherche des fichiers dans Google Drive
   * @param {string} query - Terme de recherche
   * @param {number} pageSize - Nombre de résultats
   * @returns {Promise<Array>} Fichiers correspondants
   */
  async search(query, pageSize = 50) {
    try {
      const searchQuery = `name contains '${query}' and trashed = false`;

      const response = await this.drive.files.list({
        q: searchQuery,
        pageSize: pageSize,
        fields: 'files(id, name, mimeType, size, modifiedTime, iconLink, webViewLink)',
        orderBy: 'modifiedTime desc',
      });

      const files = response.data.files || [];

      return files.map(file => ({
        id: file.id,
        name: file.name,
        type: file.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
        mimeType: file.mimeType,
        size: file.size ? parseInt(file.size) : 0,
        modifiedTime: file.modifiedTime,
        iconLink: file.iconLink,
        webViewLink: file.webViewLink,
        provider: 'google_drive',
      }));
    } catch (error) {
      console.error('Erreur lors de la recherche dans Google Drive:', error.message);
      throw new Error(`Google Drive search error: ${error.message}`);
    }
  }

  /**
   * Télécharge un fichier depuis Google Drive
   * @param {string} fileId - ID du fichier
   * @returns {Promise<Buffer>} Contenu du fichier
   */
  async downloadFile(fileId) {
    try {
      const response = await this.drive.files.get(
        { fileId: fileId, alt: 'media' },
        { responseType: 'stream' }
      );

      // Conversion du stream en buffer
      return new Promise((resolve, reject) => {
        const chunks = [];
        response.data.on('data', chunk => chunks.push(chunk));
        response.data.on('end', () => resolve(Buffer.concat(chunks)));
        response.data.on('error', reject);
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement depuis Google Drive:', error.message);
      throw new Error(`Download error: ${error.message}`);
    }
  }

  /**
   * Upload un fichier vers Google Drive
   * @param {Buffer} fileBuffer - Contenu du fichier
   * @param {string} fileName - Nom du fichier
   * @param {string} mimeType - Type MIME
   * @param {string} folderId - ID du dossier parent (optionnel)
   * @returns {Promise<Object>} Métadonnées du fichier uploadé
   */
  async uploadFile(fileBuffer, fileName, mimeType, folderId = null) {
    try {
      const fileMetadata = {
        name: fileName,
        parents: folderId ? [folderId] : ['root'],
      };

      const media = {
        mimeType: mimeType,
        body: require('stream').Readable.from(fileBuffer),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, mimeType, size',
      });

      return {
        id: response.data.id,
        name: response.data.name,
        mimeType: response.data.mimeType,
        size: response.data.size,
        provider: 'google_drive',
      };
    } catch (error) {
      console.error('Erreur lors de l\'upload vers Google Drive:', error.message);
      throw new Error(`Upload error: ${error.message}`);
    }
  }

  /**
   * Récupère les informations d'un fichier
   * @param {string} fileId - ID du fichier
   * @returns {Promise<Object>} Métadonnées du fichier
   */
  async getFileMetadata(fileId) {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, size, modifiedTime, createdTime, webViewLink',
      });

      return {
        id: response.data.id,
        name: response.data.name,
        type: response.data.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
        mimeType: response.data.mimeType,
        size: response.data.size ? parseInt(response.data.size) : 0,
        modifiedTime: response.data.modifiedTime,
        createdTime: response.data.createdTime,
        webViewLink: response.data.webViewLink,
        provider: 'google_drive',
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des métadonnées:', error.message);
      throw new Error(`Metadata error: ${error.message}`);
    }
  }

  /**
   * Génère une URL de prévisualisation pour un fichier Google Drive
   * @param {string} fileId - ID du fichier
   * @param {string} userId - ID de l'utilisateur (pour l'URL proxy)
   * @returns {Promise<Object>} URLs de prévisualisation et métadonnées
   */
  async getPreviewUrl(fileId, userId = null) {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, size, webViewLink, webContentLink, thumbnailLink',
      });

      const file = response.data;
      const mimeType = file.mimeType;

      // Pour les documents Google (Docs, Sheets, Slides), utiliser webViewLink
      if (mimeType.includes('google-apps')) {
        return {
          id: file.id,
          name: file.name,
          mimeType: mimeType,
          previewUrl: file.webViewLink,
          downloadUrl: file.webContentLink,
          thumbnailUrl: file.thumbnailLink,
          provider: 'google_drive',
        };
      }

      // Pour les autres fichiers, utiliser l'URL proxy du backend
      const previewUrl = userId 
        ? `/files/preview-proxy/google_drive/${fileId}?userId=${userId}`
        : `/files/preview-proxy/google_drive/${fileId}`;

      return {
        id: file.id,
        name: file.name,
        mimeType: mimeType,
        previewUrl: previewUrl,
        downloadUrl: file.webContentLink,
        thumbnailUrl: file.thumbnailLink,
        provider: 'google_drive',
      };
    } catch (error) {
      console.error('Erreur lors de la génération de l\'URL de prévisualisation:', error.message);
      throw new Error(`Preview URL error: ${error.message}`);
    }
  }

  /**
   * Déplace un fichier vers un autre dossier
   * @param {string} fileId - ID du fichier à déplacer
   * @param {string} newParentId - ID du nouveau dossier parent
   * @param {string} oldParentId - ID de l'ancien dossier parent (optionnel)
   * @returns {Promise<Object>} Métadonnées du fichier déplacé
   */
  async moveFile(fileId, newParentId, oldParentId = null) {
    try {
      // Si oldParentId n'est pas fourni, récupérer les parents actuels
      if (!oldParentId) {
        const fileResponse = await this.drive.files.get({
          fileId: fileId,
          fields: 'parents'
        });
        oldParentId = fileResponse.data.parents[0];
      }

      // Déplacer le fichier
      const response = await this.drive.files.update({
        fileId: fileId,
        addParents: newParentId,
        removeParents: oldParentId,
        fields: 'id, name, parents, webViewLink'
      });

      return {
        id: response.data.id,
        name: response.data.name,
        parents: response.data.parents,
        webViewLink: response.data.webViewLink,
        provider: 'google_drive',
        success: true
      };
    } catch (error) {
      console.error('Erreur lors du déplacement du fichier:', error.message);
      throw new Error(`Move file error: ${error.message}`);
    }
  }

  /**
   * Copie un fichier vers un autre dossier
   * @param {string} fileId - ID du fichier à copier
   * @param {string} newParentId - ID du dossier de destination
   * @param {string} newName - Nouveau nom pour la copie (optionnel)
   * @returns {Promise<Object>} Métadonnées du fichier copié
   */
  async copyFile(fileId, newParentId, newName = null) {
    try {
      const copyMetadata = {
        parents: [newParentId]
      };

      if (newName) {
        copyMetadata.name = newName;
      }

      const response = await this.drive.files.copy({
        fileId: fileId,
        requestBody: copyMetadata,
        fields: 'id, name, parents, webViewLink'
      });

      return {
        id: response.data.id,
        name: response.data.name,
        parents: response.data.parents,
        webViewLink: response.data.webViewLink,
        provider: 'google_drive',
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la copie du fichier:', error.message);
      throw new Error(`Copy file error: ${error.message}`);
    }
  }
}

module.exports = GoogleDriveConnector;