import { useState, useEffect } from 'react';
import Tabs from './partials/Tabs';
import Navigation from './partials/Navigation';
import SearchBar from './partials/SearchBar';
import Files from './partials/Files';
import Footer from './partials/Footer';
//import Favorites from './views/Favorites';
import { filesService, metadataService } from '../../services/api';

export default function FileExplorer({ userId }) {
  const [files, setFiles] = useState([]);
  const [metadata, setMetadata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [activeTab, setActiveTab] = useState('google_drive');
  const [searchBarVisible, setSearchBarVisible] = useState(false);

  const [providerStates, setProviderStates] = useState({
    google_drive: { currentFolder: null, currentFolderName: '', folderHistory: [] },
    dropbox: { currentFolder: null, currentFolderName: '', folderHistory: [] }
  });

  // --------------------------
  // Chargement des fichiers ET mÃ©tadonnÃ©es
  // --------------------------
  useEffect(() => {
    if (activeTab !== 'favorites') {
      loadFiles();
    }
  }, [userId, activeTab]);

  const loadFiles = async (folderId = null, folderName = '', provider = null) => {
    setLoading(true);
    setError(null);
    setSearchQuery('');
    try {
      const targetProvider = provider || activeTab;
      const response = await filesService.listFiles(userId, folderId);
      const filesList = response.files || [];
      setFiles(filesList);

      // Charger les mÃ©tadonnÃ©es pour tous les fichiers affichÃ©s
      await loadMetadataForFiles(filesList);

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

  // Charger les mÃ©tadonnÃ©es de tous les fichiers
  const loadMetadataForFiles = async (filesList) => {
    try {
      const metadataPromises = filesList.map(file =>
        metadataService.getMetadata(userId, file.id, file.provider)
          .then(res => res.success && res.metadata ? res.metadata : null)
          .catch(() => null)
      );
      
      const metadataResults = await Promise.all(metadataPromises);
      const validMetadata = metadataResults.filter(m => m !== null);
      setMetadata(validMetadata);
      
      console.log('ðŸ“Š MÃ©tadonnÃ©es chargÃ©es:', validMetadata.length, 'sur', filesList.length);
    } catch (err) {
      console.error('Erreur chargement mÃ©tadonnÃ©es:', err);
    }
  };

  // --------------------------
  // Navigation dans les dossiers
  // --------------------------
  const handleFolderClick = folder => {
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
    if (activeTab === 'favorites') return;
    const currentProvider = activeTab;
    const currentState = providerStates[currentProvider];
    if (!currentState.folderHistory.length) return;

    const history = [...currentState.folderHistory];
    const previousFolder = history.pop();
    setProviderStates(prev => ({
      ...prev,
      [currentProvider]: { ...prev[currentProvider], folderHistory: history }
    }));
    loadFiles(previousFolder.id === 'root' ? null : previousFolder.id, previousFolder.name, currentProvider);
  };

  const handleHomeClick = () => {
    if (activeTab === 'favorites') return;
    if (activeTab === 'all') {
      setProviderStates({
        google_drive: { currentFolder: null, currentFolderName: '', folderHistory: [] },
        dropbox: { currentFolder: null, currentFolderName: '', folderHistory: [] }
      });
      loadFiles();
    } else {
      setProviderStates(prev => ({
        ...prev,
        [activeTab]: { currentFolder: null, currentFolderName: '', folderHistory: [] }
      }));
      loadFiles(null, '', activeTab);
    }
  };

  // --------------------------
  // Recherche
  // --------------------------
  const handleSearch = async e => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      if (activeTab === 'favorites') return;
      const providerState = providerStates[activeTab];
      loadFiles(providerState.currentFolder, providerState.currentFolderName, activeTab);
      return;
    }
    setIsSearching(true);
    setError(null);
    try {
      const response = await filesService.searchFiles(userId, searchQuery);
      const filesList = response.files || [];
      setFiles(filesList);
      await loadMetadataForFiles(filesList);
    } catch (err) {
      setError('Erreur lors de la recherche');
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  // --------------------------
  // TÃ©lÃ©chargement
  // --------------------------
  const handleDownload = async file => {
    setDownloading(file.id);
    try {
      await filesService.downloadFile(userId, file.provider, file.id, file.name);
    } catch (err) {
      setError(`Erreur lors du tÃ©lÃ©chargement de ${file.name}`);
      console.error(err);
    } finally {
      setDownloading(null);
    }
  };

  // --------------------------
  // RafraÃ®chir les fichiers
  // --------------------------
  const handleRefresh = () => {
    if (activeTab === 'favorites') return;
    const currentState = providerStates[activeTab];
    loadFiles(currentState?.currentFolder || null, currentState?.currentFolderName || '', activeTab);
  };

  // --------------------------
  // Gestion des onglets
  // --------------------------
  const handleTabChange = newTab => {
    setActiveTab(newTab);
    if (newTab === 'favorites') return;
    const providerState = providerStates[newTab];
    loadFiles(providerState.currentFolder, providerState.currentFolderName, newTab);
  };

  // --------------------------
  // Breadcrumb pour navigation
  // --------------------------
  const handleBreadcrumbClick = index => {
    if (activeTab === 'favorites') return;
    const currentState = providerStates[activeTab];
    const targetFolder = currentState.folderHistory[index];
    const newHistory = currentState.folderHistory.slice(0, index);
    setProviderStates(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], folderHistory: newHistory }
    }));
    loadFiles(targetFolder.id === 'root' ? null : targetFolder.id, targetFolder.name, activeTab);
  };

  const currentProviderState = activeTab === 'favorites' ? null : providerStates[activeTab];

  // --------------------------
  // Filtrage des fichiers selon l'onglet actif
  // --------------------------
  const filteredFiles = activeTab === 'favorites' ? [] : activeTab === 'all' ? files : files.filter(f => f.provider === activeTab);

  // --------------------------
  // Rendu
  // --------------------------
  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        <Tabs
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          toggleSearchBar={() => setSearchBarVisible(!searchBarVisible)}
          showSearchBar={searchBarVisible}
          onRefresh={handleRefresh}
        />

        <Navigation
          folderHistory={currentProviderState?.folderHistory || []}
          currentFolderName={currentProviderState?.currentFolderName || ''}
          onBack={handleBackClick}
          onHome={handleHomeClick}
          toggleSearchBar={() => setSearchBarVisible(!searchBarVisible)}
          showSearchBar={searchBarVisible}
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

        {error && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">âœ•</button>
          </div>
        )}

        {/* Onglet Favoris */}
        {activeTab === 'favorites' ? (
          <Favorites
            userId={userId}
            onDownload={handleDownload}
            onFolderClick={handleFolderClick}
            onFileMoved={() => {}}
            onFileCopied={() => {}}
          />
        ) : (
          <Files
            files={filteredFiles}
            metadata={metadata}
            loading={loading}
            userId={userId}
            onFolderClick={handleFolderClick}
            onDownload={handleDownload}
            downloading={downloading}
            onFileMoved={() => loadFiles()}
            onFileCopied={() => loadFiles()}
          />
        )}

        {filteredFiles.length > 0 && <Footer files={filteredFiles} />}
      </div>
    </div>
  );
}