import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-6 text-center">
      <div className="bg-white rounded-lg shadow-xl p-12">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Page introuvable
        </h2>
        <p className="text-gray-600 mb-8">
          Désolé, la page que vous recherchez n'existe pas.
        </p>
        <Link
          to="/"
          className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

export default NotFound;