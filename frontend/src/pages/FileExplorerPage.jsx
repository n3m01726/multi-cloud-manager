import FileList from '../components/FileExplorer/FileExplorer';

function FileExplorerPage({ userId }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <FileList userId={userId} />
    </div>
  );
}

export default FileExplorerPage;