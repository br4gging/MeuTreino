// App.tsx — Componente principal do app, responsável por autenticação e roteamento principal

import React, { useState, useEffect } from 'react';
// Bibliotecas e contextos
import { Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { AppProvider } from './context/AppProvider';
import { useAppContext } from './context/AppContext';
// Componentes de UI
import Auth from './components/Auth';
import Navigation from './components/Navigation';
import WorkoutDashboard from './components/WorkoutDashboard';
import WorkoutManagement from './components/WorkoutManagement';
import WorkoutHistory from './components/WorkoutHistory';
import Reports from './components/Reports';
import Settings from './components/Settings';
import IntensityModal from './components/IntensityModal';

// --- Conteúdo principal exibido quando o usuário está autenticado ---
const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, showIntensityModal, setShowIntensityModal, confirmSaveWorkoutWithIntensity } = useAppContext();
  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'workout': return <WorkoutDashboard />;
      case 'management': return <WorkoutManagement />;
      case 'history': return <WorkoutHistory />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings />;
      default: return <WorkoutDashboard />;
    }
  };
  return (
    <div className="bg-overlay">
      {renderActiveComponent()}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <IntensityModal isOpen={showIntensityModal} onClose={() => setShowIntensityModal(false)} onSave={confirmSaveWorkoutWithIntensity} />
    </div>
  );
};

// --- Componente principal do App ---
function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      if (mounted) {
        setSession(sess);
        setLoading(false);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(prev => (sess?.user?.id !== prev?.user?.id ? sess : prev));
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center" role="status" aria-busy="true" aria-live="polite">
        <div className="w-16 h-16 border-4 border-accent border-solid rounded-full border-t-transparent animate-spin" />
        <span className="sr-only">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary" role="main">
      <AppProvider>
        {!session ? <Auth /> : <AppContent key={session.user.id} />}
      </AppProvider>
    </div>
  );
}

export default App;