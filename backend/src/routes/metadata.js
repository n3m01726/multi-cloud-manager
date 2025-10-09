// backend/src/routes/metadata.js
const express = require('express');
const router = express.Router();
const { prisma } = require('../config/database');

/**
 * PUT /metadata/:userId/:fileId/tags
 * Ajoute/modifie les tags d'un fichier
 */
router.put('/:userId/:fileId/tags', async (req, res) => {
  const { userId, fileId } = req.params;
  const { tags, tagColors, cloudType } = req.body;

  if (!Array.isArray(tags)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Les tags doivent être un tableau' 
    });
  }

  try {
    const updateData = { 
      tags: JSON.stringify(tags), 
      updatedAt: new Date() 
    };

    // Ajouter tagColors si fourni
    if (tagColors) {
      updateData.tagColors = JSON.stringify(tagColors);
    }

    const metadata = await prisma.fileMetadata.upsert({
      where: {
        userId_fileId_cloudType: {
          userId,
          fileId,
          cloudType
        }
      },
      update: updateData,
      create: {
        userId,
        fileId,
        cloudType,
        ...updateData
      }
    });

    // Décoder les tags et tagColors pour la réponse
    const responseMetadata = {
      ...metadata,
      tags: JSON.parse(metadata.tags || '[]'),
      tagColors: metadata.tagColors ? JSON.parse(metadata.tagColors) : {}
    };

    console.log('✅ Tags sauvegardés:', responseMetadata);
    res.json({ success: true, metadata: responseMetadata });
  } catch (error) {
    console.error('❌ Erreur mise à jour tags:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /metadata/:userId/:fileId
 * Récupère les métadonnées d'un fichier
 */
router.get('/:userId/:fileId', async (req, res) => {
  const { userId, fileId } = req.params;
  const { cloudType } = req.query;

  console.log('📖 GET Metadata:', { userId, fileId, cloudType });

  if (!cloudType) {
    return res.status(400).json({ 
      success: false, 
      error: 'cloudType est requis' 
    });
  }

  try {
    const metadata = await prisma.fileMetadata.findUnique({
      where: {
        userId_fileId_cloudType: {
          userId,
          fileId,
          cloudType
        }
      }
    });

    // Décoder les tags et tagColors si metadata existe
    const responseMetadata = metadata ? {
      ...metadata,
      tags: JSON.parse(metadata.tags || '[]'),
      tagColors: metadata.tagColors ? JSON.parse(metadata.tagColors) : {}
    } : null;

    console.log('✅ Métadonnées trouvées:', responseMetadata);

    res.json({ 
      success: true, 
      metadata: responseMetadata 
    });
  } catch (error) {
    console.error('❌ Erreur récupération métadonnées:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * PUT /metadata/:userId/:fileId
 * Met à jour toutes les métadonnées d'un fichier
 */
router.put('/:userId/:fileId', async (req, res) => {
  const { userId, fileId } = req.params;
  const { 
    cloudType, 
    tags, 
    tagColors,  // ⚠️ AJOUT IMPORTANT
    customName, 
    description, 
    starred, 
    color 
  } = req.body;

  console.log('📝 UPDATE Metadata:', { userId, fileId, cloudType });
  console.log('📦 Données reçues:', req.body);

  if (!cloudType) {
    return res.status(400).json({ 
      success: false, 
      error: 'cloudType est requis' 
    });
  }

  try {
    const updateData = {};
    if (tags !== undefined) updateData.tags = JSON.stringify(tags);
    if (tagColors !== undefined) updateData.tagColors = JSON.stringify(tagColors);  // ⚠️ AJOUT IMPORTANT
    if (customName !== undefined) updateData.customName = customName;
    if (description !== undefined) updateData.description = description;
    if (starred !== undefined) updateData.starred = starred;
    if (color !== undefined) updateData.color = color;
    updateData.updatedAt = new Date();

    const metadata = await prisma.fileMetadata.upsert({
      where: {
        userId_fileId_cloudType: {
          userId,
          fileId,
          cloudType
        }
      },
      update: updateData,
      create: {
        userId,
        fileId,
        cloudType,
        ...updateData
      }
    });

    // Décoder les tags et tagColors pour la réponse
    const responseMetadata = {
      ...metadata,
      tags: JSON.parse(metadata.tags || '[]'),
      tagColors: metadata.tagColors ? JSON.parse(metadata.tagColors) : {}
    };

    console.log('✅ Métadonnées sauvegardées:', responseMetadata);
    res.json({ success: true, metadata: responseMetadata });
  } catch (error) {
    console.error('❌ Erreur mise à jour métadonnées:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /metadata/:userId/search
 * Recherche des fichiers par tags
 */
router.get('/:userId/search', async (req, res) => {
  const { userId } = req.params;
  const { tags, cloudType, starred } = req.query;

  try {
    const where = { userId };

    // Filtrer par tags (recherche dans la chaîne JSON)
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim());
      where.tags = {
        contains: tagArray[0] // Recherche simple pour commencer
      };
    }

    // Filtrer par cloudType
    if (cloudType) {
      where.cloudType = cloudType;
    }

    // Filtrer par favoris
    if (starred === 'true') {
      where.starred = true;
    }

    const results = await prisma.fileMetadata.findMany({
      where,
      orderBy: { updatedAt: 'desc' }
    });

    // Décoder les tags et tagColors pour chaque résultat
    const decodedResults = results.map(metadata => ({
      ...metadata,
      tags: JSON.parse(metadata.tags || '[]'),
      tagColors: metadata.tagColors ? JSON.parse(metadata.tagColors) : {}
    }));

    res.json({ success: true, results: decodedResults });
  } catch (error) {
    console.error('Erreur recherche métadonnées:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /metadata/:userId/tags/popular
 * Récupère les tags les plus utilisés par l'utilisateur
 */
router.get('/:userId/tags/popular', async (req, res) => {
  const { userId } = req.params;
  const { limit = 10 } = req.query;

  try {
    const metadata = await prisma.fileMetadata.findMany({
      where: { userId },
      select: { tags: true }
    });

    // Compter la fréquence de chaque tag
    const tagCounts = {};
    metadata.forEach(m => {
      const tags = JSON.parse(m.tags || '[]');
      tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Trier par fréquence décroissante
    const sortedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, parseInt(limit))
      .map(([tag, count]) => ({ tag, count }));

    res.json({ success: true, tags: sortedTags });
  } catch (error) {
    console.error('Erreur récupération tags populaires:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /metadata/:userId/stats
 * Statistiques sur les métadonnées de l'utilisateur
 */
router.get('/:userId/stats', async (req, res) => {
  const { userId } = req.params;

  try {
    const totalFiles = await prisma.fileMetadata.count({
      where: { userId }
    });

    const starredFiles = await prisma.fileMetadata.count({
      where: { userId, starred: true }
    });

    const filesWithTags = await prisma.fileMetadata.count({
      where: { 
        userId,
        tags: {
          not: null
        }
      }
    });

    const filesWithDescription = await prisma.fileMetadata.count({
      where: { 
        userId,
        description: {
          not: null
        }
      }
    });

    res.json({ 
      success: true, 
      stats: {
        totalFiles,
        starredFiles,
        filesWithTags,
        filesWithDescription,
        taggingRate: totalFiles > 0 ? (filesWithTags / totalFiles * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Erreur récupération stats:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * DELETE /metadata/:userId/:fileId
 * Supprime les métadonnées d'un fichier
 */
router.delete('/:userId/:fileId', async (req, res) => {
  const { userId, fileId } = req.params;
  const { cloudType } = req.query;

  if (!cloudType) {
    return res.status(400).json({ 
      success: false, 
      error: 'cloudType est requis' 
    });
  }

  try {
    await prisma.fileMetadata.delete({
      where: {
        userId_fileId_cloudType: {
          userId,
          fileId,
          cloudType
        }
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression métadonnées:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;