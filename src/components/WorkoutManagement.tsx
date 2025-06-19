import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Dumbbell, Save, X, ChevronDown, HeartPulse, BedDouble } from 'lucide-react';
import { UserWorkout, Exercise, DaySchedule } from '../types/workout';
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
  userWorkouts,
  initialSchedule,
  onSaveSchedule,
  refetchWorkouts,
}) => {
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<UserWorkout | null>(null);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    if (initialSchedule && initialSchedule.length > 0) {
      setSchedule([...initialSchedule]);
    }
  }, [initialSchedule]);

  const handleScheduleChange = (day: number, field: string, value: any) => {
    if (!isEditingSchedule) return;
    setSchedule(current =>
      current.map(s => {
        if (s.day === day) {
          const updatedDay = { ...s, [field]: value };
          if (field === 'workoutType') {
            if (value === 'strength' || value === 'rest') {
              updatedDay.cardioGoalType = null;
              updatedDay.distance = null;
              updatedDay.targetTime = null;
            }
            if (value === 'cardio' || value === 'rest') {
              updatedDay.workoutId = null;
            }
          }
          return updatedDay;
        }
        return s;
      })
    );
  };

  const handleEditClick = () => {
    setIsEditingSchedule(true);
    setIsScheduleOpen(true);
  };

  const handleCancelClick = () => {
    setSchedule(initialSchedule);
    setIsEditingSchedule(false);
    setIsScheduleOpen(false);
  };

  const handleSaveClick = async () => {
    const success = await onSaveSchedule(schedule);
    if (success) {
      setIsEditingSchedule(false);
      setIsScheduleOpen(false);
    }
  };

  // LÓGICA DE ORDENAÇÃO CORRIGIDA: Começa com Domingo (day: 0)
  const sortedSchedule = [...schedule].sort((a, b) => a.day - b.day);

  const saveWorkout = async () => {
    if (!newWorkoutName.trim() || exercises.length === 0) return;
    const workoutData = { name: newWorkoutName, exercises: exercises.map(ex => ({ ...ex, total: (ex.warmupSets || 0) + (ex.workSets || 0) })) };
    try {
      if (editingWorkout) {
        await supabase.from('workouts').update(workoutData).eq('id', editingWorkout.id);
      } else {
        await supabase.from('workouts').insert([{ ...workoutData, createdAt: new Date().toISOString() }]);
      }
      resetForm();
      refetchWorkouts();
    } catch (error) { console.error('Erro ao salvar o treino:', error); }
  };

  const deleteWorkout = async (id: string) => {
    try {
      await supabase.from('workouts').delete().eq('id', id);
      refetchWorkouts();
    } catch (error) { console.error('Erro ao deletar o treino:', error); }
  };

  const addExercise = () => {
    const newExercise: Exercise = { id: `exercise-${Date.now()}`, name: '', warmupSets: 2, workSets: 3, reps: '8-12', rpe: '7-9', completed: 0, total: 5, restTime: 90 };
    setExercises([...exercises, newExercise]);
  };

  const updateExercise = (id: string, field: keyof Exercise, value: any) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const resetForm = () => {
    setIsCreatingWorkout(false);
    setEditingWorkout(null);
    setNewWorkoutName('');
    setExercises([]);
  };

  const editWorkout = (workout: UserWorkout) => {
    setEditingWorkout(workout);
    setNewWorkoutName(workout.name);
    setExercises(Array.isArray(workout.exercises) ? [...workout.exercises] : []);
    setIsCreatingWorkout(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-800 p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Gerenciar Treinos</h1>
          <p className="text-blue-200">Crie seus treinos e organize sua rotina semanal.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl">
          <div className="flex items-center justify-between p-6">
            <button
              className="flex items-center gap-3 text-left w-full disabled:cursor-not-allowed"
              onClick={() => setIsScheduleOpen(!isScheduleOpen)}
              disabled={isEditingSchedule}
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Programação Semanal</h3>
              <ChevronDown className={`ml-2 w-6 h-6 text-purple-600 transition-transform duration-300 ${isScheduleOpen ? 'rotate-180' : ''}`} />
            </button>
            {!isEditingSchedule ? (
              <button onClick={handleEditClick} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex-shrink-0">
                <Edit3 className="w-4 h-4" />
                Editar
              </button>
            ) : (
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={handleCancelClick} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
                <button onClick={handleSaveClick} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors">
                  <Save className="w-4 h-4" />
                  Salvar
                </button>
              </div>
            )}
          </div>

          {/* LÓGICA DE EXIBIÇÃO CORRIGIDA para não "comer" espaço */}
          <div className="px-6 pb-6">
            {(isScheduleOpen || isEditingSchedule) ? (
              <div className="space-y-4 border-t pt-4">
                {sortedSchedule.map((day) => (
                  <ScheduleDayCard key={day.day} day={day} userWorkouts={userWorkouts} onScheduleChange={handleScheduleChange} isEditing={isEditingSchedule} />
                ))}
              </div>
            ) : (
              <div className="border-t pt-4">
                 <p className="text-gray-600 mb-4">Visão geral da sua semana. Clique no título para expandir ou em "Editar" para modificar.</p>
                 <div className="flex justify-around items-center pt-2">
                   {sortedSchedule.map(day => {
                     const dayInitial = day.name.charAt(0);
                     const visual = workoutTypeVisuals[day.workoutType];
                     if (!visual) return null;
                     const { Icon, color, label } = visual;
                     return (
                       <div key={day.day} className="flex flex-col items-center gap-2" title={label}>
                         <span className="font-bold text-gray-600">{dayInitial}</span>
                         <div className={`w-10 h-10 rounded-full ${color} shadow-lg flex items-center justify-center`}>
                           <Icon className="w-5 h-5 text-white" />
                         </div>
                       </div>
                     )
                   })}
                 </div>
              </div>
            )}
          </div>
        </div>

        {!isCreatingWorkout ? (
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Meus Treinos</h3>
              <button onClick={() => setIsCreatingWorkout(true)} className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-blue-700 hover:to-teal-700 transition-all flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Novo Treino
              </button>
            </div>
            {userWorkouts.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Dumbbell className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Nenhum treino criado</h4>
                <p className="text-gray-600">Crie seu primeiro treino personalizado</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userWorkouts.map(workout => (
                  <div key={workout.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800">{workout.name}</h4>
                      <div className="flex gap-2">
                        <button onClick={() => editWorkout(workout)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => deleteWorkout(workout.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{Array.isArray(workout.exercises) ? workout.exercises.length : 0} exercícios</p>
                    <div className="space-y-1">
                      {Array.isArray(workout.exercises) && workout.exercises.slice(0, 3).map(exercise => (
                        <p key={exercise.id} className="text-xs text-gray-500">• {exercise.name || 'Exercício sem nome'}</p>
                      ))}
                      {Array.isArray(workout.exercises) && workout.exercises.length > 3 && (
                        <p className="text-xs text-gray-400">+{workout.exercises.length - 3} mais...</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">{editingWorkout ? 'Editar Treino' : 'Criar Novo Treino'}</h3>
              <button onClick={resetForm} className="text-gray-600 hover:text-gray-800 transition-colors">✕</button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Treino</label>
                <input type="text" value={newWorkoutName} onChange={e => setNewWorkoutName(e.target.value)} placeholder="Ex: Treino A - Peito e Tríceps" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-800">Exercícios</h4>
                  <button onClick={addExercise} className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Adicionar Exercício
                  </button>
                </div>
                <div className="space-y-4">
                  {exercises.map((exercise, index) => (
                    <div key={exercise.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-600">Exercício {index + 1}</span>
                        <button onClick={() => removeExercise(exercise.id)} className="text-red-600 hover:text-red-800 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Exercício</label>
                          <input type="text" value={exercise.name} onChange={e => updateExercise(exercise.id, 'name', e.target.value)} placeholder="Ex: Supino Reto" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Repetições</label>
                          <input type="text" value={exercise.reps} onChange={e => updateExercise(exercise.id, 'reps', e.target.value)} placeholder="Ex: 8-12" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={saveWorkout} disabled={!newWorkoutName.trim() || exercises.length === 0} className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-teal-700 transition-all disabled:opacity-50">
                  {editingWorkout ? 'Salvar Alterações' : 'Criar Treino'}
                </button>
                <button onClick={resetForm} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutManagement;