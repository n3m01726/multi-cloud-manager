import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, userId }) {
  if (!userId) {
    // Rediriger vers la page d'accueil si non connecté
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;