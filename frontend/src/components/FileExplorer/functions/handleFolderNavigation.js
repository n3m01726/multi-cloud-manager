export function addToFolderHistory(history, currentFolder, currentFolderName) {
  return [...history, { id: currentFolder || 'root', name: currentFolderName || 'Accueil' }];
}

export function popFromFolderHistory(history) {
  const newHistory = [...history];
  const previous = newHistory.pop();
  return { newHistory, previous };
}
