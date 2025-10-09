function Settings({ user }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Paramètres
        </h1>
        <p className="text-gray-600">
          Configurez votre expérience Multi-Cloud Manager
        </p>
      </div>

      <div className="space-y-6">
        {/* Informations utilisateur */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Profil utilisateur
          </h2>
          {user && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">ID utilisateur</label>
                <p className="text-gray-900 font-mono text-sm">{user.id}</p>
              </div>
            </div>
          )}
        </div>

        {/* Préférences */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Préférences
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Thème sombre</p>
                <p className="text-sm text-gray-500">Bientôt disponible</p>
              </div>
              <button disabled className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed">
                Prochainement
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Notifications</p>
                <p className="text-sm text-gray-500">Recevoir des alertes</p>
              </div>
              <button disabled className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed">
                Prochainement
              </button>
            </div>

                        <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Tooltips</p>
                <p className="text-sm text-gray-500">Affichage des tooltips</p>
              </div>
              <button disabled className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed">
                Prochainement
              </button>
            </div>
          </div>
        </div>

        {/* À propos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            À propos
          </h2>
          <div className="space-y-2 text-gray-600">
            <p><strong>Version:</strong> 1.0.0 - MVP</p>
            <p><strong>Services disponibles:</strong> Google Drive, Dropbox</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;