export function generateBreadcrumb(folderHistory, currentFolderName) {
  return [...folderHistory.map(f => f.name), currentFolderName].filter(Boolean);
}
