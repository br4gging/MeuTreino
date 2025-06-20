// ARQUIVO FINAL, COMPLETO E CORRIGIDO: src/App.tsx

import React, { useState, useEffect, useRef } from 'react';
import Navigation from './components/Navigation';
import WorkoutDashboard from './components/WorkoutDashboard';
import WorkoutManagement from './components/WorkoutManagement';
import WorkoutHistory from './components/WorkoutHistory';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Auth from './components/Auth';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import { UserWorkout, DaySchedule, DetailedWorkout, DetailedSet, WorkoutSession, StrengthWorkoutDetails, CardioWorkoutDetails } from './types/workout';
import { Smile, Frown, Meh, Angry } from 'lucide-react';

// =================================================================================
// MODAL DE INTENSIDADE
// =================================================================================
interface IntensityModalProps { isOpen: boolean; onClose: () => void; onSave: (intensity: number) => void; }
const IntensityModal: React.FC<IntensityModalProps> = ({ isOpen, onClose, onSave }) => {
    const [intensity, setIntensity] = useState(2);
    if (!isOpen) return null;
    const intensityMap = [ { level: 1, label: 'Fácil', icon: <Smile className="text-green-500" size={32} />, color: 'bg-green-500' }, { level: 2, label: 'Manejável', icon: <Meh className="text-yellow-500" size={32} />, color: 'bg-yellow-500' }, { level: 3, label: 'Difícil', icon: <Frown className="text-orange-500" size={32} />, color: 'bg-orange-500' }, { level: 4, label: 'Exaustivo', icon: <Angry className="text-red-500" size={32} />, color: 'bg-red-500' } ];
    const currentIntensity = intensityMap[intensity - 1];
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Qual foi a intensidade?</h3>
                <div className="my-8 flex flex-col items-center">{currentIntensity.icon}<p className="text-xl font-semibold mt-2 text-gray-700">{currentIntensity.label}</p></div>
                <input type="range" min="1" max="4" step="1" value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${currentIntensity.color}`}/>
                <div className="flex gap-4 mt-8">
                    <button onClick={onClose} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100">Cancelar</button>
                    <button onClick={() => onSave(intensity)} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700">Salvar Treino</button>
                </div>
            </div>
        </div>
    );
};
const defaultSchedule: DaySchedule[] = [ { day: 1, name: 'SEGUNDA-FEIRA', workoutType: 'strength', workoutId: null, distance: null, targetTime: null, cardioGoalType: null }, { day: 2, name: 'TERÇA-FEIRA', workoutType: 'cardio', workoutId: null, distance: 5, targetTime: null, cardioGoalType: 'distance' }, { day: 3, name: 'QUARTA-FEIRA', workoutType: 'strength', workoutId: null, distance: null, targetTime: null, cardioGoalType: null }, { day: 4, name: 'QUINTA-FEIRA', workoutType: 'cardio', workoutId: null, distance: null, targetTime: 30, cardioGoalType: 'time' }, { day: 5, name: 'SEXTA-FEIRA', workoutType: 'strength', workoutId: null, distance: null, targetTime: null, cardioGoalType: null }, { day: 6, name: 'SÁBADO', workoutType: 'rest', workoutId: null, distance: null, targetTime: null, cardioGoalType: null }, { day: 0, name: 'DOMINGO', workoutType: 'rest', workoutId: null, distance: null, targetTime: null, cardioGoalType: null } ];


// =================================================================================
// COMPONENTE PARA O CONTEÚDO PRINCIPAL DO APP (QUANDO LOGADO)
// =================================================================================
const MainApp: React.FC = () => {
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
    const workoutTimerRef = useRef<NodeJS.Timeout | null>(null);
    const restTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // FUNÇÕES RESTAURADAS
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
                const transformedData = data.map((day: any) => ({
                    id: day.id, day: day.day, name: day.name, workoutType: day.workout_type,
                    workoutId: day.workout_id, cardioGoalType: day.cardio_goal_type,
                    distance: day.distance, targetTime: day.target_time,
                }));
                setWeeklySchedule(transformedData);
            } else {
                const scheduleToSave = defaultSchedule.map(({ id, ...rest }: any) => rest);
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
            const scheduleToSave = newSchedule.map(day => ({ day: day.day, name: day.name, workout_type: day.workoutType, workout_id: day.workoutId, cardio_goal_type: day.cardioGoalType, distance: day.distance, target_time: day.targetTime }));
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

    const handleStartWorkout = (workout: DetailedWorkout) => { setActiveWorkout(workout); setIsWorkoutInProgress(true); setTotalWorkoutTime(0); };
    const handleSaveWorkout = () => { setShowIntensityModal(true); };

    const confirmSaveWorkoutWithIntensity = async (intensity: number) => {
        if (!activeWorkout) return;
        const exercisesCompleted = activeWorkout.exercises.filter(ex => ex.sets.length > 0 && ex.sets.every(s => s.completed)).length;
        const details: StrengthWorkoutDetails = { exercises: activeWorkout.exercises, exercisesCompleted, totalExercises: activeWorkout.exercises.length };
        const sessionData: Omit<WorkoutSession, 'id' | 'created_at' | 'user_id' | 'completed_at'> = { name: activeWorkout.name, type: 'strength', duration: totalWorkoutTime, week: currentWeek, intensity, details };
        try {
            const { error } = await supabase.from('workout_sessions').insert(sessionData as any);
            if (error) throw error;
            alert(`Treino Salvo! Duração: ${Math.floor(totalWorkoutTime / 60)} minutos.`);
        } catch (error) {
            console.error('Erro ao salvar a sessão de treino:', error);
            alert('Houve um erro ao salvar seu treino. Tente novamente.');
        } finally {
            setShowIntensityModal(false);
            setIsWorkoutInProgress(false);
            setActiveWorkout(null);
            setTotalWorkoutTime(0);
        }
    };

    const handleSaveCardio = async (cardioData: { distance: number, time: number, pace: string }) => {
        const details: CardioWorkoutDetails = { distance: cardioData.distance, pace: cardioData.pace };
        const sessionData: Omit<WorkoutSession, 'id' | 'created_at' | 'user_id' | 'completed_at' | 'intensity'> = { name: `Corrida ${cardioData.distance}km`, type: 'cardio', duration: cardioData.time * 60, week: currentWeek, details };
        try {
            const { error } = await supabase.from('workout_sessions').insert(sessionData as any);
            if (error) throw error;
            alert('Corrida salva com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar a sessão de cardio:', error);
            alert('Houve um erro ao salvar sua corrida. Tente novamente.');
        }
    };

    const handleSetChange = (exId: string, setId: string, field: 'achievedReps' | 'achievedLoad' | 'restTime', value: string) => {
        if (!activeWorkout) return;
        const newWorkout = { ...activeWorkout, exercises: activeWorkout.exercises.map(ex => (ex.id === exId) ? { ...ex, sets: ex.sets.map(s => (s.id === setId) ? { ...s, [field]: (field === 'restTime' ? parseInt(value, 10) || 0 : value) } : s) } : ex) };
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
                })};
            }
            return ex;
        })};
        setActiveWorkout(newWorkout as DetailedWorkout);
        if (shouldStartTimer) {
            setActiveSetInfo({ exerciseName });
            setRestTimer(restTime);
            setIsRestTimerRunning(true);
        }
    };
    
    const stopRestTimer = () => setIsRestTimerRunning(false);

    useEffect(() => {
        const initialLoad = async () => {
            setLoading(true);
            await Promise.all([getWorkouts(), getWeeklySchedule()]);
            setLoading(false);
        };
        initialLoad();
    }, []);

    useEffect(() => {
        if (isWorkoutInProgress) { workoutTimerRef.current = setInterval(() => setTotalWorkoutTime(p => p + 1), 1000); } 
        else if (workoutTimerRef.current) { clearInterval(workoutTimerRef.current); }
        return () => { if (workoutTimerRef.current) clearInterval(workoutTimerRef.current); };
    }, [isWorkoutInProgress]);

    useEffect(() => {
        if (isRestTimerRunning && restTimer > 0) { restTimerIntervalRef.current = setInterval(() => setRestTimer(p => p > 0 ? p - 1 : 0), 1000); } 
        else if (isRestTimerRunning && restTimer === 0) { setIsRestTimerRunning(false); }
        return () => { if (restTimerIntervalRef.current) clearInterval(restTimerIntervalRef.current); };
    }, [isRestTimerRunning, restTimer]);

    const renderActiveComponent = () => {
        const workoutDashboardProps = {
            userWorkouts, weeklySchedule, loading, activeWorkout, isWorkoutInProgress, totalWorkoutTime,
            restTimer, isRestTimerRunning, activeSetInfo, currentWeek,
            onStartWorkout: handleStartWorkout,
            onSaveWorkout: handleSaveWorkout,
            onSetChange: handleSetChange,
            onToggleSetComplete: handleToggleSetComplete,
            onStopRestTimer: stopRestTimer,
            onSaveCardio: handleSaveCardio,
            onWeekChange: setCurrentWeek,
            onSaveMeasurement: handleSaveMeasurement, // A prop continua a mesma
        };
        switch (activeTab) {
            case 'workout': return <WorkoutDashboard {...workoutDashboardProps} />;
            case 'management': return <WorkoutManagement userWorkouts={userWorkouts} initialSchedule={weeklySchedule} onSaveSchedule={handleSaveSchedule} refetchWorkouts={getWorkouts} />;
            case 'history': return <WorkoutHistory />;
            case 'reports': return <Reports />;
            case 'settings': return <Settings />;
            default: return <WorkoutDashboard {...workoutDashboardProps} />;
        }
    };

    const handleSaveMeasurement = async (measurement: BodyMeasurement) => {
      setLoading(true);
      const { error } = await supabase.from('body_measurements').insert(measurement as any);

      if (error) {
          alert("Erro ao salvar medição: " + error.message);
      } else {
          alert("Medição salva com sucesso!");
      }
      setLoading(false);
  };
    return (
        <>
            {renderActiveComponent()}
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
            <IntensityModal isOpen={showIntensityModal} onClose={() => setShowIntensityModal(false)} onSave={confirmSaveWorkoutWithIntensity} />
        </>
    );
}

// =================================================================================
// COMPONENTE APP PRINCIPAL (Gerencia a sessão)
// =================================================================================
function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setLoading(false);
    }
    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-800"></div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!session ? <Auth /> : <MainApp key={session.user.id} /> }
    </div>
  );
}

export default App;