// ARQUIVO: src/components/WorkoutManagement.tsx (COMPLETO E FINAL)

import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Dumbbell, Save, X, ChevronDown, HeartPulse, BedDouble, MinusCircle, PlusCircle } from 'lucide-react';
import { UserWorkout, Exercise, DaySchedule, SetTemplate } from '../types/workout';
import { supabase } from '../supabaseClient';
import ScheduleDayCard from './ScheduleDayCard';

interface WorkoutManagementProps {
  userWorkouts: UserWorkout[];
  initialSchedule: DaySchedule[];
  onSaveSchedule: (schedule: DaySchedule[]) => Promise<boolean>;
  refetchWorkouts: () => void;
}

const workoutTypeVisuals = {
    strength: { Icon: Dumbbell, color: 'bg-blue-500', label: 'Musculação' },
    cardio: { Icon: HeartPulse, color: 'bg-orange-500', label: 'Cardio' },
    rest: { Icon: BedDouble, color: 'bg-green-500', label: 'Descanso' },
};

const WorkoutManagement: React.FC<WorkoutManagementProps> = ({
  userWorkouts, initialSchedule, onSaveSchedule, refetchWorkouts,
}) => {
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<UserWorkout | null>(null);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => { if (initialSchedule?.length > 0) { setSchedule([...initialSchedule]); } }, [initialSchedule]);

  const handleScheduleChange = (day: number, field: string, value: any) => { if (!isEditingSchedule) return; setSchedule(current => current.map(s => { if (s.day === day) { const updatedDay = { ...s, [field]: value }; if (field === 'workoutType') { if (value === 'strength' || value === 'rest') { updatedDay.cardioGoalType = null; updatedDay.distance = null; updatedDay.targetTime = null; } if (value === 'cardio' || value === 'rest') { updatedDay.workoutId = null; } } return updatedDay; } return s; })); };
  const handleEditClick = () => { setIsEditingSchedule(true); setIsScheduleOpen(true); };
  const handleCancelClick = () => { setSchedule(initialSchedule); setIsEditingSchedule(false); setIsScheduleOpen(false); };
  const handleSaveClick = async () => { const success = await onSaveSchedule(schedule); if (success) { setIsEditingSchedule(false); setIsScheduleOpen(false); } };
  const sortedSchedule = [...schedule].sort((a, b) => a.day - b.day);
  const resetForm = () => { setIsCreatingWorkout(false); setEditingWorkout(null); setNewWorkoutName(''); setExercises([]); };

  const saveWorkout = async () => {
    if (!newWorkoutName.trim() || exercises.length === 0) return;
    const workoutData = { name: newWorkoutName, exercises: exercises.map(({ id, completed, total, rpe, lastWeight, detailedSets, ...rest }) => ({...rest, id, sets: rest.sets.map(({ id: setId, ...setRest }) => setRest) })) };
    try {
      if (editingWorkout) { await supabase.from('workouts').update({ name: workoutData.name, exercises: workoutData.exercises as any }).eq('id', editingWorkout.id);
      } else { await supabase.from('workouts').insert([{ name: workoutData.name, exercises: workoutData.exercises as any, createdAt: new Date().toISOString() }]); }
      resetForm();
      refetchWorkouts();
    } catch (error) { console.error('Erro ao salvar o treino:', error); }
  };

  const deleteWorkout = async (id: string) => { if (window.confirm("Tem certeza que deseja apagar este treino?")) { try { await supabase.from('workouts').delete().eq('id', id); refetchWorkouts(); } catch (error) { console.error('Erro ao deletar o treino:', error); } } };
  
  const addExercise = () => {
    const newExercise: Exercise = {
      id: crypto.randomUUID(),
      name: '',
      sets: [
        { id: crypto.randomUUID(), type: 'warmup', value: '50', reps: '12', restTime: '60' },
        { id: crypto.randomUUID(), type: 'work', value: '2', reps: '8-12', restTime: '120' },
      ],
      notes: '', completed: 0, total: 2, rpe: '8',
    };
    setExercises(prev => [...prev, newExercise]);
  };
  
  const removeExercise = (exerciseId: string) => { setExercises(prev => prev.filter(ex => ex.id !== exerciseId)); };
  const updateExerciseField = (exerciseId: string, field: 'name' | 'notes', value: string) => { setExercises(prev => prev.map(ex => ex.id === exerciseId ? { ...ex, [field]: value } : ex)); };
  const addSet = (exerciseId: string, type: 'warmup' | 'work') => { const newSet: SetTemplate = { id: crypto.randomUUID(), type, value: type === 'warmup' ? '50' : '2', reps: type === 'warmup' ? '12' : '8-12', restTime: type === 'warmup' ? '60' : '120' }; setExercises(prev => prev.map(ex => ex.id === exerciseId ? { ...ex, sets: [...ex.sets, newSet] } : ex)); };
  const removeSet = (exerciseId: string, setId: string) => { setExercises(prev => prev.map(ex => (ex.id === exerciseId ? { ...ex, sets: ex.sets.filter(s => s.id !== setId) } : ex))); };
  const updateSet = (exerciseId: string, setId: string, field: 'reps' | 'value' | 'restTime', value: string) => { setExercises(prev => prev.map(ex => (ex.id === exerciseId ? { ...ex, sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s) } : ex))); };
  
  const editWorkout = (workout: UserWorkout) => {
    setEditingWorkout(workout);
    setNewWorkoutName(workout.name);
    const migratedExercises = (workout.exercises || []).map((ex: any) => {
      const baseId = ex.id && typeof ex.id === 'string' ? ex.id : crypto.randomUUID();
      const setsWithIds = (ex.sets || []).map((s: any) => ({ ...s, id: s.id || crypto.randomUUID(), restTime: String(s.restTime || '90'), value: String(s.value || '2') }));
      return { ...ex, id: baseId, sets: setsWithIds };
    });
    setExercises(migratedExercises as Exercise[]);
    setIsCreatingWorkout(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-800 p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-white"><h1 className="text-3xl font-bold mb-2">Gerenciar Treinos</h1><p className="text-blue-200">Crie seus treinos e organize sua rotina semanal.</p></div>
        <div className="bg-white rounded-2xl shadow-xl">
          <div className="flex items-center justify-between p-6"><button className="flex items-center gap-3 text-left w-full disabled:cursor-not-allowed" onClick={() => setIsScheduleOpen(!isScheduleOpen)} disabled={isEditingSchedule}><div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><Dumbbell className="w-6 h-6 text-purple-600" /></div><h3 className="text-2xl font-bold text-gray-800">Programação Semanal</h3><ChevronDown className={`ml-2 w-6 h-6 text-purple-600 transition-transform duration-300 ${isScheduleOpen ? 'rotate-180' : ''}`} /></button>
            {!isEditingSchedule ? (<button onClick={handleEditClick} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex-shrink-0"><Edit3 className="w-4 h-4" />Editar</button>) : (<div className="flex gap-2 flex-shrink-0"><button onClick={handleCancelClick} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"><X className="w-4 h-4" />Cancelar</button><button onClick={handleSaveClick} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"><Save className="w-4 h-4" />Salvar</button></div>)}
          </div>
          <div className="px-6 pb-6">
            {(isScheduleOpen || isEditingSchedule) ? (<div className="space-y-4 border-t pt-4">{sortedSchedule.map((day) => (<ScheduleDayCard key={day.day} day={day} userWorkouts={userWorkouts} onScheduleChange={handleScheduleChange} isEditing={isEditingSchedule} />))}</div>) : (<div className="border-t pt-4"><p className="text-gray-600 mb-4">Visão geral da sua semana. Clique no título para expandir ou em "Editar" para modificar.</p><div className="flex justify-around items-center pt-2">{sortedSchedule.map(day => {const dayInitial = day.name.charAt(0); const visual = workoutTypeVisuals[day.workoutType as keyof typeof workoutTypeVisuals]; if (!visual) return null; const workoutName = day.workoutType === 'strength' ? userWorkouts.find(w => w.id === day.workoutId)?.name : null; return (<div key={day.day} className="flex flex-col items-center gap-2 text-center" title={visual.label}><span className="font-bold text-gray-600">{dayInitial}</span><div className={`w-10 h-10 rounded-full ${visual.color} shadow-lg flex items-center justify-center`}><visual.Icon className="w-5 h-5 text-white" /></div><p className="text-xs text-gray-500 w-20 truncate">{day.workoutType === 'rest' && 'Descanso'}{day.workoutType === 'cardio' && (day.distance ? `${day.distance}km` : `${day.targetTime}min`)}{day.workoutType === 'strength' && (workoutName || 'Nenhum')}</p></div>)})}</div></div>)}
          </div>
        </div>
        {!isCreatingWorkout ? (<div className="bg-white rounded-2xl p-6 shadow-xl"><div className="flex items-center justify-between mb-6"><h3 className="text-xl font-bold text-gray-800">Meus Treinos</h3><button onClick={() => setIsCreatingWorkout(true)} className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-blue-700 hover:to-teal-700 transition-all flex items-center gap-2"><Plus className="w-5 h-5" />Novo Treino</button></div>{userWorkouts.length === 0 ? (<div className="text-center py-8"><div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><Dumbbell className="w-8 h-8 text-gray-400" /></div><h4 className="text-lg font-semibold text-gray-800 mb-2">Nenhum treino criado</h4><p className="text-gray-600">Crie seu primeiro treino personalizado</p></div>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">{userWorkouts.map(workout => (<div key={workout.id} className="border border-gray-200 rounded-xl p-4"><div className="flex items-center justify-between mb-3"><h4 className="font-semibold text-gray-800">{workout.name}</h4><div className="flex gap-2"><button onClick={() => editWorkout(workout)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit3 className="w-4 h-4" /></button><button onClick={() => deleteWorkout(workout.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button></div></div><p className="text-sm text-gray-600 mb-2">{Array.isArray(workout.exercises) ? workout.exercises.length : 0} exercícios</p></div>))}</div>)}</div>) : 
        (<div className="bg-white rounded-2xl p-6 shadow-xl"><div className="flex items-center justify-between mb-6"><h3 className="text-xl font-bold text-gray-800">{editingWorkout ? 'Editar Treino' : 'Criar Novo Treino'}</h3><button onClick={resetForm} className="text-gray-600 hover:text-gray-800 transition-colors">✕</button></div><div className="space-y-6"><div><label className="block text-sm font-medium text-gray-700 mb-2">Nome do Treino</label><input type="text" value={newWorkoutName} onChange={e => setNewWorkoutName(e.target.value)} placeholder="Ex: Treino A - Peito e Tríceps" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" /></div><div><div className="flex items-center justify-between mb-4"><h4 className="text-lg font-semibold text-gray-800">Exercícios</h4><button onClick={addExercise} className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center gap-2"><Plus className="w-4 h-4" /> Adicionar Exercício</button></div><div className="space-y-4">{exercises.map((exercise, index) => (<div key={exercise.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50"><div className="flex items-center justify-between mb-4"><span className="text-sm font-bold text-blue-700">Exercício {index + 1}</span><button onClick={() => removeExercise(exercise.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button></div><div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Nome do Exercício</label><input type="text" value={exercise.name} onChange={e => updateExerciseField(exercise.id, 'name', e.target.value)} placeholder="Ex: Supino Reto com Halteres" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div><div className="space-y-3">{exercise.sets && exercise.sets.map(set => (<div key={set.id} className={`p-3 rounded-lg border ${set.type === 'warmup' ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}`}><div className="flex justify-between items-center"><h5 className="font-semibold text-sm">{set.type === 'warmup' ? 'Série de Aquecimento' : 'Série de Trabalho'}</h5><button onClick={() => removeSet(exercise.id, set.id)} className="text-gray-400 hover:text-red-500"><MinusCircle size={16} /></button></div><div className="grid grid-cols-3 gap-2 mt-2"><div><label className="block text-xs font-medium text-gray-600 mb-1">Repetições</label><input type="text" value={set.reps} onChange={e => updateSet(exercise.id, set.id, 'reps', e.target.value)} placeholder="8-12" className="w-full px-2 py-1 border border-gray-300 rounded-md" /></div><div><label className="block text-xs font-medium text-gray-600 mb-1">{set.type === 'warmup' ? '% Carga' : 'RIR'}</label><input type="text" value={set.value} onChange={e => updateSet(exercise.id, set.id, 'value', e.target.value)} placeholder={set.type === 'warmup' ? '50-60' : '2-3'} className="w-full px-2 py-1 border border-gray-300 rounded-md" /></div><div><label className="block text-xs font-medium text-gray-600 mb-1">Descanso (s)</label><input type="text" value={set.restTime} onChange={e => updateSet(exercise.id, set.id, 'restTime', e.target.value)} placeholder="90" className="w-full px-2 py-1 border border-gray-300 rounded-md" /></div></div></div>))}</div><div className="flex gap-2 mt-4"><button onClick={() => addSet(exercise.id, 'warmup')} className="flex-1 text-xs flex items-center justify-center gap-1 py-1 px-2 bg-yellow-400/50 text-yellow-800 rounded-md hover:bg-yellow-400/80"><PlusCircle size={14}/> Aquecimento</button><button onClick={() => addSet(exercise.id, 'work')} className="flex-1 text-xs flex items-center justify-center gap-1 py-1 px-2 bg-blue-400/50 text-blue-800 rounded-md hover:bg-blue-400/80"><PlusCircle size={14}/> Trabalho</button></div><div className="mt-4"><label className="block text-sm font-medium text-gray-700 mb-1">Observações do Exercício</label><input type="text" value={exercise.notes} onChange={e => updateExerciseField(exercise.id, 'notes', e.target.value)} placeholder="Ex: Focar na contração, cadência 2-1-2" className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div></div>))}</div></div><div className="flex gap-4"><button onClick={saveWorkout} disabled={!newWorkoutName.trim() || exercises.length === 0} className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-teal-700 transition-all disabled:opacity-50">{editingWorkout ? 'Salvar Alterações' : 'Criar Treino'}</button><button onClick={resetForm} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">Cancelar</button></div></div></div>)}
      </div>
    </div>
  );
};

export default WorkoutManagement;