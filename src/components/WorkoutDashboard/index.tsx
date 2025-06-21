import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { MeasurementModal } from '../MeasurementModal';
import WeeklyProgressPanel from './WeeklyProgressPanel';
import BodyTrackingPanel from './BodyTrackingPanel';
import CardioConfirmationModal from './CardioConfirmationModal';
import { formatTime, formatDateHeader, formatDateSubheader } from './utils';

const weekProgression = [
  { week: 1, rpeTarget: '6-7', description: 'Foco na técnica e construção de volume base' },
  { week: 2, rpeTarget: '7-8', description: 'Aumento do esforço e da carga' },
  { week: 3, rpeTarget: '8-9', description: 'Picos de intensidade próximo à falha' },
  { week: 4, rpeTarget: '6-7', description: 'Deload - Redução de volume para recuperação' }
];

const WorkoutDashboard: React.FC = () => {
  const {
    userWorkouts, weeklySchedule, loading, activeWorkout, isWorkoutInProgress,
    totalWorkoutTime, restTimer, isRestTimerRunning, activeSetInfo, currentWeek,
    onStartWorkout, onSaveWorkout, onSetChange, onToggleSetComplete,
    onStopRestimer, onWeekChange, onSaveCardio, onSaveMeasurement, showToast
  } = useAppContext();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workoutForDisplay, setWorkoutForDisplay] = useState<any>(null);
  const [todayCardio, setTodayCardio] = useState<any>(null);
  const [isRestDay, setIsRestDay] = useState(false);
  const [isUnscheduledStrengthDay, setIsUnscheduledStrengthDay] = useState(false);
  const [openExerciseId, setOpenExerciseId] = useState<string | null>(null);
  const [userInputDistance, setUserInputDistance] = useState('');
  const [userInputTime, setUserInputTime] = useState('');
  const [calculatedPace, setCalculatedPace] = useState<string | null>(null);
  const [showCardioConfirmation, setShowCardioConfirmation] = useState(false);
  const [isMeasurementModalOpen, setMeasurementModalOpen] = useState(false);

  useEffect(() => {
    if (loading || isWorkoutInProgress) return;
    const dayOfWeek = selectedDate.getDay();
    const todaySchedule = weeklySchedule.find(s => s.day === dayOfWeek);
    setWorkoutForDisplay(null);
    setTodayCardio(null);
    setIsRestDay(false);
    setIsUnscheduledStrengthDay(false);
    if (todaySchedule) {
      switch (todaySchedule.workoutType) {
        case 'strength': {
          const workout = userWorkouts.find(w => w.id === todaySchedule.workoutId);
          if (workout && Array.isArray(workout.exercises)) {
            const detailedWorkout = {
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
            if (detailedWorkout.exercises.length > 0) {
              setOpenExerciseId(detailedWorkout.exercises[0].id);
            }
          } else {
            setIsUnscheduledStrengthDay(true);
          }
          break;
        }
        case 'cardio':
          setTodayCardio(todaySchedule);
          setUserInputDistance(todaySchedule.distance?.toString() || '');
          setUserInputTime(todaySchedule.targetTime?.toString() || '');
          break;
        default:
          setIsRestDay(true);
          break;
      }
    } else {
      setIsRestDay(true);
    }
  }, [selectedDate, weeklySchedule, userWorkouts, loading, isWorkoutInProgress]);

  useEffect(() => {
    const dist = parseFloat(userInputDistance);
    const time = parseFloat(userInputTime);
    if (dist > 0 && time > 0) {
      const paceDec = time / dist;
      const paceMin = Math.floor(paceDec);
      const paceSec = Math.round((paceDec - paceMin) * 60);
      setCalculatedPace(`${paceMin}:${paceSec.toString().padStart(2, '0')}`);
    } else {
      setCalculatedPace(null);
    }
  }, [userInputDistance, userInputTime]);

  const handleCardioChange = (type: 'distance' | 'time', val: string) => {
    if (type === 'distance') setUserInputDistance(val);
    if (type === 'time') setUserInputTime(val);
  };

  const handleDateChange = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const handleFinalizeCardio = () => {
    if (!userInputDistance || !userInputTime || !calculatedPace) {
      showToast("Por favor, preencha a distância e o tempo.", { type: 'error' });
      return;
    }
    setShowCardioConfirmation(true);
  };

  const confirmSaveCardio = () => {
    if (userInputDistance && userInputTime && calculatedPace) {
      onSaveCardio({ distance: parseFloat(userInputDistance), time: parseFloat(userInputTime), pace: calculatedPace });
    }
    setShowCardioConfirmation(false);
  };

  const isExerciseComplete = (ex: any) => ex.sets && ex.sets.length > 0 && ex.sets.every((s: any) => s.completed);
  const currentWorkout = isWorkoutInProgress ? activeWorkout : workoutForDisplay;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-800 p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 text-white shadow-lg border">
          <div className="flex items-center justify-between text-gray-800">
            <button onClick={() => handleDateChange(-1)} disabled={isWorkoutInProgress} className="p-2 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50">◀️</button>
            <div className="text-center">
              <h1 className="text-xl font-bold tracking-wider">{formatDateHeader(selectedDate)}</h1>
              <p className="text-sm text-gray-500">{formatDateSubheader(selectedDate)}</p>
            </div>
            <button onClick={() => handleDateChange(1)} disabled={isWorkoutInProgress} className="p-2 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50">▶️</button>
          </div>
        </div>

        {!isWorkoutInProgress && (
          <WeeklyProgressPanel currentWeek={currentWeek} onWeekChange={onWeekChange} weekProgression={weekProgression} />
        )}

        {!isWorkoutInProgress && (
          <BodyTrackingPanel onOpenMeasurementModal={() => setMeasurementModalOpen(true)} />
        )}

        {isRestTimerRunning && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8">⏱️</span>
              <div>
                <p className="font-semibold">Descanso</p>
                <p className="text-sm opacity-90">{activeSetInfo.exerciseName}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-4xl font-bold">{formatTime(restTimer)}</p>
              <button onClick={onStopRestimer} className="bg-white/20 p-2 rounded-full hover:bg-white/30">✖️</button>
            </div>
          </div>
        )}

        {/* Card de treino de força */}
        {currentWorkout && !todayCardio && (
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-xl border">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">Musculação: {currentWorkout.name}</h2>
              <div className="flex items-center gap-4">
                {isWorkoutInProgress && <span className="font-semibold text-lg text-gray-700 bg-gray-100 border px-3 py-1 rounded-lg">{formatTime(totalWorkoutTime, true)}</span>}
                {!isWorkoutInProgress ? (
                  <button onClick={() => onStartWorkout(currentWorkout)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">Iniciar Treino</button>
                ) : (
                  <button onClick={onSaveWorkout} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors">Salvar Treino</button>
                )}
              </div>
            </div>
            <div className="space-y-4">
              {currentWorkout.exercises.map((ex: any) => {
                let warmupCounter = 0;
                let workCounter = 0;
                return (
                  <div key={ex.id} className={`rounded-2xl transition-all duration-300 overflow-hidden ${isExerciseComplete(ex) ? 'bg-green-100 border-green-200' : 'bg-white border'}`}>
                    <button onClick={() => setOpenExerciseId(openExerciseId === ex.id ? null : ex.id)} className="w-full flex items-center justify-between p-4 font-bold text-gray-800 text-lg text-left">
                      <span>{ex.name}</span>
                      <span className={`transition-transform ${openExerciseId === ex.id ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    {openExerciseId === ex.id && (
                      <div className="px-4 pb-4 space-y-2 border-t border-gray-200">
                        <div className="hidden sm:grid grid-cols-12 gap-2 text-center text-xs font-medium text-gray-500 px-2 pt-2">
                          <span className="col-span-5 text-left"></span>
                          <span className="col-span-2">Carga (kg)</span>
                          <span className="col-span-2">Reps</span>
                          <span className="col-span-2">Descanso (s)</span>
                          <span className="col-span-1"></span>
                        </div>
                        {ex.sets && ex.sets.map((set: any) => {
                          const isWarmup = set.type === 'warmup';
                          if (isWarmup) warmupCounter++; else workCounter++;
                          const label = isWarmup ? `Aquecimento ${warmupCounter}` : `Trabalho ${workCounter}`;
                          return (
                            <div key={set.id} className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg ${set.completed ? 'bg-green-200' : 'bg-gray-50'}`}>
                              <div className="col-span-12 sm:col-span-5 text-left"><p className="font-semibold text-gray-700 text-sm">{label}</p></div>
                              <div className="col-span-4 sm:col-span-2"><input type="number" placeholder={ex.lastWeight ? `${ex.lastWeight}kg` : 'kg'} value={set.achievedLoad} onChange={e => onSetChange(ex.id, set.id, 'achievedLoad', e.target.value)} disabled={!isWorkoutInProgress} className="w-full p-1 border border-gray-300 rounded-md text-center disabled:bg-gray-200"/></div>
                              <div className="col-span-4 sm:col-span-2"><input type="number" placeholder={set.targetReps} value={set.achievedReps} onChange={e => onSetChange(ex.id, set.id, 'achievedReps', e.target.value)} disabled={!isWorkoutInProgress} className="w-full p-1 border border-gray-300 rounded-md text-center disabled:bg-gray-200"/></div>
                              <div className="col-span-3 sm:col-span-2"><input type="number" placeholder="s" value={set.restTime} onChange={e => onSetChange(ex.id, set.id, 'restTime', e.target.value)} disabled={!isWorkoutInProgress} className="w-full p-1 border border-gray-300 rounded-md text-center disabled:bg-gray-200"/></div>
                              <div className="col-span-1 text-right"><button onClick={() => onToggleSetComplete(ex.id, set.id)} disabled={!isWorkoutInProgress} className={`p-2 rounded-full ${set.completed ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-green-300'} disabled:bg-gray-200 disabled:cursor-not-allowed`}>✔️</button></div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Card de cardio do dia */}
        {todayCardio && !isWorkoutInProgress && (
          <div className="bg-white rounded-2xl p-6 shadow-xl border">
            <div className="flex items-center gap-3 mb-6"><span className="w-6 h-6 text-orange-500">⚡</span><h2 className="text-2xl font-bold text-gray-800">Cardio do Dia</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded-xl ${todayCardio.cardioGoalType === 'distance' ? 'bg-blue-100' : 'bg-gray-50'}`}><label className="block text-sm font-medium text-blue-700 mb-2">Distância (km)</label><input type="number" placeholder="0.0" value={userInputDistance} onChange={(e) => handleCardioChange('distance', e.target.value)} className="w-full bg-transparent text-3xl font-bold text-gray-800 focus:outline-none p-0 border-none"/></div>
              <div className={`p-4 rounded-xl ${todayCardio.cardioGoalType === 'time' ? 'bg-green-100' : 'bg-gray-50'}`}><label className="block text-sm font-medium text-green-700 mb-2">Tempo (minutos)</label><input type="number" placeholder="0" value={userInputTime} onChange={(e) => handleCardioChange('time', e.target.value)} className="w-full bg-transparent text-3xl font-bold text-gray-800 focus:outline-none p-0 border-none"/></div>
            </div>
            {calculatedPace && (<div className="bg-purple-50 rounded-xl p-4 mt-4 text-center"><p className="text-sm text-purple-600 font-medium">Seu Pace</p><p className="text-2xl font-bold text-purple-800">{calculatedPace} min/km</p></div>)}
            <button onClick={handleFinalizeCardio} className="w-full mt-6 bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-teal-700 disabled:opacity-50" disabled={!calculatedPace}>Finalizar Corrida</button>
          </div>
        )}

        {/* Card de dia não programado */}
        {isUnscheduledStrengthDay && !isWorkoutInProgress && (
          <div className="bg-white rounded-2xl p-8 shadow-xl text-center border">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4"><span className="w-8 h-8 text-yellow-600">❓</span></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Nenhum treino selecionado</h2>
            <p className="text-gray-600 mb-6">Hoje é dia de musculação, mas você ainda não escolheu um treino para o dia.</p>
            <div className="bg-yellow-50 rounded-xl p-4"><p className="text-sm text-yellow-700">💡 Vá para a aba "Gerir" e selecione um treino para hoje!</p></div>
          </div>
        )}

        {/* Card de descanso */}
        {isRestDay && !isWorkoutInProgress && (
          <div className="bg-white rounded-2xl p-8 shadow-xl text-center border">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><span className="w-8 h-8 text-green-600">📈</span></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Dia de Descanso</h2>
            <p className="text-gray-600 mb-6">Aproveite para recuperação ativa: caminhada leve, alongamento ou mobilidade.</p>
            <div className="bg-green-50 rounded-xl p-4"><p className="text-sm text-green-700">💡 A recuperação é tão importante quanto o treino para o seu progresso!</p></div>
          </div>
        )}

        <MeasurementModal 
          isOpen={isMeasurementModalOpen} 
          onClose={() => setMeasurementModalOpen(false)} 
          onSave={onSaveMeasurement} 
        />

        <CardioConfirmationModal
          isOpen={showCardioConfirmation}
          onCancel={() => setShowCardioConfirmation(false)}
          onConfirm={confirmSaveCardio}
        />
      </div>
    </div>
  );
};

export default WorkoutDashboard; 