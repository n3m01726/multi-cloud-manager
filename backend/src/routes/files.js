// Routes de gestion des fichiers
const express = require('express');
const router = express.Router();
const { prisma } = require('../config/database');
const GoogleDriveConnector = require('../connectors/googleDrive');
const DropboxConnector = require('../connectors/dropbox');
const { tokenRefreshMiddleware } = require('../middleware/tokenRefresh');

// Appliquer le middleware de refresh des tokens à toutes les routes
router.use(tokenRefreshMiddleware);

/**
 * GET /files/:userId
 * Récupère la liste de tous les fichiers de Google Drive et Dropbox
 */
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { folderId } = req.query; // Optionnel : pour naviguer dans les dossiers

  try {
    // Récupérer les comptes cloud de l'utilisateur
    const cloudAccounts = await prisma.cloudAccount.findMany({
      where: { userId: userId }
    });

    if (cloudAccounts.length === 0) {
      return res.json({ 
        success: true, 
        files: [],
        message: 'Aucun service cloud connecté' 
      });
    }

    let allFiles = [];

    // Parcourir chaque compte cloud
    for (const account of cloudAccounts) {
      try {
        if (account.provider === 'google_drive') {
          const gdrive = new GoogleDriveConnector(
            account.accessToken, 
            account.refreshToken,
            userId
          );
          
          const files = await gdrive.listFiles(folderId || 'root');
          allFiles = allFiles.concat(files);
        } else if (account.provider === 'dropbox') {
          const dropbox = new DropboxConnector(account.accessToken);
          const path = folderId || '';
          const files = await dropbox.listFiles(path);
          allFiles = allFiles.concat(files);
        }
      } catch (error) {
        console.error(`Erreur pour ${account.provider}:`, error.message);
        // Continuer avec les autres services même si un échoue
      }
    }

    res.json({ 
      success: true, 
      files: allFiles,
      count: allFiles.length 
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la récupération des fichiers' 
    });
  }
});

/**
 * GET /files/:userId/search
 * Recherche des fichiers dans tous les services cloud
 */
router.get('/:userId/search', async (req, res) => {
  const { userId } = req.params;
  const { q } = req.query;

  if (!q || q.trim().length === 0) {
    return res.status(400).json({ 
      success: false, 
      error: 'Le paramètre de recherche "q" est requis' 
    });
  }

  try {
    const cloudAccounts = await prisma.cloudAccount.findMany({
      where: { userId: userId }
    });

    if (cloudAccounts.length === 0) {
      return res.json({ 
        success: true, 
        files: [],
        message: 'Aucun service cloud connecté' 
      });
    }

    let searchResults = [];

    // Rechercher dans chaque service
    for (const account of cloudAccounts) {
      try {
        if (account.provider === 'google_drive') {
          const gdrive = new GoogleDriveConnector(
            account.accessToken, 
            account.refreshToken,
            userId
          );
          
          const files = await gdrive.search(q);
          searchResults = searchResults.concat(files);
        } else if (account.provider === 'dropbox') {
          const dropbox = new DropboxConnector(account.accessToken);
          const files = await dropbox.search(q);
          searchResults = searchResults.concat(files);
        }
      } catch (error) {
        console.error(`Erreur de recherche pour ${account.provider}:`, error.message);
      }
    }

    res.json({ 
      success: true, 
      files: searchResults,
      count: searchResults.length,
      query: q 
    });

  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la recherche' 
    });
  }
});

/**
 * GET /files/:userId/metadata/:provider/:fileId
 * Récupère les métadonnées d'un fichier spécifique
 */
router.get('/:userId/metadata/:provider/:fileId', async (req, res) => {
  const { userId, provider, fileId } = req.params;

  try {
    const account = await prisma.cloudAccount.findUnique({
      where: {
        userId_provider: {
          userId: userId,
          provider: provider
        }
      }
    });

    if (!account) {
      return res.status(404).json({ 
        success: false, 
        error: 'Service cloud non connecté' 
      });
    }

    if (provider === 'google_drive') {
      const gdrive = new GoogleDriveConnector(
        account.accessToken, 
        account.refreshToken
      );
      
      const metadata = await gdrive.getFileMetadata(fileId);
      
      res.json({ 
        success: true, 
        file: metadata 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'Provider non supporté' 
      });
    }

  } catch (error) {
    console.error('Erreur lors de la récupération des métadonnées:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la récupération des métadonnées' 
    });
  }
});

/**
 * GET /files/:userId/preview/:provider/:fileId
 * Récupère l'URL de prévisualisation d'un fichier
 */
router.get('/:userId/preview/:provider/:fileId', async (req, res) => {
  const { userId, provider, fileId } = req.params;

  try {
    const account = await prisma.cloudAccount.findUnique({
      where: {
        userId_provider: {
          userId: userId,
          provider: provider
        }
      }
    });

    if (!account) {
      return res.status(404).json({ 
        success: false, 
        error: 'Service cloud non connecté' 
      });
    }

    if (provider === 'google_drive') {
      const gdrive = new GoogleDriveConnector(
        account.accessToken, 
        account.refreshToken
      );
      
      const previewData = await gdrive.getPreviewUrl(fileId, userId);
      
      res.json({ 
        success: true, 
        preview: previewData
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'Provider non supporté pour la prévisualisation' 
      });
    }

  } catch (error) {
    console.error('Erreur lors de la récupération de la prévisualisation:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la récupération de la prévisualisation' 
    });
  }
});

/**
 * GET /files/preview-proxy/:provider/:fileId
 * Proxy pour servir les fichiers avec authentification
 */
router.get('/preview-proxy/:provider/:fileId', async (req, res) => {
  const { provider, fileId } = req.params;
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ 
      success: false, 
      error: 'userId requis' 
    });
  }

  try {
    const account = await prisma.cloudAccount.findUnique({
      where: {
        userId_provider: {
          userId: userId,
          provider: provider
        }
      }
    });

    if (!account) {
      return res.status(404).json({ 
        success: false, 
        error: 'Service cloud non connecté' 
      });
    }

    if (provider === 'google_drive') {
      const gdrive = new GoogleDriveConnector(
        account.accessToken, 
        account.refreshToken
      );
      
      // Récupérer le fichier depuis Google Drive
      const fileBuffer = await gdrive.drive.files.get(
        { fileId: fileId, alt: 'media' },
        { responseType: 'stream' }
      );

      // Définir les headers appropriés
      res.setHeader('Content-Type', fileBuffer.headers['content-type'] || 'application/octet-stream');
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache 1 heure
      
      // Streamer le fichier
      fileBuffer.data.pipe(res);
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'Provider non supporté' 
      });
    }

  } catch (error) {
    console.error('Erreur lors du proxy de prévisualisation:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la récupération du fichier' 
    });
  }
});

/**
 * POST /files/:userId/move
 * Déplace un fichier vers un autre dossier
 */
router.post('/:userId/move', async (req, res) => {
  const { userId } = req.params;
  const { provider, fileId, newParentId, oldParentId } = req.body;

  if (!provider || !fileId || !newParentId) {
    return res.status(400).json({ 
      success: false, 
      error: 'provider, fileId et newParentId sont requis' 
    });
  }

  try {
    const account = await prisma.cloudAccount.findUnique({
      where: {
        userId_provider: {
          userId: userId,
          provider: provider
        }
      }
    });

    if (!account) {
      return res.status(404).json({ 
        success: false, 
        error: 'Service cloud non connecté' 
      });
    }

    if (provider === 'google_drive') {
      const gdrive = new GoogleDriveConnector(
        account.accessToken, 
        account.refreshToken
      );
      
      const result = await gdrive.moveFile(fileId, newParentId, oldParentId);
      
      res.json({ 
        success: true, 
        result: result
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'Provider non supporté pour le déplacement' 
      });
    }

  } catch (error) {
    console.error('Erreur lors du déplacement:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors du déplacement du fichier' 
    });
  }
});

/**
 * POST /files/:userId/copy
 * Copie un fichier vers un autre dossier
 */
router.post('/:userId/copy', async (req, res) => {
  const { userId } = req.params;
  const { provider, fileId, newParentId, newName } = req.body;

  if (!provider || !fileId || !newParentId) {
    return res.status(400).json({ 
      success: false, 
      error: 'provider, fileId et newParentId sont requis' 
    });
  }

  try {
    const account = await prisma.cloudAccount.findUnique({
      where: {
        userId_provider: {
          userId: userId,
          provider: provider
        }
      }
    });

    if (!account) {
      return res.status(404).json({ 
        success: false, 
        error: 'Service cloud non connecté' 
      });
    }

    if (provider === 'google_drive') {
      const gdrive = new GoogleDriveConnector(
        account.accessToken, 
        account.refreshToken
      );
      
      const result = await gdrive.copyFile(fileId, newParentId, newName);
      
      res.json({ 
        success: true, 
        result: result
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'Provider non supporté pour la copie' 
      });
    }

  } catch (error) {
    console.error('Erreur lors de la copie:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la copie du fichier' 
    });
  }
});

/**
 * POST /files/:userId/download
 * Télécharge un fichier depuis un service cloud
 */
router.post('/:userId/download', async (req, res) => {
  const { userId } = req.params;
  const { provider, fileId, fileName } = req.body;

  if (!provider || !fileId) {
    return res.status(400).json({ 
      success: false, 
      error: 'provider et fileId sont requis' 
    });
  }

  try {
    const account = await prisma.cloudAccount.findUnique({
      where: {
        userId_provider: {
          userId: userId,
          provider: provider
        }
      }
    });

    if (!account) {
      return res.status(404).json({ 
        success: false, 
        error: 'Service cloud non connecté' 
      });
    }

    if (provider === 'google_drive') {
      const gdrive = new GoogleDriveConnector(
        account.accessToken, 
        account.refreshToken
      );
      
      const fileBuffer = await gdrive.downloadFile(fileId);
      
      // Envoyer le fichier en réponse
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName || 'download'}"`);
      res.send(fileBuffer);
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'Provider non supporté' 
      });
    }

  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors du téléchargement' 
    });
  }
});

module.exports = router;