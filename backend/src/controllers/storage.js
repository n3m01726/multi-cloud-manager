// backend/src/controllers/storage.js
import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Récupère les stats de stockage pour tous les clouds connectés
 */
export async function getStorageStats(req, res) {
  try {
    const userId = req.user.id; // Depuis votre middleware d'auth

    // Récupérer toutes les connexions cloud de l'utilisateur
    const connections = await prisma.cloudConnection.findMany({
      where: { userId },
      select: {
        id: true,
        provider: true,
        accessToken: true,
        refreshToken: true
      }
    });

    if (connections.length === 0) {
      return res.json({
        connected: 0,
        usedBytes: 0,
        totalBytes: 0
      });
    }

    // Récupérer les infos de stockage pour chaque cloud
    const storagePromises = connections.map(async (conn) => {
      try {
        if (conn.provider === 'google') {
          return await getGoogleDriveStorage(conn.accessToken);
        }
        if (conn.provider === 'dropbox') {
          return await getDropboxStorage(conn.accessToken);
        }
        // Ajouter d'autres providers ici
        return { used: 0, total: 0 };
      } catch (error) {
        console.error(`Error fetching storage for ${conn.provider}:`, error);
        return { used: 0, total: 0 };
      }
    });

    const storageResults = await Promise.all(storagePromises);

    // Agréger les résultats
    const totalStats = storageResults.reduce(
      (acc, curr) => ({
        used: acc.used + curr.used,
        total: acc.total + curr.total
      }),
      { used: 0, total: 0 }
    );

    res.json({
      connected: connections.length,
      usedBytes: totalStats.used,
      totalBytes: totalStats.total
    });

  } catch (error) {
    console.error('Error fetching storage stats:', error);
    res.status(500).json({ error: 'Failed to fetch storage stats' });
  }
}

/**
 * Récupère les infos de stockage Google Drive
 */
async function getGoogleDriveStorage(accessToken) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const response = await drive.about.get({
    fields: 'storageQuota'
  });

  const quota = response.data.storageQuota;
  
  return {
    used: parseInt(quota.usage || 0),
    total: parseInt(quota.limit || 0)
  };
}

/**
 * Récupère les infos de stockage Dropbox
 */
async function getDropboxStorage(accessToken) {
  const response = await fetch('https://api.dropboxapi.com/2/users/get_space_usage', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Dropbox API error');
  }

  const data = await response.json();
  
  return {
    used: data.used,
    total: data.allocation.allocated
  };
}

// Ajouter d'autres fonctions pour MEGA, OneDrive, etc.