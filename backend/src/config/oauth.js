// config/oauth.js
const { google } = require('googleapis');
const axios = require('axios');
const qs = require('querystring');

/** ==================== GOOGLE DRIVE ==================== **/

function createGoogleOAuthClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  return oauth2Client;
}

function getGoogleAuthUrl() {
  const oauth2Client = createGoogleOAuthClient();
  const scopes = [
    'https://www.googleapis.com/auth/drive', // Accès complet à Google Drive
    'https://www.googleapis.com/auth/userinfo.email', // Email de l'utilisateur
    'https://www.googleapis.com/auth/userinfo.profile', // Nom et photo de profil
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
}

async function getGoogleTokensFromCode(code) {
  const oauth2Client = createGoogleOAuthClient();
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    console.error('Erreur lors de l\'échange du code Google:', error.message);
    throw new Error('Impossible d\'obtenir les tokens Google');
  }
}

function createAuthenticatedGoogleClient(accessToken, refreshToken = null, userId = null) {
  const oauth2Client = createGoogleOAuthClient();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.refresh_token) {
      console.log('Nouveau refresh token Google reçu');
    }
    if (tokens.access_token) {
      console.log('Token d\'accès Google rafraîchi');
      
      // Mettre à jour le token en base de données si userId fourni
      if (userId) {
        try {
          const { prisma } = require('../config/database');
          await prisma.cloudAccount.update({
            where: {
              userId_provider: {
                userId: userId,
                provider: 'google_drive'
              }
            },
            data: {
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token || refreshToken,
              expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null
            }
          });
          console.log('Token Google mis à jour en base de données');
        } catch (error) {
          console.error('Erreur lors de la mise à jour du token Google:', error);
        }
      }
    }
  });

  return oauth2Client;
}

/** ==================== DROPBOX ==================== **/

/**
 * Génère l'URL d'authentification Dropbox avec scopes full Dropbox
 * @returns {string} URL d'authentification
 */
function getDropboxAuthUrl() {
  const clientId = process.env.DROPBOX_CLIENT_ID;
  const redirectUri = process.env.DROPBOX_REDIRECT_URI;

  // Ajouter les scopes nécessaires : lecture et écriture sur tous les fichiers
  const scopes = 'files.metadata.read files.content.read files.content.write';

  return `https://www.dropbox.com/oauth2/authorize?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `token_access_type=offline&` +
    `scope=${encodeURIComponent(scopes)}`;
}

/**
 * Échange le code OAuth Dropbox contre des tokens
 * @param {string} code - Code d'autorisation
 * @returns {Promise<Object>} access_token, refresh_token, expires_in
 */
async function getDropboxTokensFromCode(code) {
  const clientId = process.env.DROPBOX_CLIENT_ID;
  const clientSecret = process.env.DROPBOX_CLIENT_SECRET;
  const redirectUri = process.env.DROPBOX_REDIRECT_URI;

  try {
    const response = await axios.post(
      'https://api.dropboxapi.com/oauth2/token',
      qs.stringify({
        code,
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_in: response.data.expires_in,
    };
  } catch (error) {
    console.error('Erreur lors de l\'échange du code Dropbox:', error.response?.data || error.message);
    throw new Error('Impossible d\'obtenir les tokens Dropbox');
  }
}


async function getDropboxAccountInfo(accessToken) {
  try {
    const response = await axios.post(
      'https://api.dropboxapi.com/2/users/get_current_account',
      null,
      { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
    );

    return {
      email: response.data.email,
      name: response.data.name.display_name,
      account_id: response.data.account_id,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du compte Dropbox:', error.response?.data || error.message);
    throw new Error('Impossible de récupérer les infos du compte Dropbox');
  }
}

/**
 * Rafraîchit un token Dropbox expiré
 * @param {string} refreshToken - Token de rafraîchissement
 * @returns {Promise<Object>} Nouveaux tokens
 */
async function refreshDropboxToken(refreshToken) {
  const clientId = process.env.DROPBOX_CLIENT_ID;
  const clientSecret = process.env.DROPBOX_CLIENT_SECRET;

  try {
    const response = await axios.post(
      'https://api.dropboxapi.com/oauth2/token',
      qs.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token || refreshToken,
      expires_in: response.data.expires_in,
    };
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token Dropbox:', error.response?.data || error.message);
    throw new Error('Impossible de rafraîchir le token Dropbox');
  }
}

/** ==================== EXPORTS ==================== **/

module.exports = {
  // Google
  createGoogleOAuthClient,
  getGoogleAuthUrl,
  getGoogleTokensFromCode,
  createAuthenticatedGoogleClient,
  
  // Dropbox
  getDropboxAuthUrl,
  getDropboxTokensFromCode,
  getDropboxAccountInfo,
  refreshDropboxToken,
};