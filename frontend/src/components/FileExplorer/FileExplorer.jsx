import { useState, useEffect } from 'react';
import { filesService } from '../../services/api';
import Tabs from './partials/Tabs';
import Navigation from './partials/Navigation';
import SearchBar from './partials/SearchBar';
import Files from './partials/Files';
import Footer from './partials/Footer';
import { formatFileSize, formatDate } from './functions/utils';

export default function FileExplorer({ userId }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'google_drive', 'dropbox'
  const [searchBarVisible, setSearchBarVisible] = useState(false);
  
  const [providerStates, setProviderStates] = useState({
    google_drive: {
      currentFolder: null,
      currentFolderName: '',
      folderHistory: []
    },
    dropbox: {
      currentFolder: null,
      currentFolderName: '',
      folderHistory: []
    }
  });

  useEffect(() => {
    loadFiles();
  }, [userId]);

  const loadFiles = async (folderId = null, folderName = '', provider = null) => {
    setLoading(true);
    setError(null);
    setSearchQuery('');
    try {
      const response = await filesService.listFiles(userId, folderId);
      setFiles(response.files || []);
      if (provider) {
        setProviderStates(prev => ({
          ...prev,
          [provider]: {
            ...prev[provider],
            currentFolder: folderId,
            currentFolderName: folderName
          }
        }));
      }
    } catch (err) {
      setError('Erreur lors du chargement des fichiers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folder) => {
    const provider = folder.provider;
    setProviderStates(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        folderHistory: [
          ...prev[provider].folderHistory,
          {
            id: prev[provider].currentFolder || 'root',
            name: prev[provider].currentFolderName || 'Accueil'
          }
        ]
      }
    }));
    loadFiles(folder.id, folder.name, provider);
  };

  const handleBackClick = () => {
    const currentProvider = activeTab === 'all' ? null : activeTab;
    if (!currentProvider) return;
    
    const currentState = providerStates[currentProvider];
    if (!currentState.folderHistory.length) return;

    const history = [...currentState.folderHistory];
    const previousFolder = history.pop();
    
    setProviderStates(prev => ({
      ...prev,
      [currentProvider]: {
        ...prev[currentProvider],
        folderHistory: history
      }
    }));
    
    loadFiles(
      previousFolder.id === 'root' ? null : previousFolder.id,
      previousFolder.name,
      currentProvider
    );
  };

  const handleHomeClick = () => {
    if (activeTab === 'all') {
      // Réinitialiser tous les providers
      setProviderStates(prev => ({
        google_drive: { ...prev.google_drive, currentFolder: null, currentFolderName: '', folderHistory: [] },
        dropbox: { ...prev.dropbox, currentFolder: null, currentFolderName: '', folderHistory: [] }
      }));
      loadFiles(null, '');
    } else {
      // Réinitialiser seulement le provider actif
      setProviderStates(prev => ({
        ...prev,
        [activeTab]: { ...prev[activeTab], currentFolder: null, currentFolderName: '', folderHistory: [] }
      }));
      loadFiles(null, '', activeTab);
    }
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      if (activeTab === 'all') {
        loadFiles(null, '');
      } else {
        const providerState = providerStates[activeTab];
        loadFiles(providerState.currentFolder, providerState.currentFolderName, activeTab);
      }
      return;
    }
    setIsSearching(true);
    setError(null);
    try {
      const response = await filesService.searchFiles(userId, searchQuery);
      setFiles(response.files || []);
    } catch (err) {
      setError('Erreur lors de la recherche');
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDownload = async (file) => {
    setDownloading(file.id);
    try {
      await filesService.downloadFile(userId, file.provider, file.id, file.name);
    } catch (err) {
      setError(`Erreur lors du téléchargement de ${file.name}`);
      console.error(err);
    } finally {
      setDownloading(null);
    }
  };

  const handleFileMoved = (file, result) => {
    // Rafraîchir la liste des fichiers
    loadFiles(
      currentProviderState?.currentFolder || null,
      currentProviderState?.currentFolderName || '',
      activeTab === 'all' ? null : activeTab
    );
    console.log(`Fichier "${file.name}" déplacé avec succès`);
  };

  const handleFileCopied = (file, result) => {
    // Rafraîchir la liste des fichiers
    loadFiles(
      currentProviderState?.currentFolder || null,
      currentProviderState?.currentFolderName || '',
      activeTab === 'all' ? null : activeTab
    );
    console.log(`Fichier "${file.name}" copié avec succès`);
  };

  // Gérer le changement d'onglet
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    if (newTab !== 'all') {
      const providerState = providerStates[newTab];
      loadFiles(providerState.currentFolder, providerState.currentFolderName, newTab);
    } else {
      loadFiles(null, '');
    }
  };

  // Filtrer les fichiers selon l'onglet actif
  const filteredFiles = activeTab === 'all' ? files : files.filter(f => f.provider === activeTab);

  // Gérer le clic sur un élément du fil d'Ariane
  const handleBreadcrumbClick = (index) => {
    const currentProvider = activeTab;
    if (currentProvider === 'all') return;

    const currentState = providerStates[currentProvider];
    const targetFolder = currentState.folderHistory[index];
    
    // Garder seulement l'historique jusqu'à l'index cliqué
    const newHistory = currentState.folderHistory.slice(0, index);
    
    setProviderStates(prev => ({
      ...prev,
      [currentProvider]: {
        ...prev[currentProvider],
        folderHistory: newHistory
      }
    }));

    loadFiles(
      targetFolder.id === 'root' ? null : targetFolder.id,
      targetFolder.name,
      currentProvider
    );
  };

  // Obtenir l'état du provider actif pour la navigation
  const currentProviderState = activeTab === 'all' ? null : providerStates[activeTab];

  return (
    <div className="w-full max-w-6xl mx-auto p-6 ">
      <div className="bg-white rounded-lg shadow-md">
        {/* Onglets avec boutons d'action */}
        <Tabs 
          activeTab={activeTab} 
          setActiveTab={handleTabChange}
          toggleSearchBar={() => setSearchBarVisible(!searchBarVisible)}
          showSearchBar={searchBarVisible}
          onRefresh={() => loadFiles(
            currentProviderState?.currentFolder || null,
            currentProviderState?.currentFolderName || '',
            activeTab === 'all' ? null : activeTab
          )}
        />

        {/* Navigation */}
        <Navigation
          folderHistory={currentProviderState?.folderHistory || []}
          currentFolderName={currentProviderState?.currentFolderName || ''}
          onBack={handleBackClick}
          onHome={handleHomeClick}
          toggleSearchBar={() => setSearchBarVisible(!searchBarVisible)}
          showSearchBar={searchBarVisible}
          loadFiles={() => loadFiles(
            currentProviderState?.currentFolder || null,
            currentProviderState?.currentFolderName || '',
            activeTab === 'all' ? null : activeTab
          )}
          onBreadcrumbClick={handleBreadcrumbClick}
        />

        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showSearchBar={searchBarVisible}
          toggleSearchBar={() => setSearchBarVisible(!searchBarVisible)}
          onSearch={handleSearch}
          isSearching={isSearching}
        />

        {/* Message d'erreur */}
        {error && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button>
          </div>
        )}

        {/* Liste des fichiers */}
        <Files
          files={filteredFiles}
          loading={loading}
          userId={userId}
          onFolderClick={handleFolderClick}
          onDownload={handleDownload}
          downloading={downloading}
          onFileMoved={handleFileMoved}
          onFileCopied={handleFileCopied}
        />

        {/* Footer */}
        {filteredFiles.length > 0 && <Footer files={filteredFiles} />}
      </div>
    </div>
  );
}