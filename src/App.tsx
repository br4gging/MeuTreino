// ARQUIVO COMPLETO: src/App.tsx

import React, { useState, useEffect, useRef } from 'react';
import Navigation from './components/Navigation';
import WorkoutDashboard from './components/WorkoutDashboard';
import WorkoutManagement from './components/WorkoutManagement';
import WorkoutHistory from './components/WorkoutHistory';
import Reports from './components/Reports';
import Settings from './components/Settings';
import { supabase } from './supabaseClient';
import { UserWorkout, DaySchedule, DetailedWorkout, DetailedSet } from './types/workout';

const defaultSchedule: DaySchedule[] = [
  { day: 1, name: 'SEGUNDA-FEIRA', workoutType: 'strength', workoutId: null, distance: null, targetTime: null, cardioGoalType: null },
  { day: 2, name: 'TERÇA-FEIRA', workoutType: 'cardio', workoutId: null, distance: 5, targetTime: null, cardioGoalType: 'distance' },
  { day: 3, name: 'QUARTA-FEIRA', workoutType: 'strength', workoutId: null, distance: null, targetTime: null, cardioGoalType: null },
  { day: 4, name: 'QUINTA-FEIRA', workoutType: 'cardio', workoutId: null, distance: null, targetTime: 30, cardioGoalType: 'time' },
  { day: 5, name: 'SEXTA-FEIRA', workoutType: 'strength', workoutId: null, distance: null, targetTime: null, cardioGoalType: null },
  { day: 6, name: 'SÁBADO', workoutType: 'rest', workoutId: null, distance: null, targetTime: null, cardioGoalType: null },
  { day: 0, name: 'DOMINGO', workoutType: 'rest', workoutId: null, distance: null, targetTime: null, cardioGoalType: null }
];

function App() {
  const [activeTab, setActiveTab] = useState('workout');
  const [userWorkouts, setUserWorkouts] = useState<UserWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<DetailedWorkout | null>(null);
  const [isWorkoutInProgress, setIsWorkoutInProgress] = useState(false);
  const [totalWorkoutTime, setTotalWorkoutTime] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [isRestTimerRunning, setIsRestTimerRunning] = useState(false);
  const [activeSetInfo, setActiveSetInfo] = useState({ exerciseName: '' });
  const workoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const restTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await Promise.all([getWorkouts(), getWeeklySchedule()]);
      setLoading(false);
    };
    initialLoad();
  }, []);

  useEffect(() => {
    if (isWorkoutInProgress) {
      workoutTimerRef.current = setInterval(() => setTotalWorkoutTime(p => p + 1), 1000);
    } else if (workoutTimerRef.current) {
      clearInterval(workoutTimerRef.current);
    }
    return () => { if (workoutTimerRef.current) clearInterval(workoutTimerRef.current); };
  }, [isWorkoutInProgress]);

  useEffect(() => {
    if (isRestTimerRunning && restTimer > 0) {
      restTimerIntervalRef.current = setInterval(() => setRestTimer(p => p > 0 ? p - 1 : 0), 1000);
    } else if (isRestTimerRunning && restTimer === 0) {
      setIsRestTimerRunning(false);
    }
    return () => { if (restTimerIntervalRef.current) clearInterval(restTimerIntervalRef.current); };
  }, [isRestTimerRunning, restTimer]);

  const getWorkouts = async () => {
    const { data, error } = await supabase.from('workouts').select('*').order('createdAt', { ascending: false });
    if (data) setUserWorkouts(data);
    if (error) console.error('Erro ao buscar treinos:', error);
  };

  const getWeeklySchedule = async () => {
    try {
      const { data, error } = await supabase.from('weekly_schedule').select('*').order('day');
      if (error) throw error;
      if (data && data.length === 7) {
        const transformedData = data.map(day => ({
          id: day.id,
          day: day.day,
          name: day.name,
          workoutType: day.workout_type,
          workoutId: day.workout_id,
          cardioGoalType: day.cardio_goal_type,
          distance: day.distance,
          targetTime: day.target_time,
        }));
        setWeeklySchedule(transformedData);
      } else {
        const scheduleToSave = defaultSchedule.map(({ id, ...rest }) => rest);
        await supabase.from('weekly_schedule').upsert(scheduleToSave, { onConflict: 'day' });
        setWeeklySchedule(defaultSchedule);
      }
    } catch (error) {
      console.error('Erro ao buscar programação semanal:', error);
      setWeeklySchedule(defaultSchedule);
    }
  };

  const handleSaveSchedule = async (newSchedule: DaySchedule[]) => {
    try {
      const scheduleToSave = newSchedule.map(day => ({
        day: day.day,
        name: day.name,
        workout_type: day.workoutType,
        workout_id: day.workoutId,
        cardio_goal_type: day.cardioGoalType,
        distance: day.distance,
        target_time: day.targetTime,
      }));
      const { error } = await supabase.from('weekly_schedule').upsert(scheduleToSave, { onConflict: 'day' });
      if (error) throw error;
      await getWeeklySchedule();
      alert('Programação salva com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao salvar programação:', error);
      alert('Não foi possível salvar a programação.');
      return false;
    }
  };

  const handleStartWorkout = (workout: DetailedWorkout) => {
    setActiveWorkout(workout);
    setIsWorkoutInProgress(true);
    setTotalWorkoutTime(0);
  };

  const handleSaveWorkout = () => {
    setIsWorkoutInProgress(false);
    alert(`Treino Salvo! Duração: ${Math.floor(totalWorkoutTime / 60)} minutos`);
    setActiveWorkout(null);
  };

  const handleSetChange = (exId: string, setId: string, field: 'achievedReps' | 'achievedLoad' | 'restTime', value: string) => {
    if (!activeWorkout) return;
    const newWorkout = { ...activeWorkout, exercises: activeWorkout.exercises.map(ex => {
        if (ex.id === exId) {
          return { ...ex, sets: ex.sets.map(s => {
              if (s.id === setId) {
                const updatedValue = field === 'restTime' ? parseInt(value, 10) || 0 : value;
                return { ...s, [field]: updatedValue };
              }
              return s;
            })
          };
        }
        return ex;
      })
    };
    setActiveWorkout(newWorkout as DetailedWorkout);
  };

  const handleToggleSetComplete = (exId: string, setId: string) => {
    if (!activeWorkout) return;
    let restTime = 0, exerciseName = '', shouldStartTimer = false;
    const newWorkout = { ...activeWorkout, exercises: activeWorkout.exercises.map(ex => {
        if (ex.id === exId) {
          exerciseName = ex.name;
          return { ...ex, sets: ex.sets.map(s => {
              if (s.id === setId) {
                if (!s.completed) { shouldStartTimer = true; restTime = s.restTime; }
                return { ...s, completed: !s.completed };
              }
              return s;
            })
          };
        }
        return ex;
      })
    };
    setActiveWorkout(newWorkout as DetailedWorkout);
    if (shouldStartTimer) {
      setActiveSetInfo({ exerciseName });
      setRestTimer(restTime);
      setIsRestTimerRunning(true);
    }
  };

  const stopRestTimer = () => setIsRestTimerRunning(false);

  const renderActiveComponent = () => {
    const workoutDashboardProps = {
      userWorkouts,
      weeklySchedule,
      loading,
      activeWorkout,
      isWorkoutInProgress,
      totalWorkoutTime,
      restTimer,
      isRestTimerRunning,
      activeSetInfo,
      onStartWorkout: handleStartWorkout,
      onSaveWorkout: handleSaveWorkout,
      onSetChange: handleSetChange,
      onToggleSetComplete: handleToggleSetComplete,
      onStopRestTimer: stopRestTimer,
    };

    switch (activeTab) {
      case 'workout':
        return <WorkoutDashboard {...workoutDashboardProps} />;
      case 'management':
        return (
          <WorkoutManagement
            userWorkouts={userWorkouts}
            initialSchedule={weeklySchedule}
            onSaveSchedule={handleSaveSchedule}
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
        return <WorkoutDashboard {...workoutDashboardProps} />;
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