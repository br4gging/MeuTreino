import React, { useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { AppContext } from './AppContext';
import { supabase } from '../supabaseClient';
import toast, { Toaster } from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';
import { UserWorkout, DaySchedule, DetailedWorkout, WorkoutSession, StrengthWorkoutDetails, CardioWorkoutDetails, BodyMeasurement, Exercise } from '../types/workout';
import { defaultSchedule } from '../constants/schedule';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
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
  const [currentWeek, setCurrentWeek] = useState(1);
  const [showIntensityModal, setShowIntensityModal] = useState(false);
  const [confirmationState, setConfirmationState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const workoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const restTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string, options?: { type?: 'success' | 'error' }) => {
    options?.type === 'error' ? toast.error(message, { duration: 4000 }) : toast.success(message, { duration: 3000 });
  };

  const showConfirmation = (title: string, message: string, onConfirm: () => void) => {
    setConfirmationState({ isOpen: true, title, message, onConfirm });
  };

  const hideConfirmation = () => {
    setConfirmationState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  };

  const handleConfirm = () => {
    confirmationState.onConfirm();
    hideConfirmation();
  };

  const getWeeklySchedule = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('weekly_schedule').select('*').order('day');
      if (error) throw error;
      if (data && data.length === 7) {
        const transformedData = data.map((day: any) => ({
          id: day.id, day: day.day, name: day.name, workoutType: day.workout_type, workoutId: day.workout_id, cardioGoalType: day.cardio_goal_type, distance: day.distance, targetTime: day.target_time,
        }));
        setWeeklySchedule(transformedData);
      } else {
        const scheduleToSave = defaultSchedule.map(({ day, name, workoutType, workoutId, distance, targetTime, cardioGoalType }) => ({
          day, name, workout_type: workoutType, workout_id: workoutId, distance, target_time: targetTime, cardio_goal_type: cardioGoalType
        }));
        await supabase.from('weekly_schedule').upsert(scheduleToSave, { onConflict: 'day' });
        setWeeklySchedule(defaultSchedule);
      }
    } catch (error) {
      console.error('Erro ao buscar programação semanal:', error);
      setWeeklySchedule(defaultSchedule);
    }
  }, []);

  const refetchWorkouts = useCallback(async () => {
    const { data, error } = await supabase.from('workouts').select('*').order('createdAt', { ascending: false });
    if (data) setUserWorkouts(data as any);
    if (error) console.error('Erro ao buscar treinos:', error);
  }, []);

  const handleSaveSchedule = useCallback(async (newSchedule: DaySchedule[]) => {
    try {
      const scheduleToSave = newSchedule.map(day => ({
        day: day.day, name: day.name, workout_type: day.workoutType, workout_id: day.workoutId || null, cardio_goal_type: day.cardioGoalType, distance: day.distance, target_time: day.targetTime
      }));
      const { error } = await supabase.from('weekly_schedule').upsert(scheduleToSave, { onConflict: 'day' });
      if (error) throw error;
      await getWeeklySchedule();
      showToast('Programação salva com sucesso!');
      return true;
    } catch (error: any) {
      showToast('Erro ao salvar a programação.', { type: 'error' });
      return false;
    }
  }, [getWeeklySchedule]);

  const confirmSaveWorkoutWithIntensity = useCallback(async (intensity: number) => {
    if (!activeWorkout) return;
    setShowIntensityModal(false);
    setLoading(true);
    const exercisesCompleted = activeWorkout.exercises.filter(ex => ex.sets.length > 0 && ex.sets.every(s => s.completed)).length;
    const details: StrengthWorkoutDetails = { exercises: activeWorkout.exercises, exercisesCompleted, totalExercises: activeWorkout.exercises.length };
    const sessionData: Omit<WorkoutSession, 'id' | 'created_at' | 'user_id' | 'completed_at'> = { name: activeWorkout.name, type: 'strength', duration: totalWorkoutTime, week: currentWeek, intensity, details };
    const { error: sessionError } = await supabase.from('workout_sessions').insert(sessionData as any);
    if (sessionError) {
      showToast('Houve um erro ao salvar seu treino.', { type: 'error' });
      setLoading(false);
      return;
    }
    try {
      const { data: originalWorkoutData, error: fetchError } = await supabase.from('workouts').select('exercises').eq('id', activeWorkout.id).single();
      if (fetchError) throw fetchError;
      const originalExercises = originalWorkoutData.exercises as Exercise[];
      const updatedExercises = originalExercises.map(originalEx => {
        const executedEx = activeWorkout.exercises.find(ex => ex.name === originalEx.name);
        if (executedEx) {
          const loads = executedEx.sets.map(s => parseFloat(s.achievedLoad)).filter(l => !isNaN(l) && l > 0);
          if (loads.length > 0) {
            const maxLoad = Math.max(...loads);
            return { ...originalEx, lastWeight: maxLoad };
          }
        }
        return originalEx;
      });
      await supabase.from('workouts').update({ exercises: updatedExercises as any }).eq('id', activeWorkout.id);
    } catch (error) {
      console.error("Erro ao atualizar a última carga no molde do treino:", error);
    } finally {
      showToast(`Treino Salvo! Duração: ${Math.floor(totalWorkoutTime / 60)} minutos.`);
      setIsWorkoutInProgress(false);
      setActiveWorkout(null);
      setTotalWorkoutTime(0);
      refetchWorkouts();
      setLoading(false);
    }
  }, [activeWorkout, totalWorkoutTime, currentWeek, refetchWorkouts]);

  const onSaveCardio = useCallback(async (cardioData: { distance: number; time: number; pace: string }) => {
    const details: CardioWorkoutDetails = { distance: cardioData.distance, pace: cardioData.pace };
    const sessionData: Omit<WorkoutSession, 'id' | 'created_at' | 'user_id' | 'completed_at' | 'intensity'> = {
      name: `Corrida ${cardioData.distance}km`, type: 'cardio', duration: cardioData.time * 60, week: currentWeek, details
    };
    try {
      const { error } = await supabase.from('workout_sessions').insert(sessionData as any);
      if (error) throw error;
      showToast('Corrida salva com sucesso!');
    } catch (error) {
      showToast('Houve um erro ao salvar sua corrida.', { type: 'error' });
    }
  }, [currentWeek]);

  const onSaveMeasurement = useCallback(async (measurement: BodyMeasurement) => {
    setLoading(true);
    const { error } = await supabase.from('body_measurements').insert(measurement as any);
    if (error) {
      showToast("Erro ao salvar medição: " + error.message, { type: 'error' });
    } else {
      showToast("Medição salva com sucesso!");
    }
    setLoading(false);
  }, []);

  const onStartWorkout = useCallback((workout: DetailedWorkout) => {
    setActiveWorkout(workout);
    setIsWorkoutInProgress(true);
    setTotalWorkoutTime(0);
  }, []);

  const onSaveWorkout = useCallback(() => {
    setShowIntensityModal(true);
  }, []);

  const onSetChange = useCallback((exId: string, setId: string, field: 'achievedReps' | 'achievedLoad' | 'restTime', value: string) => {
    if (!activeWorkout) return;
    const newWorkout = {
      ...activeWorkout,
      exercises: activeWorkout.exercises.map(ex =>
        (ex.id === exId)
          ? { ...ex, sets: ex.sets.map(s => (s.id === setId) ? { ...s, [field]: value } : s) }
          : ex
      )
    };
    setActiveWorkout(newWorkout as DetailedWorkout);
  }, [activeWorkout]);

  const onToggleSetComplete = useCallback((exId: string, setId: string) => {
    if (!activeWorkout) return;
    let restTime = 0;
    let exerciseName = '';
    let shouldStartTimer = false;
    const newWorkout = {
      ...activeWorkout,
      exercises: activeWorkout.exercises.map(ex => {
        if (ex.id === exId) {
          exerciseName = ex.name;
          return {
            ...ex,
            sets: ex.sets.map(s => {
              if (s.id === setId) {
                if (!s.completed) {
                  shouldStartTimer = true;
                  restTime = typeof s.restTime === 'string' ? parseInt(s.restTime, 10) : s.restTime;
                  if (isNaN(restTime)) restTime = 90;
                }
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
  }, [activeWorkout]);

  const onStopRestimer = useCallback(() => {
    setIsRestTimerRunning(false);
  }, []);

  const onWeekChange = useCallback((week: number) => {
    setCurrentWeek(week);
  }, []);

  useEffect(() => {
    if (isWorkoutInProgress) {
      workoutTimerRef.current = setInterval(() => setTotalWorkoutTime(p => p + 1), 1000);
    } else if (workoutTimerRef.current) {
      clearInterval(workoutTimerRef.current);
    }
    return () => {
      if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
    };
  }, [isWorkoutInProgress]);

  useEffect(() => {
    if (isRestTimerRunning && restTimer > 0) {
      restTimerIntervalRef.current = setInterval(() => setRestTimer(p => p > 0 ? p - 1 : 0), 1000);
    } else if (isRestTimerRunning && restTimer === 0) {
      setIsRestTimerRunning(false);
    }
    return () => {
      if (restTimerIntervalRef.current) clearInterval(restTimerIntervalRef.current);
    };
  }, [isRestTimerRunning, restTimer]);

  useEffect(() => {
    const loadData = async () => {
      if (isWorkoutInProgress) return;
      setLoading(true);
      await Promise.all([refetchWorkouts(), getWeeklySchedule()]);
      setLoading(false);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        loadData();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadData();
      } else {
        setLoading(false);
      }
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      authListener?.subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isWorkoutInProgress, refetchWorkouts, getWeeklySchedule]);

  const value = {
    loading, setLoading, userWorkouts, weeklySchedule, activeWorkout, isWorkoutInProgress,
    totalWorkoutTime, restTimer, isRestTimerRunning, activeSetInfo, currentWeek, confirmationState,
    activeTab, setActiveTab, showIntensityModal, setShowIntensityModal,
    refetchWorkouts, handleSaveSchedule, onStartWorkout, onSaveWorkout,
    confirmSaveWorkoutWithIntensity, onSaveCardio, onSetChange, onToggleSetComplete,
    onStopRestimer, onWeekChange, onSaveMeasurement, showToast, showConfirmation, hideConfirmation
  };

  return (
    <AppContext.Provider value={value}>
      <Toaster position="top-center" />
      <ConfirmationModal isOpen={confirmationState.isOpen} title={confirmationState.title} message={confirmationState.message} onConfirm={handleConfirm} onCancel={hideConfirmation} />
      {children}
    </AppContext.Provider>
  );
}; 