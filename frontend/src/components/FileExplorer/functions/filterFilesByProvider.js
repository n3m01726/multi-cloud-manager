export function filterFilesByProvider(files, provider) {
  if (provider === 'all') return files;
  return files.filter(f => f.provider === provider);
}
