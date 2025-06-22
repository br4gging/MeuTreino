// ARQUIVO: src/components/WorkoutDashboard/index.tsx

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { MeasurementModal } from '../MeasurementModal';
import WeeklyProgressPanel from './WeeklyProgressPanel';
import BodyTrackingPanel from './BodyTrackingPanel';
import CardioConfirmationModal from './CardioConfirmationModal';
import { formatTime, formatDateHeader, formatDateSubheader } from './utils';
import { Dumbbell, ArrowLeft, ArrowRight, Check, Timer, Activity, Zap, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserWorkout } from '../../types/workout';
import { IMaskInput } from 'react-imask';
import IMask from 'imask'; // Importar IMask aqui para usar MaskedRange
import { formatKmToIMaskNumber, formatKmForDisplay, formatMinutesSecondsInput, getKmUnmaskedValue, getMinutesSecondsUnmaskedValue } from '../../utils/inputMasks';


const weekProgression = [
  { week: 1, rpeTarget: 'RPE 6-7', description: 'Foco na técnica e construção de volume base' },
  { week: 2, rpeTarget: 'RPE 7-8', description: 'Aumento do esforço e da carga' },
  { week: 3, rpeTarget: 'RPE 8-9', description: 'Picos de intensidade próximo à falha' },
  { week: 4, rpeTarget: 'RPE 6-7', description: 'Deload - Redução de volume para recuperação' }
];

const WorkoutDashboard: React.FC = () => {
  const {
    userWorkouts, weeklySchedule, loading, activeWorkout, isWorkoutInProgress,
    totalWorkoutTime, restTimer, isRestTimerRunning, activeSetInfo, currentWeek,
    onStartWorkout, onSaveWorkout, onSetChange, onToggleSetComplete,
    onStopRestimer, onWeekChange, onSaveCardio, onSaveMeasurement, showToast, showConfirmation,
    onCancelWorkout
  } = useAppContext();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workoutForToday, setWorkoutForToday] = useState<UserWorkout | null>(null);
  const [todayCardio, setTodayCardio] = useState<any>(null);
  const [isRestDay, setIsRestDay] = useState(false);
  const [isUnscheduledStrengthDay, setIsUnscheduledStrengthDay] = useState(false);
  const [openExerciseId, setOpenExerciseId] = useState<string | null>(null);

  const [displayInputDistance, setDisplayInputDistance] = useState('');
  const [displayInputTime, setDisplayInputTime] = useState('');

  const [calculatedPace, setCalculatedPace] = useState<string | null>(null);
  const [showCardioConfirmation, setShowCardioConfirmation] = useState(false);
  const [isMeasurementModalOpen, setMeasurementModalOpen] = useState(false);

  useEffect(() => {
    if (isWorkoutInProgress) return;
    const dayOfWeek = selectedDate.getDay();
    const todaySchedule = weeklySchedule.find(s => s.day === dayOfWeek);

    setWorkoutForToday(null);
    setTodayCardio(null);
    setIsRestDay(false);
    setIsUnscheduledStrengthDay(false);

    if (todaySchedule) {
      switch (todaySchedule.workoutType) {
        case 'strength': {
          const workout = userWorkouts.find(w => w.id === todaySchedule.workoutId);
          if (workout) {
            const cleanWorkout = {
              ...workout,
              exercises: workout.exercises.map(ex => ({
                ...ex,
                id: ex.id || crypto.randomUUID(),
                sets: (ex.sets || []).map(set => ({
                  ...set,
                  id: set.id || crypto.randomUUID()
                }))
              }))
            };
            setWorkoutForToday(cleanWorkout);
            if (cleanWorkout.exercises.length > 0) {
              setOpenExerciseId(cleanWorkout.exercises[0].id);
            }
          } else {
            setIsUnscheduledStrengthDay(true);
          }
          break;
        }
        case 'cardio':
          setTodayCardio(todaySchedule);
          // Resetar para vazio para que os placeholders apareçam
          setDisplayInputDistance('');
          setDisplayInputTime('');
          break;
        default:
          setIsRestDay(true);
          break;
      }
    } else {
      setIsRestDay(true);
    }
  }, [selectedDate, weeklySchedule, userWorkouts, isWorkoutInProgress]);

  useEffect(() => {
    const dist = getKmUnmaskedValue(displayInputDistance);
    const timeInSeconds = getMinutesSecondsUnmaskedValue(displayInputTime);

    if (dist && dist > 0 && timeInSeconds && timeInSeconds > 0) {
      const paceInMinutesPerKm = (timeInSeconds / 60) / dist;
      const minutes = Math.floor(paceInMinutesPerKm);
      const seconds = Math.round((paceInMinutesPerKm - minutes) * 60);
      setCalculatedPace(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    } else {
      setCalculatedPace(null);
    }
  }, [displayInputDistance, displayInputTime]);

  const handleDateChange = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const handleFinalizeCardio = () => {
    const finalDistance = getKmUnmaskedValue(displayInputDistance);
    const finalTimeInSeconds = getMinutesSecondsUnmaskedValue(displayInputTime);

    if (finalDistance === null || finalDistance <= 0 || finalTimeInSeconds === null || finalTimeInSeconds <= 0 || !calculatedPace) {
      showToast("Por favor, preencha a distância e o tempo corretamente.", { type: 'error' });
      return;
    }
    setShowCardioConfirmation(true);
  };

  const confirmSaveCardio = () => {
    const finalDistance = getKmUnmaskedValue(displayInputDistance);
    const finalTimeInSeconds = getMinutesSecondsUnmaskedValue(displayInputTime);

    if (finalDistance !== null && finalTimeInSeconds !== null && calculatedPace) {
      onSaveCardio({ distance: finalDistance, time: finalTimeInSeconds, pace: calculatedPace });
    }
    setShowCardioConfirmation(false);
  };

  const handleCancelWorkoutClick = () => {
    showConfirmation(
      "Cancelar Treino?",
      "Tem certeza que deseja cancelar o treino em andamento? Todo o progresso não salvo será perdido.",
      () => {
        onCancelWorkout();
        showToast("Treino cancelado.");
      }
    );
  };

  const isExerciseComplete = (ex: any) => ex.sets.every((s: any) => s.completed);

  return (
    <div className="min-h-screen p-4 pb-24 animate-fade-in-up">
      <div className="max-w-4xl mx-auto space-y-6 relative">
        <AnimatePresence>
          {isRestTimerRunning && (
            <motion.div
              className="sticky top-4 z-40 card bg-success-gradient text-white flex items-center justify-between shadow-lg"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center gap-3">
                <Timer className="w-8 h-8"/>
                <div>
                  <p className="font-semibold">Descanso</p>
                  <p className="text-sm opacity-90">{activeSetInfo.exerciseName}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-4xl font-bold">{formatTime(restTimer)}</p>
                <button onClick={onStopRestimer} className="bg-white/20 p-2 rounded-full hover:bg-white/30"><X/></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between text-text-primary">
          <button onClick={() => handleDateChange(-1)} disabled={isWorkoutInProgress} className="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50"><ArrowLeft /></button>
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-wider">{formatDateHeader(selectedDate)}</h1>
            <p className="text-sm text-text-muted">{formatDateSubheader(selectedDate)}</p>
          </div>
          <button onClick={() => handleDateChange(1)} disabled={isWorkoutInProgress} className="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50"><ArrowRight /></button>
        </div>

        {!isWorkoutInProgress && (
          <>
            <WeeklyProgressPanel currentWeek={currentWeek} onWeekChange={onWeekChange} weekProgression={weekProgression} />
            <BodyTrackingPanel onOpenMeasurementModal={() => setMeasurementModalOpen(true)} />
          </>
        )}

        {workoutForToday && !isWorkoutInProgress && (
          <div className="card">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-text-primary mb-2 sm:mb-0">{workoutForToday.name}</h2>
              <button onClick={() => onStartWorkout(workoutForToday)} className="btn-primary flex items-center gap-2"><Dumbbell size={16} /> Iniciar Treino</button>
            </div>
            <div className="space-y-2 border-t border-white/10 pt-4">
                {workoutForToday.exercises.map(ex => (
                    <div key={ex.id} className="p-3 bg-bg-secondary rounded-lg text-sm">
                        <p className="font-semibold text-text-primary">{ex.name}</p>
                        <p className="text-text-muted">{ex.sets.length} séries</p>
                    </div>
                ))}
            </div>
          </div>
        )}

        {isWorkoutInProgress && activeWorkout && (
            <div className="card">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-4 border-b border-white/10 pb-4">
                    <h2 className="text-2xl font-bold text-text-primary mb-2 sm:mb-0">{activeWorkout.name}</h2>
                    <div className="flex items-center gap-4">
                        <span className="font-semibold text-lg text-text-secondary bg-black/20 border border-white/10 px-3 py-1 rounded-lg">{formatTime(totalWorkoutTime, true)}</span>
                        <button onClick={onSaveWorkout} className="btn bg-success text-white flex items-center gap-2"><Check size={16} /> Salvar Treino</button>
                        <button onClick={handleCancelWorkoutClick} className="btn bg-error text-white flex items-center gap-2">
                          <X size={16} /> Cancelar
                        </button>
                    </div>
                </div>
                <div className="space-y-4">
                {activeWorkout.exercises.map((ex) => (
                    <div key={ex.id} className={`rounded-2xl transition-all duration-300 overflow-hidden bg-bg-secondary border ${isExerciseComplete(ex) ? 'border-accent/50' : 'border-white/10'}`}>
                        <button onClick={() => setOpenExerciseId(openExerciseId === ex.id ? null : ex.id)} className="w-full flex items-center justify-between p-4 font-bold text-text-primary text-lg text-left">
                            <span>{ex.name}</span>
                            <div className="flex items-center gap-2">
                                {isExerciseComplete(ex) && <div className="w-3 h-3 rounded-full bg-accent animate-pulse"></div>}
                                <span className={`transition-transform ${openExerciseId === ex.id ? 'rotate-180' : ''}`}>▼</span>
                            </div>
                        </button>
                        {openExerciseId === ex.id && (
                        <div className="px-4 pb-4 space-y-2 border-t border-white/10">
                            <div className="hidden sm:grid grid-cols-10 gap-x-2 text-center text-xs font-medium text-text-muted px-2 pt-2">
                                <span className="col-span-4 text-left">Série</span>
                                <span className="col-span-2">Carga (kg)</span>
                                <span className="col-span-2">Reps</span>
                                <span className="col-span-2">Descanso</span>
                            </div>
                            {ex.sets.map((set) => {
                                const isWarmup = set.type === 'warmup';
                                const label = isWarmup ? `Aquecimento ${set.setNumber}` : `Trabalho ${set.setNumber}`;
                                return (
                                    <div key={set.id} className={`p-2 rounded-lg ${set.completed ? 'bg-accent/10' : 'bg-black/20'}`}>
                                      <div className="grid grid-cols-10 gap-x-2 items-center">
                                        <div className="col-span-12 sm:col-span-4 text-left mb-2 sm:mb-0">
                                          <p className={`font-semibold text-sm ${isWarmup ? 'text-yellow-400' : 'text-text-secondary'}`}>{label}</p>
                                          <p className="text-xs text-text-muted">{isWarmup ? `${set.targetValue}% Carga` : `${set.targetValue} RIR`}</p>
                                        </div>
                                        <div className="col-span-5 sm:col-span-2"><input type="number" placeholder={set.lastWeight ? `${set.lastWeight}` : 'kg'} value={set.achievedLoad} onChange={e => onSetChange(ex.id, set.id, 'achievedLoad', e.target.value)} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-center text-white"/></div>
                                        <div className="col-span-5 sm:col-span-2"><input type="number" placeholder={set.targetReps} value={set.achievedReps} onChange={e => onSetChange(ex.id, set.id, 'achievedReps', e.target.value)} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-center text-white"/></div>
                                        <div className="col-span-10 sm:col-span-2 flex items-center gap-1">
                                            <input type="number" value={set.restTime} onChange={e => onSetChange(ex.id, set.id, 'restTime', e.target.value)} className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-center text-white"/>
                                            <button onClick={() => onToggleSetComplete(ex.id, set.id)} className={`p-2 rounded-full transition-colors ${set.completed ? 'bg-accent text-bg-primary' : 'bg-white/10 hover:bg-accent/80'}`}><Check size={16} /></button>
                                        </div>
                                      </div>
                                    </div>
                                );
                            })}
                        </div>
                        )}
                    </div>
                ))}
                </div>
            </div>
        )}

        {todayCardio && !isWorkoutInProgress && (
          <div className="card bg-secondary-gradient/20 border-secondary">
            <div className="flex items-center gap-3 mb-6"><Activity className="w-6 h-6 text-accent" /> <h2 className="text-2xl font-bold text-text-primary">Cardio do Dia</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Distância (km)</label>
                  <IMaskInput
                    mask={Number}
                    // NOVIDADE: Passar um objeto de configuração completo para `mask`
                    mask={
                        {
                            mask: Number,
                            radix: ",",
                            scale: 2,
                            thousandsSeparator: "",
                            padFractionalZeros: true, // Garante que "5" vira "5,00"
                            normalizeZeros: true, // Garante que "05,00" vira "5,00"
                            autofix: true, // Tenta auto-ajustar a entrada (e.g. "332" para "3,32")
                            signed: false, // Remove o warning, agora é passado corretamente para o IMask
                            mapToRadix: ['.'], // Para converter . em , ao digitar
                            // Aqui você pode adicionar outras opções específicas para NumberMask
                        }
                    }
                    value={displayInputDistance} // Passa o valor que o IMask vai formatar
                    onAccept={(value: string) => setDisplayInputDistance(value)}
                    placeholder={todayCardio.distance ? formatKmForDisplay(todayCardio.distance) : "0,00"} // Usar formatKmForDisplay para placeholder
                    className="w-full bg-black/20 border-white/20 rounded-lg p-3 text-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Tempo (minutos)</label>
                    <IMaskInput
                      mask="HH:MM"
                      lazy={false}
                      overwrite={true}
                      placeholderChar="0"
                      blocks={{
                        HH: {
                          mask: IMask.MaskedRange,
                          from: 0,
                          to: 99,
                          autofix: true,
                          maxLength: 2
                        },
                        MM: {
                          mask: IMask.MaskedRange,
                          from: 0,
                          to: 59,
                          autofix: true,
                          maxLength: 2
                        },
                      }}
                      value={displayInputTime}
                      onAccept={(value: string) => setDisplayInputTime(value)}
                      placeholder="00:00"
                      className="w-full bg-black/20 border-white/20 rounded-lg p-3 text-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>
            </div>
            {calculatedPace && (<div className="bg-black/20 rounded-xl p-4 mt-4 text-center"><p className="text-sm text-text-muted font-medium">Seu Pace</p><p className="metric-value">{calculatedPace} <span className="text-lg text-text-secondary font-medium">min/km</span></p></div>)}
            <button onClick={handleFinalizeCardio} className="w-full mt-6 btn-primary flex items-center justify-center gap-2" disabled={!calculatedPace}><Zap size={16} /> Finalizar Corrida</button>
          </div>
        )}

        {isUnscheduledStrengthDay && !isWorkoutInProgress && (
          <div className="card text-center">
            <div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4"><Dumbbell className="w-8 h-8 text-warning" /></div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Nenhum treino selecionado</h2>
            <p className="text-text-muted mb-6">Hoje é dia de musculação. Selecione um treino na aba "Treinos" para começar.</p>
          </div>
        )}

        {isRestDay && !isWorkoutInProgress && (
          <div className="card text-center">
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4"><Zap className="w-8 h-8 text-success" /></div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Dia de Descanso</h2>
            <p className="text-text-muted">Aproveite para recuperar. A recuperação é tão importante quanto o treino!</p>
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