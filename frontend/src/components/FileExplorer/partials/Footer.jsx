export default function Footer({ files }) {
  const folderCount = files.filter(f => f.type === 'folder').length;
  const fileCount = files.filter(f => f.type !== 'folder').length;

  return (
    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
      <p className="text-sm text-[#97A1A4]">{folderCount} dossier(s) • {fileCount} fichier(s)</p>
    </div>
  );
}
