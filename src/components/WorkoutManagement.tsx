// src/components/WorkoutManagement.tsx

import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Play, Pause, RotateCcw, ArrowUp, Clock, Dumbbell } from 'lucide-react';
import { UserWorkout, Exercise } from '../types/workout';
import { supabase } from '../supabaseClient'; // Importe o cliente Supabase

const WorkoutManagement: React.FC = () => {
  // O estado dos treinos agora virá do Supabase
  const [userWorkouts, setUserWorkouts] = useState<UserWorkout[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para o formulário e timer (continuam os mesmos)
  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<UserWorkout | null>(null);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [activeRestTime, setActiveRestTime] = useState<number>(0);
  
  
  // O estado do cronograma semanal permanece local por enquanto
  const [weeklySchedule, setWeeklySchedule] = useState([
    { day: 1, name: 'SEGUNDA-FEIRA', workout: 'strength', workoutId: '' },
    { day: 2, name: 'TERÇA-FEIRA', workout: 'cardio', distance: 5, targetTime: 30 },
    { day: 3, name: 'QUARTA-FEIRA', workout: 'strength', workoutId: '' },
    { day: 4, name: 'QUINTA-FEIRA', workout: 'cardio', distance: 5, targetTime: 30 },
    { day: 5, name: 'SEXTA-FEIRA', workout: 'strength', workoutId: '' },
    { day: 6, name: 'SÁBADO', workout: 'rest' },
    { day: 0, name: 'DOMINGO', workout: 'rest' }
  ]);

  // Efeito para buscar os treinos do Supabase
  useEffect(() => {
    getWorkouts();
  }, []);
  
  // Efeito para o timer (sem alterações)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Função para buscar os treinos
  const getWorkouts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) throw error;
      if (data) setUserWorkouts(data);
    } catch (error) {
      console.error('Erro ao buscar treinos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para salvar (criar ou editar) um treino
  const saveWorkout = async () => {
    if (!newWorkoutName.trim() || exercises.length === 0) return;

    const workoutData = {
      name: newWorkoutName,
      exercises: exercises.map(ex => ({ ...ex, total: ex.warmupSets + ex.workSets })),
    };

    try {
      if (editingWorkout) {
        // Atualiza um treino existente
        const { error } = await supabase
          .from('workouts')
          .update(workoutData)
          .eq('id', editingWorkout.id);
        if (error) throw error;
      } else {
        // Cria um novo treino
        const { error } = await supabase
          .from('workouts')
          .insert(workoutData);
        if (error) throw error;
      }
      resetForm();
      getWorkouts(); // Recarrega a lista de treinos
    } catch (error) {
      console.error('Erro ao salvar o treino:', error);
    }
  };

  // Função para deletar um treino
  const deleteWorkout = async (id: string) => {
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      getWorkouts(); // Recarrega a lista de treinos
    } catch (error) {
      console.error('Erro ao deletar o treino:', error);
    }
  };

  // Funções de manipulação do formulário e dos exercícios (sem alterações)
  const addExercise = () => {
    const newExercise: Exercise = {
      id: `exercise-${Date.now()}`,
      name: '',
      warmupSets: 2,
      workSets: 3,
      reps: '8-12',
      rpe: '7-9',
      completed: 0,
      total: 5,
      restTime: 90
    };
    setExercises([...exercises, newExercise]);
  };

  const updateExercise = (id: string, field: keyof Exercise, value: any) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, [field]: value, total: field === 'warmupSets' || field === 'workSets' ? (ex.warmupSets + ex.workSets) : ex.total } : ex
    ));
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
    // Assegura que exercises é um array
    setExercises(Array.isArray(workout.exercises) ? [...workout.exercises] : []);
    setIsCreatingWorkout(true);
  };
  
  // Funções do timer e do cronograma (sem alterações)
  const startTimer = (exerciseId: string, restTime: number) => {
    setActiveExerciseId(exerciseId);
    setActiveRestTime(restTime);
    setTimer(0);
    setIsTimerRunning(true);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    setActiveExerciseId(null);
    setTimer(0);
  };

  const resetTimer = () => {
    setTimer(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateSchedule = (day: number, field: string, value: any) => {
    setWeeklySchedule(schedule => 
      schedule.map(s => s.day === day ? { ...s, [field]: value } : s)
    );
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-800 p-4 flex items-center justify-center">
        <p className="text-white text-xl">Carregando treinos...</p>
      </div>
    );
  }
  
  // SUBSTITUA SEU BLOCO 'return' POR ESTE AQUI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-800 p-4 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Gerenciar Treinos</h1>
          <p className="text-blue-200">Crie e organize seus treinos personalizados</p>
        </div>

        {/* Timer Display */}
        {isTimerRunning && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6" />
                <div>
                  <p className="font-semibold">Descanso</p>
                  <p className="text-sm opacity-90">
                    Tempo alvo: {formatTime(activeRestTime)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{formatTime(timer)}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={isTimerRunning ? () => setIsTimerRunning(false) : () => setIsTimerRunning(true)}
                    className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm transition-colors flex items-center gap-1"
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={resetTimer}
                    className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={stopTimer}
                    className="bg-red-500/80 hover:bg-red-600/80 px-3 py-1 rounded-lg text-sm transition-colors"
                  >
                    Parar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Weekly Schedule Management */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Programação Semanal</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weeklySchedule.map((day) => (
              <div key={day.day} className="border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3">{day.name}</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Treino
                    </label>
                    <select
                      value={day.workout}
                      onChange={(e) => updateSchedule(day.day, 'workout', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="strength">Força</option>
                      <option value="cardio">Cardio</option>
                      <option value="rest">Descanso</option>
                    </select>
                  </div>

                  {day.workout === 'strength' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Treino
                      </label>
                      <select
                        value={day.workoutId || ''}
                        onChange={(e) => updateSchedule(day.day, 'workoutId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="">Selecionar treino</option>
                        {userWorkouts.map((workout) => (
                          <option key={workout.id} value={workout.id}>
                            {workout.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {day.workout === 'cardio' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Distância (km)
                        </label>
                        <input
                          type="number"
                          value={(day as any).distance || 5}
                          onChange={(e) => updateSchedule(day.day, 'distance', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tempo Alvo (min)
                        </label>
                        <input
                          type="number"
                          value={(day as any).targetTime || 30}
                          onChange={(e) => updateSchedule(day.day, 'targetTime', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Workouts List */}
        {!isCreatingWorkout && (
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Meus Treinos</h3>
              <button
                onClick={() => setIsCreatingWorkout(true)}
                className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-blue-700 hover:to-teal-700 transition-all flex items-center gap-2"
              >
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
                {userWorkouts.map((workout) => (
                  <div key={workout.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800">{workout.name}</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editWorkout(workout)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteWorkout(workout.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {Array.isArray(workout.exercises) ? workout.exercises.length : 0} exercícios
                    </p>
                    <div className="space-y-1">
                      {Array.isArray(workout.exercises) && workout.exercises.slice(0, 3).map((exercise) => (
                        <p key={exercise.id} className="text-xs text-gray-500">
                          • {exercise.name || 'Exercício sem nome'}
                        </p>
                      ))}
                      {Array.isArray(workout.exercises) && workout.exercises.length > 3 && (
                        <p className="text-xs text-gray-400">
                          +{workout.exercises.length - 3} mais...
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Workout Form */}
        {isCreatingWorkout && (
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {editingWorkout ? 'Editar Treino' : 'Criar Novo Treino'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Treino
                </label>
                <input
                  type="text"
                  value={newWorkoutName}
                  onChange={(e) => setNewWorkoutName(e.target.value)}
                  placeholder="Ex: Treino A - Peito e Tríceps"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-800">Exercícios</h4>
                  <button
                    onClick={addExercise}
                    className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Exercício
                  </button>
                </div>

                <div className="space-y-4">
                  {exercises.map((exercise, index) => (
                    <div key={exercise.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-600">
                          Exercício {index + 1}
                        </span>
                        <button
                          onClick={() => removeExercise(exercise.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome do Exercício
                          </label>
                          <input
                            type="text"
                            value={exercise.name}
                            onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                            placeholder="Ex: Supino Reto"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Repetições
                          </label>
                          <input
                            type="text"
                            value={exercise.reps}
                            onChange={(e) => updateExercise(exercise.id, 'reps', e.target.value)}
                            placeholder="Ex: 8-12"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Séries Aquecimento
                          </label>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-bold text-amber-600">
                                {exercise.warmupSets}
                              </span>
                            </div>
                            <input
                              type="number"
                              min="0"
                              max="5"
                              value={exercise.warmupSets}
                              onChange={(e) => updateExercise(exercise.id, 'warmupSets', parseInt(e.target.value))}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Séries Trabalho
                          </label>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-bold text-emerald-600">
                                {exercise.workSets}
                              </span>
                            </div>
                            <input
                              type="number"
                              min="1"
                              max="8"
                              value={exercise.workSets}
                              onChange={(e) => updateExercise(exercise.id, 'workSets', parseInt(e.target.value))}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            RPE
                          </label>
                          <input
                            type="text"
                            value={exercise.rpe}
                            onChange={(e) => updateExercise(exercise.id, 'rpe', e.target.value)}
                            placeholder="Ex: 7-9"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descanso (seg)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="30"
                              max="300"
                              step="15"
                              value={exercise.restTime || 90}
                              onChange={(e) => updateExercise(exercise.id, 'restTime', parseInt(e.target.value))}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                              onClick={() => startTimer(exercise.id, exercise.restTime || 90)}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                              title="Iniciar timer"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={saveWorkout}
                  disabled={!newWorkoutName.trim() || exercises.length === 0}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingWorkout ? 'Salvar Alterações' : 'Criar Treino'}
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
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