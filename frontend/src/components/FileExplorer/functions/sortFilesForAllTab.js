export function sortFilesForAllTab(files, provider) {
  if (provider !== 'all') return files;
  const order = { google_drive: 1, dropbox: 2 };
  return [...files].sort((a, b) => (order[a.provider] || 99) - (order[b.provider] || 99));
}
