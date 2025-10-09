// frontend/src/hooks/useCloudStats.js
import { useState, useEffect } from 'react';
import api from '../services/api';

export function useCloudStats() {
  const [stats, setStats] = useState({
    connected: 0,
    usedBytes: 0,
    totalBytes: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await api.get('/api/storage/stats');
        setStats({
          ...response.data,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching cloud stats:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Impossible de récupérer les statistiques'
        }));
      }
    }

    fetchStats();
    
    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return stats;
}

// ===================================================================
// frontend/src/App.jsx (exemple d'intégration)
// ===================================================================

import { useState, useEffect } from 'react';
import Navbar from './components/Navbar/Navbar';
import { useCloudStats } from './hooks/useCloudStats';

function App() {
  const [user, setUser] = useState(null);
  const cloudStats = useCloudStats();

  useEffect(() => {
    // Récupérer l'utilisateur connecté
    async function fetchUser() {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Navbar 
        user={user} 
        onLogout={handleLogout}
        cloudStats={cloudStats}  // ← Passer les stats ici
      />
      
      {/* Reste de votre app */}
    </div>
  );
}

export default App;