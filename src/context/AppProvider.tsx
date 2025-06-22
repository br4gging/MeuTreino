// ARQUIVO: src/context/AppProvider.tsx

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
  const beepSound = useRef<HTMLAudioElement | null>(null); 

  useEffect(() => {
    beepSound.current = new Audio('/sounds/beep.mp3');
  }, []);

  const playBeep = useCallback((times: number, delay: number = 100) => {
    if (beepSound.current) {
      let count = 0;
      const playInterval = setInterval(() => {
        if (beepSound.current) {
          beepSound.current.currentTime = 0; 
          beepSound.current.play();
        }
        count++;
        if (count >= times) {
          clearInterval(playInterval);
        }
      }, delay);
    }
  }, []);

  const showToast = useCallback((message: string, options?: { type?: 'success' | 'error' }) => {
    options?.type === 'error' ? toast.error(message, { duration: 4000 }) : toast.success(message, { duration: 3000 });
  }, []);

  const showConfirmation = useCallback((title: string, message: string, onConfirm: () => void) => {
    setConfirmationState({ isOpen: true, title, message, onConfirm });
  }, []);

  const hideConfirmation = useCallback(() => {
    setConfirmationState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  }, []);

  const handleConfirm = useCallback(() => {
    confirmationState.onConfirm();
    hideConfirmation();
  }, [confirmationState, hideConfirmation]);

  const refetchWorkouts = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase.from('workouts').select('*').eq('user_id', userId).order('createdAt', { ascending: false });
      if (error) throw error; 
      setUserWorkouts(data);
    } catch (error: any) {
      console.error('Erro ao buscar treinos:', error);
      showToast('Erro ao carregar treinos: ' + (error.message || 'Erro desconhecido'), { type: 'error' });
      setUserWorkouts([]); 
    }
  }, [setUserWorkouts, showToast]); 
  
  const getWeeklySchedule = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase.from('weekly_schedule').select('*').eq('user_id', userId).order('day');
      if (error) throw error; 

      if (data && data.length > 0) {
        const transformedData = data.map((day: any) => ({ ...day, workoutType: day.workout_type, workoutId: day.workout_id, cardioGoalType: day.cardio_goal_type, targetTime: day.target_time }));
        setWeeklySchedule(transformedData);
      } else {
        const scheduleToSave = defaultSchedule.map(({ day, name, workoutType, workoutId, distance, targetTime, cardioGoalType }) => ({ day, name, workout_type: workoutType, workout_id: workoutId, distance, target_time: targetTime, cardio_goal_type: cardioGoalType, user_id: userId }));
        const { error: upsertError } = await supabase.from('weekly_schedule').upsert(scheduleToSave, { onConflict: 'user_id,day' });
        if (upsertError) {
          console.error('Erro ao inserir programação padrão:', upsertError);
          showToast('Erro ao inserir programação padrão. Tente novamente mais tarde.', { type: 'error' });
          setWeeklySchedule(defaultSchedule); 
        } else {
          const { data: refetchedData, error: refetchError } = await supabase.from('weekly_schedule').select('*').eq('user_id', userId).order('day');
          if(refetchError) throw refetchError; 
          const transformedRefetchedData = refetchedData.map((day: any) => ({ ...day, workoutType: day.workout_type, workoutId: day.workout_id, cardioGoalType: day.cardio_goal_type, targetTime: day.target_time }));
          setWeeklySchedule(transformedRefetchedData);
        }
      }
    } catch (error: any) { 
      console.error('Erro geral no getWeeklySchedule:', error);
      showToast('Erro ao carregar programação semanal: ' + (error.message || 'Erro desconhecido'), { type: 'error' });
      setWeeklySchedule(defaultSchedule); 
    }
  }, [setWeeklySchedule, showToast]); 

  const clearAppState = useCallback(() => {
    setUserWorkouts([]);
    setWeeklySchedule([]);
    setActiveWorkout(null);
    setIsWorkoutInProgress(false);
    setTotalWorkoutTime(0);
    setRestTimer(0);
    setIsRestTimerRunning(false);
    setActiveSetInfo({ exerciseName: '' });
    setCurrentWeek(1);
    setShowIntensityModal(false);
    setConfirmationState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    setActiveTab('workout');
    setLoading(false);
  }, []);

  const loadInitialData = useCallback(async (userId: string) => {
    if (isWorkoutInProgress) return;
    setLoading(true);
    await Promise.allSettled([refetchWorkouts(userId), getWeeklySchedule(userId)]);
    setLoading(false); 
  }, [isWorkoutInProgress, refetchWorkouts, getWeeklySchedule, setLoading]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        loadInitialData(session.user.id);
      }
      if (event === 'SIGNED_OUT') {
        clearAppState();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadInitialData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [loadInitialData, clearAppState]);
  
  const handleSaveSchedule = useCallback(async (newSchedule: DaySchedule[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      
      const scheduleToSave = newSchedule.map(day => ({ day: day.day, name: day.name, workout_type: day.workoutType, workout_id: day.workoutId || null, cardio_goal_type: day.cardioGoalType, distance: day.distance, target_time: day.targetTime, user_id: user.id }));

      const { error } = await supabase.from('weekly_schedule').upsert(scheduleToSave, { onConflict: 'user_id,day' });
      if (error) throw error;
      await getWeeklySchedule(user.id); 
      showToast('Programação salva com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Erro ao salvar a programação:', error); 
      showToast('Erro ao salvar a programação: ' + (error.message || 'Erro desconhecido'), { type: 'error' });
      return false;
    }
  }, [getWeeklySchedule, showToast]);

  const onStartWorkout = useCallback((workoutTemplate: UserWorkout) => {
    const detailedWorkout: DetailedWorkout = {
      ...workoutTemplate,
      exercises: workoutTemplate.exercises.map((ex) => ({
        ...ex,
        id: ex.id || crypto.randomUUID(), 
        sets: ex.sets.map((setTemplate, index) => ({ id: setTemplate.id || crypto.randomUUID(), type: setTemplate.type, setNumber: index + 1, targetReps: setTemplate.reps, targetValue: setTemplate.value, restTime: parseInt(String(setTemplate.restTime), 10) || 90, lastWeight: setTemplate.lastWeight, achievedReps: '', achievedLoad: '', completed: false })),
      })),
    };
    setActiveWorkout(detailedWorkout);
    setIsWorkoutInProgress(true);
    setTotalWorkoutTime(0);
  }, []);

  const confirmSaveWorkoutWithIntensity = useCallback(async (intensity: number) => {
    if (!activeWorkout) return;
    setShowIntensityModal(false);
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        showToast("Usuário não autenticado.", { type: 'error' });
        setLoading(false);
        return;
    }
    const exercisesCompleted = activeWorkout.exercises.filter(ex => ex.sets.length > 0 && ex.sets.every(s => s.completed)).length;
    const details: StrengthWorkoutDetails = { exercises: activeWorkout.exercises, exercisesCompleted, totalExercises: activeWorkout.exercises.length };
    const sessionData: Omit<WorkoutSession, 'id' | 'created_at' | 'user_id' | 'completed_at'> = { name: activeWorkout.name, type: 'strength', duration: totalWorkoutTime, week: currentWeek, intensity, details };
    
    await supabase.from('workout_sessions').insert({ ...sessionData, user_id: user.id });
    
    try {
      const { data: originalWorkoutData, error: fetchError } = await supabase.from('workouts').select('exercises').eq('id', activeWorkout.id).single();
      if (fetchError || !originalWorkoutData) throw new Error("Molde do treino original não encontrado");

      const exercisesToUpdate = JSON.parse(JSON.stringify(originalWorkoutData.exercises)) as Exercise[];
      
      for (const executedEx of activeWorkout.exercises) {
        const originalExToUpdate = exercisesToUpdate.find(ex => ex.id === executedEx.id);
        if (!originalExToUpdate) continue;
        for (const executedSet of executedEx.sets) {
          const originalSetToUpdate = originalExToUpdate.sets.find(s => s.id === executedSet.id);
          if (originalSetToUpdate) { 
            const newLoad = parseFloat(executedSet.achievedLoad);
            if (!isNaN(newLoad)) { 
                originalSetToUpdate.lastWeight = newLoad;
            } 
          }
        }
      }
      await supabase.from('workouts').update({ exercises: exercisesToUpdate }).eq('id', activeWorkout.id);
    } catch (error: any) { 
      console.error("Erro ao atualizar a última carga no molde do treino:", error);
      showToast("Erro ao atualizar a última carga: " + (error.message || "Erro desconhecido."), { type: 'error' });
    } finally { 
      showToast(`Treino Salvo!`);
      setIsWorkoutInProgress(false);
      setActiveWorkout(null);
      setTotalWorkoutTime(0);
      await refetchWorkouts(user.id);
      setLoading(false);
    }
  }, [activeWorkout, totalWorkoutTime, currentWeek, showToast, setLoading, setShowIntensityModal, refetchWorkouts]);

  const onSaveCardio = useCallback(async (cardioData: { distance: number; time: number; pace: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const details: CardioWorkoutDetails = { distance: cardioData.distance, pace: cardioData.pace };
    const sessionData: Partial<WorkoutSession> = { name: `Corrida ${cardioData.distance}km`, type: 'cardio', duration: cardioData.time * 60, week: currentWeek, details, user_id: user.id };
    try {
      const { error } = await supabase.from('workout_sessions').insert(sessionData);
      if (error) throw error;
      showToast('Corrida salva com sucesso!');
    } catch (error: any) {
      showToast('Houve um erro ao salvar sua corrida.' + (error.message || "Erro desconhecido."), { type: 'error' });
    }
  }, [currentWeek, showToast]);

  const onSaveMeasurement = useCallback(async (measurement: BodyMeasurement) => {
    setLoading(true);
    const { data: { user } = { user: null } } = await supabase.auth.getUser(); 
    if (!user) {
      showToast("Usuário não autenticado.", { type: 'error' });
      setLoading(false);
      return;
    }
    const { error } = await supabase.from('body_measurements').insert({ ...measurement, user_id: user.id });
    if (error) {
      showToast("Erro ao salvar medição: " + error.message, { type: 'error' });
    } else {
      showToast("Medição salva com sucesso!");
    }
    setLoading(false);
  }, [setLoading, showToast]);
  
  const onUpdateMeasurement = useCallback(async (measurement: BodyMeasurement) => {
    if (!measurement.id) {
      showToast("ID da medição não encontrado.", { type: 'error' });
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from('body_measurements')
      .update({
        measured_at: measurement.measured_at,
        source: measurement.source,
        weight_kg: measurement.weight_kg,
        body_fat_percentage: measurement.body_fat_percentage,
        details: measurement.details,
      })
      .eq('id', measurement.id);
    
    if (error) {
      showToast("Erro ao atualizar medição: " + error.message, { type: 'error' });
    } else {
      showToast("Medição atualizada com sucesso!");
    }
    setLoading(false);
  }, [setLoading, showToast]);

  const onDeleteMeasurement = useCallback(async (measurementId: string) => {
    showConfirmation(
      'Excluir Medição?',
      'Esta ação não pode ser desfeita. Tem certeza que deseja excluir este registro?',
      async () => {
        setLoading(true);
        const { error } = await supabase
          .from('body_measurements')
          .delete()
          .eq('id', measurementId);
        
        if (error) {
          showToast("Erro ao excluir medição: " + error.message, { type: 'error' });
        } else {
          showToast("Medição excluída com sucesso!");
        }
        setLoading(false);
      }
    );
  }, [setLoading, showToast, showConfirmation]);

  const onSaveWorkout = useCallback(() => { setShowIntensityModal(true); }, []);
  const onCancelWorkout = useCallback(() => { setIsWorkoutInProgress(false); setActiveWorkout(null); setTotalWorkoutTime(0); setRestTimer(0); setIsRestTimerRunning(false); setActiveSetInfo({ exerciseName: '' }); }, []);
  const onSetChange = useCallback((exId: string, setId: string, field: 'achievedReps' | 'achievedLoad' | 'restTime', value: string) => { if (!activeWorkout) return; const newWorkout = { ...activeWorkout, exercises: activeWorkout.exercises.map(ex => (ex.id === exId) ? { ...ex, sets: ex.sets.map(s => (s.id === setId) ? { ...s, [field]: value } : s) } : ex ) }; setActiveWorkout(newWorkout as DetailedWorkout); }, [activeWorkout]);
  const onToggleSetComplete = useCallback((exId: string, setId: string) => { if (!activeWorkout) return; let restTime = 0; let exerciseName = ''; let shouldStartTimer = false; const newWorkout = { ...activeWorkout, exercises: activeWorkout.exercises.map(ex => { if (ex.id === exId) { exerciseName = ex.name; return { ...ex, sets: ex.sets.map(s => { if (s.id === setId) { if (!s.completed) { shouldStartTimer = true; restTime = typeof s.restTime === 'string' ? parseInt(String(s.restTime), 10) : s.restTime; if (isNaN(restTime)) restTime = 90; } return { ...s, completed: !s.completed }; } return s; }) }; } return ex; }) }; setActiveWorkout(newWorkout as DetailedWorkout); if (shouldStartTimer) { setActiveSetInfo({ exerciseName }); setRestTimer(restTime); setIsRestTimerRunning(true); } }, [activeWorkout, playBeep]);
  const onStopRestimer = useCallback(() => setIsRestTimerRunning(false), []);
  const onWeekChange = useCallback((week: number) => setCurrentWeek(week), []);

  useEffect(() => {
    if (isWorkoutInProgress) {
      workoutTimerRef.current = setInterval(() => setTotalWorkoutTime(p => p + 1), 1000);
    } else if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
    return () => { if (workoutTimerRef.current) clearInterval(workoutTimerRef.current); };
  }, [isWorkoutInProgress]);

  useEffect(() => {
    if (isRestTimerRunning && restTimer >= 0) {
      restTimerIntervalRef.current = setInterval(() => {
        setRestTimer(p => {
          const newTime = p - 1;
          if (newTime === 10) { playBeep(1); }
          else if (newTime <= 0) {
            if (p > 0) playBeep(3, 100);
            setIsRestTimerRunning(false);
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => { if (restTimerIntervalRef.current) clearInterval(restTimerIntervalRef.current); };
  }, [isRestTimerRunning, restTimer, playBeep]);
  
  const value = {
    loading, setLoading, userWorkouts, weeklySchedule, activeWorkout, isWorkoutInProgress,
    totalWorkoutTime, restTimer, isRestTimerRunning, activeSetInfo, currentWeek, confirmationState,
    activeTab, setActiveTab, showIntensityModal, setShowIntensityModal,
    refetchWorkouts: useCallback(async () => {
        const {data: {user}} = await supabase.auth.getUser();
        if(user) await loadInitialData(user.id);
    }, [loadInitialData]), 
    handleSaveSchedule, onStartWorkout, onSaveWorkout,
    confirmSaveWorkoutWithIntensity, onSaveCardio, onSetChange, onToggleSetComplete,
    onStopRestimer, onWeekChange, onSaveMeasurement, showToast, showConfirmation, hideConfirmation,
    onCancelWorkout, onUpdateMeasurement, onDeleteMeasurement
  };

  return (
    <AppContext.Provider value={value}>
      <Toaster position="top-center" />
      <ConfirmationModal isOpen={confirmationState.isOpen} title={confirmationState.title} message={confirmationState.message} onConfirm={handleConfirm} onCancel={hideConfirmation} />
      {children}
    </AppContext.Provider>
  );
};