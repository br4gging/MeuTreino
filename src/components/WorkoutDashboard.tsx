// ARQUIVO: src/components/WorkoutDashboard.tsx (COMPLETO E FINAL)

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Zap, Target, TrendingUp, HelpCircle, CheckSquare, ChevronDown, PlayCircle, Save, XCircle, ArrowLeft, ArrowRight, Scale } from 'lucide-react';
import { UserWorkout, DaySchedule, DetailedWorkout, DetailedSet, BodyMeasurement, Exercise } from '../types/workout';
import { MeasurementModal } from './MeasurementModal';

interface WorkoutDashboardProps {
  userWorkouts: UserWorkout[];
  weeklySchedule: DaySchedule[];
  loading: boolean;
  activeWorkout: DetailedWorkout | null;
  isWorkoutInProgress: boolean;
  totalWorkoutTime: number;
  restTimer: number;
  isRestTimerRunning: boolean;
  activeSetInfo: { exerciseName: string };
  currentWeek: number;
  onStartWorkout: (workout: DetailedWorkout) => void;
  onSaveWorkout: () => void;
  onSetChange: (exId: string, setId: string, field: 'achievedReps' | 'achievedLoad' | 'restTime', value: string) => void;
  onToggleSetComplete: (exId: string, setId: string) => void;
  onStopRestimer: () => void;
  onSaveCardio: (data: { distance: number; time: number; pace: string }) => void;
  onWeekChange: (week: number) => void;
  onSaveMeasurement: (measurement: BodyMeasurement) => void;
}

const WorkoutDashboard: React.FC<WorkoutDashboardProps> = ({
  userWorkouts, weeklySchedule, loading, activeWorkout, isWorkoutInProgress, totalWorkoutTime, restTimer, isRestTimerRunning, activeSetInfo, currentWeek,
  onStartWorkout, onSaveWorkout, onSetChange, onToggleSetComplete, onStopRestimer, onSaveCardio, onWeekChange, onSaveMeasurement
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workoutForDisplay, setWorkoutForDisplay] = useState<DetailedWorkout | null>(null);
  const [todayCardio, setTodayCardio] = useState<DaySchedule | null>(null);
  const [isRestDay, setIsRestDay] = useState(false);
  const [isUnscheduledStrengthDay, setIsUnscheduledStrengthDay] = useState(false);
  const [openExerciseId, setOpenExerciseId] = useState<string | null>(null);
  const [userInputDistance, setUserInputDistance] = useState('');
  const [userInputTime, setUserInputTime] = useState('');
  const [calculatedPace, setCalculatedPace] = useState<string | null>(null);
  const [showCardioConfirmation, setShowCardioConfirmation] = useState(false);
  const [isMeasurementModalOpen, setMeasurementModalOpen] = useState(false);

  useEffect(() => {
    if (!weeklySchedule || loading || isWorkoutInProgress) return;
    const dayOfWeek = selectedDate.getDay();
    const todaySchedule = weeklySchedule.find(s => s.day === dayOfWeek);
    setWorkoutForDisplay(null); setTodayCardio(null); setIsRestDay(false); setIsUnscheduledStrengthDay(false);
    
    if (todaySchedule) {
      switch (todaySchedule.workoutType) {
        case 'strength':
          const workout = userWorkouts.find(w => w.id === todaySchedule.workoutId);
          if (workout && Array.isArray(workout.exercises)) {
            const detailedWorkout: DetailedWorkout = { 
              ...workout, 
              exercises: workout.exercises.map((ex: any) => ({
                ...ex,
                id: ex.id || crypto.randomUUID(),
                sets: (ex.sets || []).map((setTemplate: any, index: number) => ({
                  id: setTemplate.id || crypto.randomUUID(),
                  type: setTemplate.type,
                  setNumber: index + 1,
                  targetReps: setTemplate.reps,
                  achievedReps: '',
                  achievedLoad: '',
                  restTime: parseInt(String(setTemplate.restTime), 10) || 90,
                  completed: false
                })),
              })) 
            };
            setWorkoutForDisplay(detailedWorkout);
            if (detailedWorkout.exercises.length > 0) { setOpenExerciseId(detailedWorkout.exercises[0].id); }
          } else { setIsUnscheduledStrengthDay(true); }
          break;
        case 'cardio': setTodayCardio(todaySchedule); setUserInputDistance(todaySchedule.distance?.toString() || ''); setUserInputTime(todaySchedule.targetTime?.toString() || ''); break;
        default: setIsRestDay(true); break;
      }
    } else { setIsRestDay(true); }
  }, [selectedDate, weeklySchedule, userWorkouts, loading, isWorkoutInProgress]);
  
  useEffect(() => { const dist = parseFloat(userInputDistance); const time = parseFloat(userInputTime); if (dist > 0 && time > 0) { const paceDec = time / dist; const paceMin = Math.floor(paceDec); const paceSec = Math.round((paceDec - paceMin) * 60); setCalculatedPace(`${paceMin}:${paceSec.toString().padStart(2, '0')}`); } else { setCalculatedPace(null); } }, [userInputDistance, userInputTime]);
  const handleCardioChange = (type: 'distance' | 'time', val: string) => { if (type === 'distance') setUserInputDistance(val); if (type === 'time') setUserInputTime(val); };
  const handleDateChange = (days: number) => { const newDate = new Date(selectedDate); newDate.setDate(selectedDate.getDate() + days); setSelectedDate(newDate); };
  const handleFinalizeCardio = () => { if (!userInputDistance || !userInputTime || !calculatedPace) { alert("Por favor, preencha a distância e o tempo."); return; } setShowCardioConfirmation(true); };
  const confirmSaveCardio = () => { if (userInputDistance && userInputTime && calculatedPace) { onSaveCardio({ distance: parseFloat(userInputDistance), time: parseFloat(userInputTime), pace: calculatedPace }); } setShowCardioConfirmation(false); };
  const formatTime = (s: number, h = false) => h ? `${Math.floor(s / 3600).toString().padStart(2, '0')}:${Math.floor((s % 3600) / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}` : `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const isExerciseComplete = (ex: any) => ex.sets && ex.sets.length > 0 && ex.sets.every((s: any) => s.completed);
  const formatDateHeader = (d: Date) => d.toDateString() === new Date().toDateString() ? 'HOJE' : d.toLocaleDateString('pt-BR', { weekday: 'long' }).toUpperCase();
  const formatDateSubheader = (d: Date) => { const m = d.toLocaleDateString('pt-BR', { month: 'long' }); return `${d.getDate()} de ${m.charAt(0).toUpperCase() + m.slice(1)}`; };
  const weekProgression = [ { week: 1, rpeTarget: '6-7', description: 'Foco na técnica e construção de volume base' }, { week: 2, rpeTarget: '7-8', description: 'Aumento do esforço e da carga' }, { week: 3, rpeTarget: '8-9', description: 'Picos de intensidade próximo à falha' }, { week: 4, rpeTarget: '6-7', description: 'Deload - Redução de volume para recuperação' } ];
  const getCurrentWeekInfo = () => weekProgression.find(w => w.week === currentWeek) || weekProgression[0];
  const currentWorkout = isWorkoutInProgress ? activeWorkout : workoutForDisplay;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-800 p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 text-white shadow-lg border"><div className="flex items-center justify-between text-gray-800"><button onClick={() => handleDateChange(-1)} disabled={isWorkoutInProgress} className="p-2 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"><ArrowLeft size={24} /></button><div className="text-center"><h1 className="text-xl font-bold tracking-wider">{formatDateHeader(selectedDate)}</h1><p className="text-sm text-gray-500">{formatDateSubheader(selectedDate)}</p></div><button onClick={() => handleDateChange(1)} disabled={isWorkoutInProgress} className="p-2 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"><ArrowRight size={24} /></button></div></div>
        {!isWorkoutInProgress && (<div className="bg-white rounded-2xl p-4 shadow-md border"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><Target className="w-5 h-5 text-amber-500" /><h3 className="font-semibold text-gray-700">Progressão Semanal</h3></div><div className="text-right"><div className="flex items-center gap-2 mb-1"><Calendar className="w-4 h-4 text-gray-500" /><span className="text-md font-semibold text-gray-800">Semana {currentWeek}</span></div><p className="text-xs text-gray-500">{getCurrentWeekInfo().rpeTarget}</p></div></div><p className="text-gray-600 text-sm mt-2">{getCurrentWeekInfo().description}</p><div className="flex gap-2 mt-3">{weekProgression.map((week) => (<button key={week.week} onClick={() => onWeekChange(week.week)} className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${currentWeek === week.week ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>S{week.week}</button>))}</div></div>)}
        {!isWorkoutInProgress && (<div className="bg-white rounded-2xl p-4 shadow-md border"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><Scale className="w-5 h-5 text-indigo-500" /><h3 className="font-semibold text-gray-700">Acompanhamento Corporal</h3></div><button onClick={() => setMeasurementModalOpen(true)} className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600 transition-colors text-sm">Registrar Medidas</button></div></div>)}
        {isRestTimerRunning && (<div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 text-white flex items-center justify-between shadow-lg"><div className="flex items-center gap-3"><Clock className="w-8 h-8" /><div><p className="font-semibold">Descanso</p><p className="text-sm opacity-90">{activeSetInfo.exerciseName}</p></div></div><div className="flex items-center gap-4"><p className="text-4xl font-bold">{formatTime(restTimer)}</p><button onClick={onStopRestimer} className="bg-white/20 p-2 rounded-full hover:bg-white/30"><XCircle size={20}/></button></div></div>)}
        
        {currentWorkout && !todayCardio && (
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-xl border">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 border-b pb-4"><h2 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">Musculação: {currentWorkout.name}</h2><div className="flex items-center gap-4">{isWorkoutInProgress && <span className="font-semibold text-lg text-gray-700 bg-gray-100 border px-3 py-1 rounded-lg">{formatTime(totalWorkoutTime, true)}</span>}{!isWorkoutInProgress ? (<button onClick={() => onStartWorkout(currentWorkout)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"><PlayCircle size={20} /> Iniciar Treino</button>) : (<button onClick={onSaveWorkout} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"><Save size={20} /> Salvar Treino</button>)}</div></div>
            <div className="space-y-4">
            {currentWorkout.exercises.map(ex => {
                let warmupCounter = 0;
                let workCounter = 0;
                return (
                <div key={ex.id} className={`rounded-2xl transition-all duration-300 overflow-hidden ${isExerciseComplete(ex) ? 'bg-green-100 border-green-200' : 'bg-white border'}`}>
                    <button onClick={() => setOpenExerciseId(openExerciseId === ex.id ? null : ex.id)} className="w-full flex items-center justify-between p-4 font-bold text-gray-800 text-lg text-left"><span>{ex.name}</span><ChevronDown className={`transition-transform ${openExerciseId === ex.id ? 'rotate-180' : ''}`} /></button>
                    {openExerciseId === ex.id && 
                        <div className="px-4 pb-4 space-y-2 border-t border-gray-200">
                            <div className="hidden sm:grid grid-cols-12 gap-2 text-center text-xs font-medium text-gray-500 px-2 pt-2"><span className="col-span-5 text-left"></span><span className="col-span-2">Carga (kg)</span><span className="col-span-2">Reps</span><span className="col-span-2">Descanso (s)</span><span className="col-span-1"></span></div>
                            {ex.sets && ex.sets.map(set => {
                                const isWarmup = set.type === 'warmup';
                                if (isWarmup) warmupCounter++; else workCounter++;
                                const label = isWarmup ? `Aquecimento ${warmupCounter}` : `Trabalho ${workCounter}`;
                                return (
                                    <div key={set.id} className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg ${set.completed ? 'bg-green-200' : 'bg-gray-50'}`}>
                                        <div className="col-span-12 sm:col-span-5 text-left"><p className="font-semibold text-gray-700 text-sm">{label}</p></div>
                                        <div className="col-span-4 sm:col-span-2"><input type="number" placeholder={ex.lastWeight ? `${ex.lastWeight}kg` : 'kg'} value={set.achievedLoad} onChange={e => onSetChange(ex.id, set.id, 'achievedLoad', e.target.value)} disabled={!isWorkoutInProgress} className="w-full p-1 border border-gray-300 rounded-md text-center disabled:bg-gray-200"/></div>
                                        <div className="col-span-4 sm:col-span-2"><input type="number" placeholder={set.targetReps} value={set.achievedReps} onChange={e => onSetChange(ex.id, set.id, 'achievedReps', e.target.value)} disabled={!isWorkoutInProgress} className="w-full p-1 border border-gray-300 rounded-md text-center disabled:bg-gray-200"/></div>
                                        <div className="col-span-3 sm:col-span-2"><input type="number" placeholder="s" value={set.restTime} onChange={e => onSetChange(ex.id, set.id, 'restTime', e.target.value)} disabled={!isWorkoutInProgress} className="w-full p-1 border border-gray-300 rounded-md text-center disabled:bg-gray-200"/></div>
                                        <div className="col-span-1 text-right"><button onClick={() => onToggleSetComplete(ex.id, set.id)} disabled={!isWorkoutInProgress} className={`p-2 rounded-full ${set.completed ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-green-300'} disabled:bg-gray-200 disabled:cursor-not-allowed`}><CheckSquare size={20} /></button></div>
                                    </div>
                                );
                            })}
                        </div>
                    }
                </div>
            )})}
            </div>
        </div>
        )}
        {todayCardio && !isWorkoutInProgress && <div className="bg-white rounded-2xl p-6 shadow-xl border"><div className="flex items-center gap-3 mb-6"><Zap className="w-6 h-6 text-orange-500" /><h2 className="text-2xl font-bold text-gray-800">Cardio do Dia</h2></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"><div className={`p-4 rounded-xl ${todayCardio.cardioGoalType === 'distance' ? 'bg-blue-100' : 'bg-gray-50'}`}><label className="block text-sm font-medium text-blue-700 mb-2">Distância (km)</label><input type="number" placeholder="0.0" value={userInputDistance} onChange={(e) => handleCardioChange('distance', e.target.value)} className="w-full bg-transparent text-3xl font-bold text-gray-800 focus:outline-none p-0 border-none"/></div><div className={`p-4 rounded-xl ${todayCardio.cardioGoalType === 'time' ? 'bg-green-100' : 'bg-gray-50'}`}><label className="block text-sm font-medium text-green-700 mb-2">Tempo (minutos)</label><input type="number" placeholder="0" value={userInputTime} onChange={(e) => handleCardioChange('time', e.target.value)} className="w-full bg-transparent text-3xl font-bold text-gray-800 focus:outline-none p-0 border-none"/></div></div>{calculatedPace && (<div className="bg-purple-50 rounded-xl p-4 mt-4 text-center"><p className="text-sm text-purple-600 font-medium">Seu Pace</p><p className="text-2xl font-bold text-purple-800">{calculatedPace} min/km</p></div>)}<button onClick={handleFinalizeCardio} className="w-full mt-6 bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-teal-700 disabled:opacity-50" disabled={!calculatedPace}>Finalizar Corrida</button></div>}
        {isUnscheduledStrengthDay && !isWorkoutInProgress && <div className="bg-white rounded-2xl p-8 shadow-xl text-center border"><div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4"><HelpCircle className="w-8 h-8 text-yellow-600" /></div><h2 className="text-2xl font-bold text-gray-800 mb-2">Nenhum treino selecionado</h2><p className="text-gray-600 mb-6">Hoje é dia de musculação, mas você ainda não escolheu um treino para o dia.</p><div className="bg-yellow-50 rounded-xl p-4"><p className="text-sm text-yellow-700">💡 Vá para a aba "Gerenciar" e selecione um treino para hoje!</p></div></div>}
        {isRestDay && !isWorkoutInProgress && <div className="bg-white rounded-2xl p-8 shadow-xl text-center border"><div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><TrendingUp className="w-8 h-8 text-green-600" /></div><h2 className="text-2xl font-bold text-gray-800 mb-2">Dia de Descanso</h2><p className="text-gray-600 mb-6">Aproveite para recuperação ativa: caminhada leve, alongamento ou mobilidade.</p><div className="bg-green-50 rounded-xl p-4"><p className="text-sm text-green-700">💡 A recuperação é tão importante quanto o treino para o seu progresso!</p></div></div>}
      </div>
      <MeasurementModal isOpen={isMeasurementModalOpen} onClose={() => setMeasurementModalOpen(false)} onSave={(measurement) => { onSaveMeasurement(measurement); setMeasurementModalOpen(false); }} />
      {showCardioConfirmation && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center"><h3 className="text-xl font-bold text-gray-800 mb-2">Confirmar Treino</h3><p className="text-gray-600 mb-6">Deseja salvar esta sessão de cardio?</p><div className="flex gap-4"><button onClick={() => setShowCardioConfirmation(false)} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50">Cancelar</button><button onClick={confirmSaveCardio} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700">Salvar</button></div></div></div>)}
    </div>
  );
};

export default WorkoutDashboard;