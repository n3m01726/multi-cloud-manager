import { Link } from 'react-router-dom';
import '../assets/NotFound.css';

function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-6 text-center notfound-container">
    
        <div className="text-6xl mb-4 relative">
          <span className="repairman">🧑‍🔧</span>
        </div>
        <h1 className="text-9xl font-bold text-gray-900 mb-4 animated-404">
          <span className="digit four left">4</span>
          <span className="digit zero">0</span>
          <span className="digit four right">4</span>
        </h1>
        <div className="sparks">
          <span>*</span><span>*</span><span>*</span>
        </div>
        <p className="text-gray-600 mb-8">
          On répare ça... enfin, on essaie.
        </p>
        <Link
          to="/"
          className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
        >
          Retour à l'accueil
        </Link>
      </div>
    
  );
}

export default NotFound;
