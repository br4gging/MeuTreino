// src/App.tsx

import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import WorkoutDashboard from './components/WorkoutDashboard';
import WorkoutManagement from './components/WorkoutManagement';
import WorkoutHistory from './components/WorkoutHistory';
import Reports from './components/Reports';
import Settings from './components/Settings';
import { supabase } from './supabaseClient';
// AQUI ESTÁ A IMPORTAÇÃO CORRETA:
import { UserWorkout, DaySchedule } from './types/workout'; 

function App() {
  const [activeTab, setActiveTab] = useState('workout');
  const [userWorkouts, setUserWorkouts] = useState<UserWorkout[]>([]);
  const [loading, setLoading] = useState(true);

  // O estado do cronograma semanal usa o DaySchedule importado
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>([
    { day: 1, name: 'SEGUNDA-FEIRA', workoutType: 'strength', workoutId: null },
    { day: 2, name: 'TERÇA-FEIRA', workoutType: 'cardio', cardioGoalType: 'distance', distance: 5 },
    { day: 3, name: 'QUARTA-FEIRA', workoutType: 'strength', workoutId: null },
    { day: 4, name: 'QUINTA-FEIRA', workoutType: 'cardio', cardioGoalType: 'time', targetTime: 30 },
    { day: 5, name: 'SEXTA-FEIRA', workoutType: 'strength', workoutId: null },
    { day: 6, name: 'SÁBADO', workoutType: 'rest' },
    { day: 0, name: 'DOMINGO', workoutType: 'rest' }
  ]);

  useEffect(() => {
    getWorkouts();
  }, []);

  const getWorkouts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) throw error;
      if (data) setUserWorkouts(data);
    } catch (error) {
      console.error('Erro ao buscar treinos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleChange = (day: number, field: string, value: any) => {
    setWeeklySchedule(currentSchedule =>
      currentSchedule.map(s => (s.day === day ? { ...s, [field]: value } : s))
    );
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'workout':
        return (
          <WorkoutDashboard
            userWorkouts={userWorkouts}
            weeklySchedule={weeklySchedule}
            loading={loading}
          />
        );
      case 'management':
        return (
          <WorkoutManagement
            userWorkouts={userWorkouts}
            weeklySchedule={weeklySchedule}
            onScheduleChange={handleScheduleChange}
            refetchWorkouts={getWorkouts}
          />
        );
      case 'history':
        return <WorkoutHistory />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <WorkoutDashboard userWorkouts={userWorkouts} weeklySchedule={weeklySchedule} loading={loading} />;
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