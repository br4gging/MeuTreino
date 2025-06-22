import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import WeeklySchedulePanel from './WeeklySchedulePanel';
import UserWorkoutsList from './UserWorkoutsList';
import WorkoutForm from './WorkoutForm';
import { UserWorkout, DaySchedule, Exercise, SetTemplate } from '../../types/workout';
import { createWorkout, updateWorkout, deleteWorkout } from '../../lib/workoutApi';
import { supabase } from '../../supabaseClient';
import { Calendar } from 'lucide-react';

const WorkoutManagement: React.FC = () => {
  const {
    userWorkouts,
    weeklySchedule: initialSchedule,
    handleSaveSchedule: onSaveSchedule,
    refetchWorkouts,
    showConfirmation,
    showToast
  } = useAppContext();

  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
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

  // --- Schedule Handlers ---
  const handleScheduleChange = (day: number, field: string, value: any) => {
    if (!isEditingSchedule) return;
    setSchedule(current => current.map(s => {
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
    }));
  };
  
  const handleEditClick = () => setIsEditingSchedule(true);

  const handleCancelClick = () => {
    if (initialSchedule) setSchedule(initialSchedule);
    setIsEditingSchedule(false);
  };
  const handleSaveClick = async () => {
    const success = await onSaveSchedule(schedule);
    if (success) {
      setIsEditingSchedule(false);
    }
  };

  // --- Workout CRUD Handlers ---
  const handleCreateWorkout = () => {
    setIsCreatingWorkout(true);
    setEditingWorkout(null);
    setNewWorkoutName('');
    setExercises([]);
  };
  const handleEditWorkout = (workout: UserWorkout) => {
    setEditingWorkout(workout);
    setIsCreatingWorkout(true);
    setNewWorkoutName(workout.name);
    const migratedExercises = (workout.exercises || []).map((ex: any) => {
      const baseId = ex.id && typeof ex.id === 'string' ? ex.id : crypto.randomUUID();
      const setsWithIds = (ex.sets || []).map((s: any) => ({ ...s, id: s.id || crypto.randomUUID(), restTime: String(s.restTime || '90'), value: String(s.value || '2') }));
      return { ...ex, id: baseId, sets: setsWithIds };
    });
    setExercises(migratedExercises as Exercise[]);
  };
  const handleDeleteWorkout = async (workout: UserWorkout) => {
    showConfirmation(
      `Apagar Treino "${workout.name}"?`,
      'Esta ação não pode ser desfeita. Tem a certeza?',
      async () => {
        try {
          await deleteWorkout(workout.id);
          showToast('Treino apagado com sucesso.');
          refetchWorkouts();
        } catch (error: any) {
          showToast('Erro ao apagar o treino: ' + (error.message || error), { type: 'error' });
        }
      }
    );
  };

  // --- WorkoutForm Handlers ---
  const handleNameChange = (name: string) => setNewWorkoutName(name);
  const handleExerciseChange = (exerciseId: string, field: string, value: string) => {
    setExercises(prev => prev.map(ex => ex.id === exerciseId ? { ...ex, [field]: value } : ex));
  };
  const handleAddExercise = () => {
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
  const handleRemoveExercise = (exerciseId: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };
  const handleAddSet = (exerciseId: string, type: 'warmup' | 'work') => {
    const newSet: SetTemplate = { id: crypto.randomUUID(), type, value: type === 'warmup' ? '50' : '2', reps: type === 'warmup' ? '12' : '8-12', restTime: type === 'warmup' ? '60' : '120' };
    setExercises(prev => prev.map(ex => ex.id === exerciseId ? { ...ex, sets: [...ex.sets, newSet] } : ex));
  };
  const handleRemoveSet = (exerciseId: string, setId: string) => {
    setExercises(prev => prev.map(ex => (ex.id === exerciseId ? { ...ex, sets: ex.sets.filter(s => s.id !== setId) } : ex)));
  };
  const handleSetChange = (exerciseId: string, setId: string, field: string, value: string) => {
    setExercises(prev => prev.map(ex => (ex.id === exerciseId ? { ...ex, sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s) } : ex)));
  };
  const handleSaveWorkout = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToast('Usuário não autenticado.', { type: 'error' });
        return;
      }
      if (editingWorkout) {
        await updateWorkout(editingWorkout.id, { name: newWorkoutName, exercises });
        showToast('Treino atualizado!');
      } else {
        await createWorkout(user.id, newWorkoutName, exercises);
        showToast('Treino criado!');
      }
      setIsCreatingWorkout(false);
      setEditingWorkout(null);
      setNewWorkoutName('');
      setExercises([]);
      refetchWorkouts();
    } catch (error: any) {
      showToast('Erro ao salvar treino: ' + (error.message || error), { type: 'error' });
    }
  };

  return (
    <div className="min-h-screen p-4 pb-24 animate-fade-in-up">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-text-primary mb-2">Gerenciar Treinos</h1>
            <p className="text-text-muted">Crie seus treinos e organize sua rotina semanal.</p>
        </div>

        <WeeklySchedulePanel
          schedule={schedule}
          userWorkouts={userWorkouts}
          isEditing={isEditingSchedule}
          onEdit={handleEditClick}
          onCancel={handleCancelClick}
          onSave={handleSaveClick}
          onScheduleChange={handleScheduleChange}
        />

        {!isCreatingWorkout ? (
          <UserWorkoutsList
            userWorkouts={userWorkouts}
            onEdit={handleEditWorkout}
            onDelete={handleDeleteWorkout}
            onCreate={handleCreateWorkout}
          />
        ) : (
          <WorkoutForm
            workoutName={newWorkoutName}
            exercises={exercises}
            onNameChange={handleNameChange}
            onExerciseChange={handleExerciseChange}
            onAddExercise={handleAddExercise}
            onRemoveExercise={handleRemoveExercise}
            onAddSet={handleAddSet}
            onRemoveSet={handleRemoveSet}
            onSetChange={handleSetChange}
            onSave={handleSaveWorkout}
            onCancel={() => setIsCreatingWorkout(false)}
            isEditing={!!editingWorkout}
          />
        )}
      </div>
    </div>
  );
};

export default WorkoutManagement;