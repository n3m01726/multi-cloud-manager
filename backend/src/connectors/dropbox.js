// Connecteur pour Dropbox API
const axios = require('axios');

/**
 * Classe pour gérer les interactions avec Dropbox
 */
class DropboxConnector {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.apiUrl = 'https://api.dropboxapi.com/2';
    this.contentUrl = 'https://content.dropboxapi.com/2';
  }

  // sl.u.AGCZUWLXDuZ4Iv_smQKSNUiddAA42tJpNlgHrTUEzxCdHoP-AaioGrJGIKvTHqoyo7iIVCsGPRYew7bHC2EW_gBthPr1k4dnQBy373h-Va3qy3_va0sFQDVTvG-EFQTSWEwZhctJHLr9QMLGtJ_2kzB9r4AUS_rMRmki0NocReTxPN5iJ3VIYiyAr6rP3f9OQTQAeurxwBirr3CRzyHHJWEfe9bSIlZBsQMPpjZ2LO-c2BBgObLHmffObTC5Nvep-WNtFkclN3vREiuN9b-i6uLuBn9eofm2EEYDPjx7DqMEA4-ELBjiZnoycp5q1-QlNlz9OR9FXgT6q79QDs7Djwd95UZFGavHZMHj1m15LdFQ-5gKpova1F2IgTnZFykkqANHBebxldwALwHF60iuvWW2SBC6fZZQPdVPTL9LtWCHHJiGSeaY1WMWK2sa19mcw2prZFDdw4PUzyRDus8RyAm5xOCtKfZfWpnfNBii0IR72mw2vTihbv1Ba6Sb6qdGOlumUybfuab1skRY4zC5dxjGjDA1Fz9JuTVwXW97UpVcpgmtdIG2XYStkf9bJgReocDnJvq144_LPTBFAoB3_9naaJmGz_OkuRGglsxvHDcDYTQccZFjF12IjqYxz2E1GEkv6MwSKmmhTdN7Jg-TXSAiTIZdhhY3NzQ61jO0v0D4YdX9hR6MOTEK1MItl7BHFHN1E3jlXpDyiKJEXdikl8aMshJimzUU5yGdGeRIPKlYWV-MyocXF_CfoB17pE6ZKlEkD01-8O8ZQWS2sQGlYogG1m8mthnnUFfCtpEpzVIR5wt2hDLox1aXlv3zdze5aTdAFiNQwkMb7K-GlTaWoHJ9Tkw-UAZNiM-gexnFEQlrf9QWBvImCnQ-2J9q3QLS53XO6AAN9ZonvHKeAUIZR-MJxnprjrjqxAiH6bpjH-fMcVinfs-CfHHR4baIMwpxkXuAnIpSLLkK33D0LM5srJ776FE0kvsVRphg1GgT4Ou5G9fXR3npxnPp6iqv3qbdVoZFjhc-EUdbceNAj_NHTKQRPn51tP3_GjS7hn_uqw1d0Eqo7dsJq-NrD0Ri9h4I-gfmwcitTCCn0C08NsJlS4JvmxWxEZRYQYZ6wZpI7VErVty6ZMXnPYVUkM1O_2fTwBYL9rmLMdU142og9BIJlGQ1aKalUWV5b0pwY_HkTBj2lKchAfx6812jJFLrOc9uertyv-OPSShN4CSpw3w9Nx4CuqSCEEcb04yxZVjuupDJ7s-RBGGqILJowcPBDoiqeCXQaXMeoDM-Yqj6cdLy9VL1G4mD9cDstG0qj3im6KFF6AadZMZ6cmc69nAu-01JY9OSz53BmrWjMPp-1-ZfyhfyZHZX3JMMXXI8z0rBRBNLmofrlQl5P-2Jl1V6GijRvpWG7-30YF1FVP-nOfFC5CiuMA0B5wJCQrHS7YDtcrLylw
 
/**
   * Helper pour faire des requêtes à l'API Dropbox
   */
  async request(endpoint, data = {}, isContentApi = false) {
    const baseUrl = isContentApi ? this.contentUrl : this.apiUrl;
    
    try {
      const response = await axios.post(`${baseUrl}${endpoint}`, data, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur Dropbox API (${endpoint}):`, error.response?.data || error.message);
      throw new Error(`Dropbox API error: ${error.response?.data?.error_summary || error.message}`);
    }
  }

  /**
   * Liste les fichiers d'un dossier Dropbox
   * @param {string} path - Chemin du dossier ('' pour la racine)
   * @returns {Promise<Array>} Liste des fichiers
   */
  async listFiles(path = '') {
    try {
      const data = await this.request('/files/list_folder', {
        path: path || '',
        limit: 100,
      });

      const entries = data.entries || [];

      // Formater les fichiers pour une structure unifiée
      return entries.map(entry => ({
        id: entry.id,
        name: entry.name,
        type: entry['.tag'] === 'folder' ? 'folder' : 'file',
        path: entry.path_lower,
        size: entry.size || 0,
        modifiedTime: entry.server_modified || entry.client_modified,
        provider: 'dropbox',
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers Dropbox:', error.message);
      throw error;
    }
  }

  /**
   * Recherche des fichiers dans Dropbox
   * @param {string} query - Terme de recherche
   * @returns {Promise<Array>} Fichiers correspondants
   */
  async search(query) {
    try {
      const data = await this.request('/files/search_v2', {
        query: query,
        options: {
          max_results: 50,
        },
      });

      const matches = data.matches || [];

      return matches.map(match => {
        const metadata = match.metadata.metadata;
        return {
          id: metadata.id,
          name: metadata.name,
          type: metadata['.tag'] === 'folder' ? 'folder' : 'file',
          path: metadata.path_lower,
          size: metadata.size || 0,
          modifiedTime: metadata.server_modified || metadata.client_modified,
          provider: 'dropbox',
        };
      });
    } catch (error) {
      console.error('Erreur lors de la recherche dans Dropbox:', error.message);
      throw error;
    }
  }

  /**
   * Télécharge un fichier depuis Dropbox
   * @param {string} path - Chemin du fichier
   * @returns {Promise<Buffer>} Contenu du fichier
   */
  async downloadFile(path) {
    try {
      const response = await axios.post(
        `${this.contentUrl}/files/download`,
        null,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Dropbox-API-Arg': JSON.stringify({ path: path }),
          },
          responseType: 'arraybuffer',
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      console.error('Erreur lors du téléchargement depuis Dropbox:', error.message);
      throw new Error(`Download error: ${error.message}`);
    }
  }

  /**
   * Upload un fichier vers Dropbox
   * @param {Buffer} fileBuffer - Contenu du fichier
   * @param {string} path - Chemin de destination (ex: '/folder/file.txt')
   * @returns {Promise<Object>} Métadonnées du fichier uploadé
   */
  async uploadFile(fileBuffer, path) {
    try {
      const response = await axios.post(
        `${this.contentUrl}/files/upload`,
        fileBuffer,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/octet-stream',
            'Dropbox-API-Arg': JSON.stringify({
              path: path,
              mode: 'add',
              autorename: true,
            }),
          },
        }
      );

      const data = response.data;

      return {
        id: data.id,
        name: data.name,
        path: data.path_lower,
        size: data.size,
        provider: 'dropbox',
      };
    } catch (error) {
      console.error('Erreur lors de l\'upload vers Dropbox:', error.message);
      throw new Error(`Upload error: ${error.message}`);
    }
  }

  /**
   * Récupère les métadonnées d'un fichier
   * @param {string} path - Chemin du fichier
   * @returns {Promise<Object>} Métadonnées du fichier
   */
  async getFileMetadata(path) {
    try {
      const data = await this.request('/files/get_metadata', {
        path: path,
      });

      return {
        id: data.id,
        name: data.name,
        type: data['.tag'] === 'folder' ? 'folder' : 'file',
        path: data.path_lower,
        size: data.size || 0,
        modifiedTime: data.server_modified || data.client_modified,
        provider: 'dropbox',
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des métadonnées:', error.message);
      throw new Error(`Metadata error: ${error.message}`);
    }
  }
}

module.exports = DropboxConnector;