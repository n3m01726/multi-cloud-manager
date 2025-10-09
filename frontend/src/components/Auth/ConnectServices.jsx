// Composant pour connecter les services cloud
import { useState } from 'react';
import {Check } from 'lucide-react';
import { authService } from '../../services/api';

export default function ConnectServices({ userId, connectedServices, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConnectGoogle = async () => {
    setLoading(true);
    setError(null);

    try {
      const { authUrl } = await authService.getGoogleAuthUrl();
      // Rediriger vers l'URL d'authentification Google
      window.location.href = authUrl;
    } catch (err) {
      setError('Erreur lors de la connexion à Google Drive');
      console.error(err);
      setLoading(false);
    }
  };

  const handleDisconnect = async (provider) => {
    if (!confirm(`Êtes-vous sûr de vouloir déconnecter ${provider} ?`)) {
      return;
    }

    try {
      await authService.disconnect(userId, provider);
      onUpdate();
    } catch (err) {
      setError(`Erreur lors de la déconnexion de ${provider}`);
      console.error(err);
    }
  };

  const handleConnectDropbox = async () => {
  setLoading(true);
  setError(null);

  try {
    const { authUrl } = await authService.getDropboxAuthUrl();
    // Redirige l'utilisateur vers Dropbox OAuth
    window.location.href = authUrl;
  } catch (err) {
    setError('Erreur lors de la connexion à Dropbox');
    console.error(err);
    setLoading(false);
  }
};

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Google Drive */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-400 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M7.71 3.5L1.15 15l3.35 5.5h6.56L7.71 3.5z"
                  />
                  <path
                    fill="#34A853"
                    d="M14.29 3.5l-3.34 5.5 3.34 5.5h6.56l3.35-5.5-3.35-5.5h-6.56z"
                  />
                  <path
                    fill="#FBBC04"
                    d="M1.15 15l3.35 5.5L12 15l-3.35-5.5L1.15 15z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Google Drive</h3>
                <p className="text-sm text-gray-600">
                  {connectedServices?.google_drive 
                    ? 'Connecté' 
                    : 'Stockage cloud de Google'}
                </p>
              </div>
            </div>
            
            {connectedServices?.google_drive ? (
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <button
                  onClick={() => handleDisconnect('google_drive')}
                  className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Déconnecter
                </button>
                <button
      onClick={handleConnectDropbox}
      disabled
      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
    >
      {loading ? 'Connexion...' : '+'}
    </button>
              </div>
            ) : (
              <button
                onClick={handleConnectGoogle}
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Connexion...' : 'Connecter'}
              </button>
            )}
          </div>

{/* Dropbox */}
<div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
  <div className="flex items-center gap-3">
    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
      <svg className="w-6 h-6" viewBox="0 0 24 24">
        <path
          fill="#0061FF"
          d="M6 1.5l-6 4 6 4 6-4-6-4zm12 0l-6 4 6 4 6-4-6-4zM0 13.5l6 4 6-4-6-4-6 4zm12 0l6 4 6-4-6-4-6 4zM6 18l6 4.5 6-4.5-6-4-6 4.5z"
        />
      </svg>
    </div>
    <div>
      <h3 className="font-semibold text-lg">Dropbox</h3>
      <p className="text-sm text-gray-600">
        {connectedServices?.dropbox 
          ? 'Connecté' 
          : 'Stockage cloud Dropbox'}
      </p>
    </div>
  </div>

  {connectedServices?.dropbox ? (
    <div className="flex items-center gap-2">
      <Check className="w-5 h-5 text-green-500" />
      <button
        onClick={() => handleDisconnect('dropbox')}
        className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium"
      >
        Déconnecter
      </button>
    </div>
  ) : (
<button disable className='cursor-not-allowed px-4 py-2 rounded-md font-medium transition-colors text-gray-400 bg-gray-100'>Coming soon</button>
  )}
  
</div>


<div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
  <div className="flex items-center gap-3">
    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
      <svg className="w-6 h-6" viewBox="0 0 24 24">
        <path
          fill="#0061FF"
          d="M6 1.5l-6 4 6 4 6-4-6-4zm12 0l-6 4 6 4 6-4-6-4zM0 13.5l6 4 6-4-6-4-6 4zm12 0l6 4 6-4-6-4-6 4zM6 18l6 4.5 6-4.5-6-4-6 4.5z"
        />
      </svg>
    </div>
    <div>
      <h3 className="font-semibold text-lg">MEGA.nz</h3>
      <p className="text-sm text-gray-600">
        {connectedServices?.meganz 
          ? 'Connecté' 
          : 'Stockage cloud MEGA.nz'}
      </p>
    </div>
  </div>

<button disable className='cursor-not-allowed px-4 py-2 rounded-md font-medium transition-colors text-gray-400 bg-gray-100'>Coming soon</button>
  
</div>





        </div>

        <p className="mt-6 text-sm text-gray-500 text-center">
          Vos données sont sécurisées. Nous ne stockons que les tokens d'accès OAuth2.
        </p>
      </div>
    </div>
  );
}