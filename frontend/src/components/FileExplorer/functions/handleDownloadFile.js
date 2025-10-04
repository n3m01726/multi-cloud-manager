export async function downloadFile(file, userId, filesService, setDownloading, setError) {
  setDownloading(file.id);
  try {
    await filesService.downloadFile(userId, file.provider, file.id, file.name);
  } catch (err) {
    console.error(err);
    setError(`Erreur lors du téléchargement de ${file.name}`);
  } finally {
    setDownloading(null);
  }
}
