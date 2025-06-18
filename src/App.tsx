import React, { useState } from 'react';
import Navigation from './components/Navigation';
import WorkoutDashboard from './components/WorkoutDashboard';
import WorkoutManagement from './components/WorkoutManagement';
import WorkoutHistory from './components/WorkoutHistory';
import Reports from './components/Reports';
import Settings from './components/Settings';

function App() {
  const [activeTab, setActiveTab] = useState('workout');

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'workout':
        return <WorkoutDashboard />;
      case 'management':
        return <WorkoutManagement />;
      case 'history':
        return <WorkoutHistory />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <WorkoutDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderActiveComponent()}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;