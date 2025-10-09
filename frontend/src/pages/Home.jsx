import { authService } from '../services/api';

function Home() {
  return (
    <div className="max-w-2xl mx-auto px-6 text-center">
      <div className="bg-white rounded-lg shadow-xl p-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Bienvenue sur Multi-Cloud Manager
        </h2>
        <p className="text-gray-600 mb-8">
          Connectez vos services cloud préférés et gérez tous vos fichiers depuis une seule interface.
        </p>
        <div className="flex justify-center">
          <button
            onClick={async () => {
              try {
                const { authUrl } = await authService.getGoogleAuthUrl();
                window.location.href = authUrl;
              } catch (err) {
                alert('Erreur lors de la connexion');
              }
            }}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            Commencer avec Google Drive
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;