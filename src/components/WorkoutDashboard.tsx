import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, Zap, Target, TrendingUp, HelpCircle, CheckSquare, ChevronDown, PlayCircle, Save, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { UserWorkout, DaySchedule, Exercise } from '../types/workout';

// --- Interfaces ---
interface DetailedSet { id: string; type: 'warmup' | 'work'; setNumber: number; targetReps: string; achievedReps: string; achievedLoad: string; restTime: number; completed: boolean; }
interface DetailedExercise extends Exercise { sets: DetailedSet[]; }
interface DetailedWorkout extends UserWorkout { exercises: DetailedExercise[]; }
interface WorkoutDashboardProps { userWorkouts: UserWorkout[]; weeklySchedule: DaySchedule[]; loading: boolean; }

const WorkoutDashboard: React.FC<WorkoutDashboardProps> = ({ userWorkouts, weeklySchedule, loading }) => {
  // --- Estados ---
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(1);
  const [todayWorkout, setTodayWorkout] = useState<DetailedWorkout | null>(null);
  const [todayCardio, setTodayCardio] = useState<DaySchedule | null>(null);
  const [isRestDay, setIsRestDay] = useState(false);
  const [isUnscheduledStrengthDay, setIsUnscheduledStrengthDay] = useState(false);
  const [openExerciseId, setOpenExerciseId] = useState<string | null>(null);
  const [userInputDistance, setUserInputDistance] = useState('');
  const [userInputTime, setUserInputTime] = useState('');
  const [calculatedPace, setCalculatedPace] = useState<string | null>(null);
  const [restTimer, setRestTimer] = useState(0);
  const [isRestTimerRunning, setIsRestTimerRunning] = useState(false);
  const [activeSetExerciseName, setActiveSetExerciseName] = useState('');
  const [totalWorkoutTime, setTotalWorkoutTime] = useState(0);
  const [isWorkoutInProgress, setIsWorkoutInProgress] = useState(false);
  const workoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- useEffects ---
  useEffect(() => {
    if (loading) return;
    const dayOfWeek = selectedDate.getDay();
    const todaySchedule = weeklySchedule.find(s => s.day === dayOfWeek);
    setTodayWorkout(null); setTodayCardio(null); setIsRestDay(false); setIsUnscheduledStrengthDay(false);
    if (todaySchedule) {
      switch (todaySchedule.workoutType) {
        case 'strength':
          const workout = userWorkouts.find(w => w.id === todaySchedule.workoutId);
          if (workout) {
            const detailedWorkout: DetailedWorkout = {
              ...workout,
              exercises: workout.exercises.map(ex => {
                const sets: DetailedSet[] = [];
                for (let i = 1; i <= (ex.warmupSets || 0); i++) sets.push({ id: `${ex.id}-w-${i}`, type: 'warmup', setNumber: i, targetReps: ex.reps, achievedReps: '', achievedLoad: '', restTime: ex.restTime || 60, completed: false });
                for (let i = 1; i <= (ex.workSets || 0); i++) sets.push({ id: `${ex.id}-t-${i}`, type: 'work', setNumber: i, targetReps: ex.reps, achievedReps: '', achievedLoad: '', restTime: ex.restTime || 90, completed: false });
                return { ...ex, sets };
              }),
            };
            setTodayWorkout(detailedWorkout);
            setOpenExerciseId(null);
          } else { setIsUnscheduledStrengthDay(true); }
          break;
        case 'cardio': setTodayCardio(todaySchedule); setUserInputDistance(''); setUserInputTime(''); setCalculatedPace(null); break;
        case 'rest': setIsRestDay(true); break;
        default: setIsRestDay(true); break;
      }
    } else { setIsRestDay(true); }
  }, [selectedDate, weeklySchedule, userWorkouts, loading]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRestTimerRunning && restTimer > 0) interval = setInterval(() => setRestTimer(p => p > 0 ? p - 1 : 0), 1000);
    else if (isRestTimerRunning && restTimer === 0) setIsRestTimerRunning(false);
    return () => clearInterval(interval);
  }, [isRestTimerRunning, restTimer]);

  useEffect(() => {
    if (isWorkoutInProgress) workoutTimerRef.current = setInterval(() => setTotalWorkoutTime(p => p + 1), 1000);
    else if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
    return () => { if (workoutTimerRef.current) clearInterval(workoutTimerRef.current); };
  }, [isWorkoutInProgress]);

  // --- Handlers ---
  const handleStartWorkout = () => setIsWorkoutInProgress(true);
  const handleSaveWorkout = () => { setIsWorkoutInProgress(false); alert('Treino Salvo! (funcionalidade a implementar)'); };
  const handleSetChange = (exId: string, setId: string, field: 'achievedReps'|'achievedLoad'|'restTime', val: string) => {
    if (!todayWorkout) return;
    const newWorkout = { ...todayWorkout, exercises: todayWorkout.exercises.map(ex => {
      if (ex.id === exId) return { ...ex, sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: val } : s) };
      return ex;
    })};
    setTodayWorkout(newWorkout);
  };
  const handleToggleSetComplete = (exId: string, setId: string, rest: number) => {
    if (!todayWorkout) return;
    let exName = ''; let shouldStart = false;
    const newWorkout = { ...todayWorkout, exercises: todayWorkout.exercises.map(ex => {
      if (ex.id === exId) {
        exName = ex.name;
        return { ...ex, sets: ex.sets.map(s => {
          if (s.id === setId) { if (!s.completed) shouldStart = true; return { ...s, completed: !s.completed }; }
          return s;
        })};
      }
      return ex;
    })};
    setTodayWorkout(newWorkout);
    if (shouldStart) { setActiveSetExerciseName(exName); setRestTimer(rest); setIsRestTimerRunning(true); }
  };
  const handleCardioChange = (type: 'distance'|'time', val: string) => {
    let dist = todayCardio?.cardioGoalType === 'distance' ? todayCardio.distance || 0 : parseFloat(userInputDistance);
    let time = todayCardio?.cardioGoalType === 'time' ? todayCardio.targetTime || 0 : parseFloat(userInputTime);
    if (type === 'distance') { dist = parseFloat(val); setUserInputDistance(val); } 
    else { time = parseFloat(val); setUserInputTime(val); }
    if (dist > 0 && time > 0) {
      const paceDec = time / dist; const paceMin = Math.floor(paceDec); const paceSec = Math.round((paceDec - paceMin) * 60);
      setCalculatedPace(`${paceMin}:${paceSec.toString().padStart(2, '0')}`);
    } else { setCalculatedPace(null); }
  };
  const handleDateChange = (days: number) => { const newDate = new Date(selectedDate); newDate.setDate(selectedDate.getDate() + days); setSelectedDate(newDate); };

  // --- Helpers ---
  const formatTime = (s: number, h = false) => h ? `${Math.floor(s/3600).toString().padStart(2,'0')}:${Math.floor((s%3600)/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}` : `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  const isExerciseComplete = (ex: DetailedExercise) => ex.sets.length > 0 && ex.sets.every(s => s.completed);
  
  // Funções de formatação de data ATUALIZADAS
  const formatDateHeader = (d: Date) => {
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'HOJE';
    return d.toLocaleDateString('pt-BR', { weekday: 'long' }).toUpperCase();
  };
  const formatDateSubheader = (d: Date) => {
    const month = d.toLocaleDateString('pt-BR', { month: 'long' });
    return `${d.getDate()} de ${month.charAt(0).toUpperCase() + month.slice(1)}`;
  };

  const weekProgression = [ { week: 1, rpeTarget: '6-7', description: 'Foco na técnica e construção de volume base' }, { week: 2, rpeTarget: '7-8', description: 'Aumento do esforço e da carga' }, { week: 3, rpeTarget: '8-9', description: 'Picos de intensidade próximo à falha' }, { week: 4, rpeTarget: '6-7', description: 'Deload - Redução de volume para recuperação' } ];
  const getCurrentWeekInfo = () => weekProgression[currentWeek - 1];

  // --- Renderização ---
  if (loading) { return ( <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-800 p-4 flex items-center justify-center"><p className="text-white text-xl">Carregando...</p></div> ); }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-800 p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 text-white shadow-lg border">
          <div className="flex items-center justify-between text-gray-800">
            <button onClick={() => handleDateChange(-1)} className="p-2 rounded-full hover:bg-gray-200 transition-colors"><ArrowLeft size={24} /></button>
            <div className="text-center">
              <h1 className="text-xl font-bold tracking-wider">{formatDateHeader(selectedDate)}</h1>
              <p className="text-sm text-gray-500">{formatDateSubheader(selectedDate)}</p>
            </div>
            <button onClick={() => handleDateChange(1)} className="p-2 rounded-full hover:bg-gray-200 transition-colors"><ArrowRight size={24} /></button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-md border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3"><Target className="w-5 h-5 text-amber-500" /><h3 className="font-semibold text-gray-700">Progressão Semanal</h3></div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1"><Calendar className="w-4 h-4 text-gray-500" /><span className="text-md font-semibold text-gray-800">Semana {currentWeek}</span></div>
              <p className="text-xs text-gray-500">RPE Alvo: {getCurrentWeekInfo().rpeTarget}</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-2">{getCurrentWeekInfo().description}</p>
          <div className="flex gap-2 mt-3">
            {weekProgression.map((week) => (<button key={week.week} onClick={() => setCurrentWeek(week.week)} className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${currentWeek === week.week ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>S{week.week}</button>))}
          </div>
        </div>
        
        {isRestTimerRunning && <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 text-white flex items-center justify-between shadow-lg"><div className="flex items-center gap-3"><Clock className="w-8 h-8" /><div><p className="font-semibold">Descanso</p><p className="text-sm opacity-90">{activeSetExerciseName}</p></div></div><div className="flex items-center gap-4"><p className="text-4xl font-bold">{formatTime(restTimer)}</p><button onClick={() => setIsRestTimerRunning(false)} className="bg-white/20 p-2 rounded-full hover:bg-white/30"><XCircle size={20}/></button></div></div>}

        {todayWorkout && <div className="bg-white rounded-2xl p-4 md:p-6 shadow-xl border"><div className="flex flex-col sm:flex-row items-center justify-between mb-4 border-b pb-4"><h2 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">Musculação: {todayWorkout.name}</h2><div className="flex items-center gap-4">{isWorkoutInProgress && <span className="font-semibold text-lg text-gray-700 bg-gray-100 border px-3 py-1 rounded-lg">{formatTime(totalWorkoutTime, true)}</span>}{!isWorkoutInProgress ? (<button onClick={handleStartWorkout} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"><PlayCircle size={20} /> Iniciar Treino</button>) : (<button onClick={handleSaveWorkout} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"><Save size={20} /> Salvar Treino</button>)}</div></div><div className="space-y-4">{todayWorkout.exercises.map(ex => (<div key={ex.id} className={`rounded-2xl transition-all duration-300 overflow-hidden ${isExerciseComplete(ex) ? 'bg-green-100 border-green-200' : 'bg-white border'}`}><button onClick={() => setOpenExerciseId(openExerciseId === ex.id ? null : ex.id)} className="w-full flex items-center justify-between p-4 font-bold text-gray-800 text-lg text-left"><span>{ex.name}</span><ChevronDown className={`transition-transform ${openExerciseId === ex.id ? 'rotate-180' : ''}`} /></button>{openExerciseId === ex.id && <div className="px-4 pb-4 space-y-2 border-t border-gray-200"><div className="hidden sm:grid grid-cols-12 gap-2 text-center text-xs font-medium text-gray-500 px-2 pt-2"><span className="col-span-5 text-left">Série</span><span className="col-span-2">Carga (kg)</span><span className="col-span-2">Reps</span><span className="col-span-2">Desc. (s)</span><span className="col-span-1"></span></div>{ex.sets.map(set => (<div key={set.id} className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg ${set.completed ? 'bg-green-200' : 'bg-gray-50'}`}><div className="col-span-12 sm:col-span-5 text-left"><p className="font-semibold text-gray-700 text-sm">{set.type === 'warmup' ? 'Aquec.' : 'Trabalho'} {set.setNumber}</p><p className="text-xs text-gray-500">Meta: {set.targetReps} reps</p></div><div className="col-span-4 sm:col-span-2"><input type="number" placeholder="kg" value={set.achievedLoad} onChange={e => handleSetChange(ex.id, set.id, 'achievedLoad', e.target.value)} disabled={!isWorkoutInProgress} className="w-full p-1 border border-gray-300 rounded-md text-center disabled:bg-gray-200"/></div><div className="col-span-4 sm:col-span-2"><input type="number" placeholder="nº" value={set.achievedReps} onChange={e => handleSetChange(ex.id, set.id, 'achievedReps', e.target.value)} disabled={!isWorkoutInProgress} className="w-full p-1 border border-gray-300 rounded-md text-center disabled:bg-gray-200"/></div><div className="col-span-3 sm:col-span-2"><input type="number" placeholder="s" value={set.restTime} onChange={e => handleSetChange(ex.id, set.id, 'restTime', e.target.value)} disabled={!isWorkoutInProgress} className="w-full p-1 border border-gray-300 rounded-md text-center disabled:bg-gray-200"/></div><div className="col-span-1 text-right"><button onClick={() => handleToggleSetComplete(ex.id, set.id, set.restTime)} disabled={!isWorkoutInProgress} className={`p-2 rounded-full ${set.completed ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-green-300'} disabled:bg-gray-200 disabled:cursor-not-allowed`}><CheckSquare size={20} /></button></div></div>))}</div>}</div>))}</div></div>}
        
        {todayCardio && <div className="bg-white rounded-2xl p-6 shadow-xl border"><div className="flex items-center gap-3 mb-6"><Zap className="w-6 h-6 text-orange-500" /><h2 className="text-2xl font-bold text-gray-800">Cardio do Dia</h2></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"><div className={`p-4 rounded-xl ${todayCardio.cardioGoalType === 'distance' ? 'bg-blue-100' : 'bg-gray-50'}`}><label className="block text-sm font-medium text-blue-700 mb-2">Distância (km)</label>{todayCardio.cardioGoalType === 'distance' ? <p className="text-3xl font-bold text-blue-900">{todayCardio.distance}</p> : <input type="number" placeholder="0.0" value={userInputDistance} onChange={(e) => handleCardioChange('distance', e.target.value)} className="w-full bg-transparent text-3xl font-bold text-gray-800 focus:outline-none p-0 border-none"/>}</div><div className={`p-4 rounded-xl ${todayCardio.cardioGoalType === 'time' ? 'bg-green-100' : 'bg-gray-50'}`}><label className="block text-sm font-medium text-green-700 mb-2">Tempo (minutos)</label>{todayCardio.cardioGoalType === 'time' ? <p className="text-3xl font-bold text-green-900">{todayCardio.targetTime}</p> : <input type="number" placeholder="0" value={userInputTime} onChange={(e) => handleCardioChange('time', e.target.value)} className="w-full bg-transparent text-3xl font-bold text-gray-800 focus:outline-none p-0 border-none"/>}</div></div>{calculatedPace && (<div className="bg-purple-50 rounded-xl p-4 mt-4 text-center"><p className="text-sm text-purple-600 font-medium">Seu Pace</p><p className="text-2xl font-bold text-purple-800">{calculatedPace} min/km</p></div>)}<button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-teal-700 transition-all disabled:opacity-50" disabled={!calculatedPace}>Finalizar Corrida</button></div>}

        {isUnscheduledStrengthDay && <div className="bg-white rounded-2xl p-8 shadow-xl text-center border"><div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4"><HelpCircle className="w-8 h-8 text-yellow-600" /></div><h2 className="text-2xl font-bold text-gray-800 mb-2">Nenhum treino selecionado</h2><p className="text-gray-600 mb-6">Hoje é dia de musculação, mas você ainda não escolheu um treino para o dia.</p><div className="bg-yellow-50 rounded-xl p-4"><p className="text-sm text-yellow-700">💡 Vá para a aba "Gerenciar" e selecione um treino para hoje!</p></div></div>}

        {isRestDay && <div className="bg-white rounded-2xl p-8 shadow-xl text-center border"><div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><TrendingUp className="w-8 h-8 text-green-600" /></div><h2 className="text-2xl font-bold text-gray-800 mb-2">Dia de Descanso</h2><p className="text-gray-600 mb-6">Aproveite para recuperação ativa: caminhada leve, alongamento ou mobilidade.</p><div className="bg-green-50 rounded-xl p-4"><p className="text-sm text-green-700">💡 A recuperação é tão importante quanto o treino para o seu progresso!</p></div></div>}
      </div>
    </div>
  );
};

export default WorkoutDashboard;