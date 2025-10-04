// backend/src/routes/files.js
const express = require('express');
const router = express.Router();
const { prisma } = require('../config/database');
const GoogleDriveConnector = require('../connectors/googleDrive');
const DropboxConnector = require('../connectors/dropbox');
const { tokenRefreshMiddleware } = require('../middleware/tokenRefresh');

// Middleware pour refresh des tokens
router.use(tokenRefreshMiddleware);

/**
 * --------------------------
 * Liste des fichiers
 * --------------------------
 * GET /files/:userId
 */
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { folderId } = req.query;

  try {
    const cloudAccounts = await prisma.cloudAccount.findMany({ where: { userId } });
    if (!cloudAccounts || cloudAccounts.length === 0) {
      return res.json({ success: true, files: [], message: 'Aucun service cloud connecté' });
    }

    let allFiles = [];

    for (const account of cloudAccounts) {
      try {
        if (account.provider === 'google_drive') {
          const gdrive = new GoogleDriveConnector(account.accessToken, account.refreshToken, userId);
          const files = await gdrive.listFiles(folderId || 'root');
          if (Array.isArray(files)) allFiles = allFiles.concat(files);

        } else if (account.provider === 'dropbox') {
          if (!account.accessToken) continue;
          const dropbox = new DropboxConnector(account.accessToken);
          try {
            const files = await dropbox.listFiles(folderId || '');
            if (Array.isArray(files)) allFiles = allFiles.concat(files);
          } catch (err) {
            if (err.error?.['.tag'] === 'expired_access_token') {
              console.warn(`Token Dropbox expiré pour l'utilisateur ${userId}`);
            } else {
              console.error(`Erreur Dropbox pour l'utilisateur ${userId}:`, err.message);
            }
          }
        }
      } catch (err) {
        console.error(`Erreur pour ${account.provider}:`, err.message);
      }
    }

    res.json({
      success: true,
      files: allFiles,
      count: allFiles.length,
      message: allFiles.length === 0 ? 'Aucun fichier trouvé' : undefined
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des fichiers' });
  }
});

/**
 * --------------------------
 * Recherche des fichiers
 * --------------------------
 * GET /files/:userId/search?q=query
 */
router.get('/:userId/search', async (req, res) => {
  const { userId } = req.params;
  const { q } = req.query;

  if (!q?.trim()) return res.status(400).json({ success: false, error: 'Le paramètre de recherche "q" est requis' });

  try {
    const cloudAccounts = await prisma.cloudAccount.findMany({ where: { userId } });
    if (!cloudAccounts || cloudAccounts.length === 0) {
      return res.json({ success: true, files: [], message: 'Aucun service cloud connecté' });
    }

    let searchResults = [];

    for (const account of cloudAccounts) {
      try {
        if (account.provider === 'google_drive') {
          const gdrive = new GoogleDriveConnector(account.accessToken, account.refreshToken, userId);
          const files = await gdrive.search(q);
          if (Array.isArray(files)) searchResults = searchResults.concat(files);

        } else if (account.provider === 'dropbox') {
          if (!account.accessToken) continue;
          const dropbox = new DropboxConnector(account.accessToken);
          try {
            const files = await dropbox.search(q);
            if (Array.isArray(files)) searchResults = searchResults.concat(files);
          } catch (err) {
            if (err.error?.['.tag'] === 'expired_access_token') {
              console.warn(`Token Dropbox expiré pour l'utilisateur ${userId}`);
            } else {
              console.error(`Erreur Dropbox pour l'utilisateur ${userId}:`, err.message);
            }
          }
        }
      } catch (err) {
        console.error(`Erreur pour ${account.provider}:`, err.message);
      }
    }

    res.json({
      success: true,
      files: searchResults,
      count: searchResults.length,
      query: q,
      message: searchResults.length === 0 ? `Aucun fichier trouvé pour "${q}"` : undefined
    });

  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la recherche' });
  }
});

// backend/src/routes/files.js
// REMPLACER la route /starred existante par celle-ci

/**
 * GET /files/:userId/starred
 * Récupère tous les fichiers marqués comme favoris (starred) dans les métadonnées locales
 */
router.get('/:userId/starred', async (req, res) => {
  const { userId } = req.params;

  try {
    // Récupérer tous les fichiers marqués starred dans les métadonnées
    const starredMetadata = await prisma.fileMetadata.findMany({
      where: {
        userId: userId,
        starred: true
      }
    });

    if (starredMetadata.length === 0) {
      return res.json({ 
        success: true, 
        files: [], 
        count: 0,
        message: 'Aucun fichier favori' 
      });
    }

    // Récupérer les comptes cloud
    const cloudAccounts = await prisma.cloudAccount.findMany({ 
      where: { userId } 
    });

    if (cloudAccounts.length === 0) {
      return res.json({ 
        success: true, 
        files: [], 
        message: 'Aucun service cloud connecté' 
      });
    }

    let allFiles = [];

    // Pour chaque métadonnée starred, récupérer les infos du fichier depuis le cloud
    for (const metadata of starredMetadata) {
      try {
        const account = cloudAccounts.find(acc => acc.provider === metadata.cloudType);
        
        if (!account) continue;

        let fileInfo = null;

        if (metadata.cloudType === 'google_drive') {
          const gdrive = new GoogleDriveConnector(
            account.accessToken, 
            account.refreshToken, 
            userId
          );
          
          try {
            fileInfo = await gdrive.getFileMetadata(metadata.fileId);
          } catch (error) {
            console.warn(`Fichier ${metadata.fileId} introuvable dans Google Drive`);
            continue;
          }

        } else if (metadata.cloudType === 'dropbox') {
          const dropbox = new DropboxConnector(account.accessToken);
          
          try {
            // Dropbox utilise le path au lieu de l'ID
            // On doit chercher le fichier ou le stocker dans metadata
            // Pour l'instant, on skip si on n'a pas le path
            console.warn(`Dropbox favorites non encore supporté pour ${metadata.fileId}`);
            continue;
          } catch (error) {
            console.warn(`Fichier ${metadata.fileId} introuvable dans Dropbox`);
            continue;
          }
        }

        if (fileInfo) {
          // Enrichir avec les métadonnées locales
          allFiles.push({
            ...fileInfo,
            tags: JSON.parse(metadata.tags || '[]'),
            customName: metadata.customName,
            description: metadata.description,
            starred: true
          });
        }

      } catch (error) {
        console.error(`Erreur récupération fichier ${metadata.fileId}:`, error.message);
      }
    }

    res.json({ 
      success: true, 
      files: allFiles,
      count: allFiles.length,
      message: allFiles.length === 0 ? 'Fichiers favoris introuvables dans les clouds' : undefined
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers favoris:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la récupération des fichiers favoris' 
    });
  }
});

/**
 * --------------------------
 * Métadonnées d'un fichier
 * --------------------------
 */
router.get('/:userId/metadata/:provider/:fileId', async (req, res) => {
  const { userId, provider, fileId } = req.params;

  try {
    const account = await prisma.cloudAccount.findUnique({
      where: { userId_provider: { userId, provider } }
    });
    if (!account) return res.status(404).json({ success: false, error: 'Service cloud non connecté' });

    if (provider === 'google_drive') {
      const gdrive = new GoogleDriveConnector(account.accessToken, account.refreshToken);
      const metadata = await gdrive.getFileMetadata(fileId);
      return res.json({ success: true, file: metadata });
    }

    res.status(400).json({ success: false, error: 'Provider non supporté' });

  } catch (error) {
    console.error('Erreur lors de la récupération des métadonnées:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des métadonnées' });
  }
});

/**
 * --------------------------
 * Prévisualisation d'un fichier
 * --------------------------
 */
router.get('/:userId/preview/:provider/:fileId', async (req, res) => {
  const { userId, provider, fileId } = req.params;

  try {
    const account = await prisma.cloudAccount.findUnique({
      where: { userId_provider: { userId, provider } }
    });
    if (!account) return res.status(404).json({ success: false, error: 'Service cloud non connecté' });

    if (provider === 'google_drive') {
      const gdrive = new GoogleDriveConnector(account.accessToken, account.refreshToken);
      const previewData = await gdrive.getPreviewUrl(fileId, userId);
      return res.json({ success: true, preview: previewData });
    }

    res.status(400).json({ success: false, error: 'Provider non supporté pour la prévisualisation' });

  } catch (error) {
    console.error('Erreur lors de la récupération de la prévisualisation:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération de la prévisualisation' });
  }
});

/**
 * --------------------------
 * Déplacement / Copie / Téléchargement
 * --------------------------
 */
router.post('/:userId/move', async (req, res) => {
  const { userId } = req.params;
  const { provider, fileId, newParentId, oldParentId } = req.body;

  if (!provider || !fileId || !newParentId) {
    return res.status(400).json({ success: false, error: 'provider, fileId et newParentId sont requis' });
  }

  try {
    const account = await prisma.cloudAccount.findUnique({
      where: { userId_provider: { userId, provider } }
    });
    if (!account) return res.status(404).json({ success: false, error: 'Service cloud non connecté' });

    if (provider === 'google_drive') {
      const gdrive = new GoogleDriveConnector(account.accessToken, account.refreshToken);
      const result = await gdrive.moveFile(fileId, newParentId, oldParentId);
      return res.json({ success: true, result });
    }

    res.status(400).json({ success: false, error: 'Provider non supporté pour le déplacement' });
  } catch (error) {
    console.error('Erreur lors du déplacement:', error);
    res.status(500).json({ success: false, error: 'Erreur lors du déplacement du fichier' });
  }
});

router.post('/:userId/copy', async (req, res) => {
  const { userId } = req.params;
  const { provider, fileId, newParentId, newName } = req.body;

  if (!provider || !fileId || !newParentId) {
    return res.status(400).json({ success: false, error: 'provider, fileId et newParentId sont requis' });
  }

  try {
    const account = await prisma.cloudAccount.findUnique({
      where: { userId_provider: { userId, provider } }
    });
    if (!account) return res.status(404).json({ success: false, error: 'Service cloud non connecté' });

    if (provider === 'google_drive') {
      const gdrive = new GoogleDriveConnector(account.accessToken, account.refreshToken);
      const result = await gdrive.copyFile(fileId, newParentId, newName);
      return res.json({ success: true, result });
    }

    res.status(400).json({ success: false, error: 'Provider non supporté pour la copie' });
  } catch (error) {
    console.error('Erreur lors de la copie:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la copie du fichier' });
  }
});

router.post('/:userId/download', async (req, res) => {
  const { userId } = req.params;
  const { provider, fileId, fileName } = req.body;

  if (!provider || !fileId) return res.status(400).json({ success: false, error: 'provider et fileId sont requis' });

  try {
    const account = await prisma.cloudAccount.findUnique({
      where: { userId_provider: { userId, provider } }
    });
    if (!account) return res.status(404).json({ success: false, error: 'Service cloud non connecté' });

    if (provider === 'google_drive') {
      const gdrive = new GoogleDriveConnector(account.accessToken, account.refreshToken);
      const fileBuffer = await gdrive.downloadFile(fileId);

      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName || 'download'}"`);
      res.send(fileBuffer);
    } else {
      res.status(400).json({ success: false, error: 'Provider non supporté' });
    }
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    res.status(500).json({ success: false, error: 'Erreur lors du téléchargement' });
  }
});

module.exports = router;
