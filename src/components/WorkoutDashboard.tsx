import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Zap, Target, TrendingUp, ArrowUp } from 'lucide-react';
import { workoutTemplates, cardioTemplate, weeklySchedule, weekProgression } from '../data/workoutTemplates';
import { WorkoutTemplate } from '../types/workout';

const WorkoutDashboard: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [todayWorkout, setTodayWorkout] = useState<WorkoutTemplate | null>(null);
  const [isCardioDay, setIsCardioDay] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [activeRestTime, setActiveRestTime] = useState<number>(0);

  useEffect(() => {
    // Get today's workout based on current day
    const today = new Date().getDay();
    const todaySchedule = weeklySchedule.find(s => s.day === today);
    
    if (todaySchedule?.workout === 'cardio-5k') {
      setIsCardioDay(true);
      setTodayWorkout(null);
    } else if (todaySchedule?.workout === 'training-a') {
      setTodayWorkout(workoutTemplates[0]);
      setIsCardioDay(false);
    } else if (todaySchedule?.workout === 'training-b') {
      setTodayWorkout(workoutTemplates[1]);
      setIsCardioDay(false);
    } else {
      setTodayWorkout(null);
      setIsCardioDay(false);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleCompleteSet = (exerciseId: string, restTime: number = 90) => {
    setActiveExerciseId(exerciseId);
    setActiveRestTime(restTime);
    setTimer(0);
    setIsTimerRunning(true);
    
    if (todayWorkout) {
      const updatedExercises = todayWorkout.exercises.map(ex => 
        ex.id === exerciseId 
          ? { ...ex, completed: Math.min(ex.completed + 1, ex.total) }
          : ex
      );
      setTodayWorkout({ ...todayWorkout, exercises: updatedExercises });
    }
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    setActiveExerciseId(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentWeekInfo = () => {
    return weekProgression[currentWeek - 1];
  };

  const todaySchedule = weeklySchedule.find(s => s.day === new Date().getDay());

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Treino de Hoje</h1>
              <p className="text-blue-200">
                {todaySchedule?.name} - {isCardioDay ? 'CORRIDA' : todayWorkout?.name || 'DESCANSO'}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5" />
                <span className="text-lg font-semibold">Semana {currentWeek}</span>
              </div>
              <p className="text-sm text-blue-200">
                RPE Alvo: {getCurrentWeekInfo().rpeTarget}
              </p>
            </div>
          </div>
        </div>

        {/* Week Progression Info */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold">Progressão da Semana</h3>
          </div>
          <p className="text-blue-200 text-sm">{getCurrentWeekInfo().description}</p>
          <div className="flex gap-2 mt-3">
            {weekProgression.map((week, index) => (
              <button
                key={week.week}
                onClick={() => setCurrentWeek(week.week)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  currentWeek === week.week
                    ? 'bg-amber-500 text-white'
                    : 'bg-white/20 text-blue-200 hover:bg-white/30'
                }`}
              >
                S{week.week}
              </button>
            ))}
          </div>
        </div>

        {/* Timer Display */}
        {isTimerRunning && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6" />
                <div>
                  <p className="font-semibold">Descanso Ativo</p>
                  <p className="text-sm opacity-90">
                    Exercício: {todayWorkout?.exercises.find(ex => ex.id === activeExerciseId)?.name}
                  </p>
                  <p className="text-xs opacity-75">
                    Tempo alvo: {formatTime(activeRestTime)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{formatTime(timer)}</p>
                <button
                  onClick={stopTimer}
                  className="bg-white/20 hover:bg-white/30 px-4 py-1 rounded-lg text-sm transition-colors"
                >
                  Parar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cardio Workout */}
        {isCardioDay && (
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-800">Corrida de 5km</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-600 font-medium">Distância</p>
                <p className="text-2xl font-bold text-blue-800">5.0 km</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm text-green-600 font-medium">Tempo Alvo</p>
                <p className="text-2xl font-bold text-green-800">30:00</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-sm text-purple-600 font-medium">Pace Alvo</p>
                <p className="text-2xl font-bold text-purple-800">6:00/km</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tempo Realizado (minutos)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 28.5"
                />
              </div>
              <button className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-teal-700 transition-all">
                Finalizar Corrida
              </button>
            </div>
          </div>
        )}

        {/* Strength Workout */}
        {todayWorkout && !isCardioDay && (
          <div className="space-y-4">
            {todayWorkout.exercises.map((exercise) => (
              <div key={exercise.id} className="bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{exercise.name}</h3>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Último peso</p>
                    <p className="text-lg font-bold text-gray-800">{exercise.lastWeight}kg</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-amber-50 rounded-xl p-3">
                    <p className="text-sm text-amber-600 font-medium">Aquecimento</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-6 h-6 bg-amber-400 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{exercise.warmupSets}</span>
                      </div>
                      <span className="text-lg font-bold text-amber-800">séries</span>
                    </div>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3">
                    <p className="text-sm text-emerald-600 font-medium">Trabalho</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-6 h-6 bg-emerald-400 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{exercise.workSets}</span>
                      </div>
                      <span className="text-lg font-bold text-emerald-800">séries</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-sm text-blue-600 font-medium">Repetições</p>
                    <p className="text-lg font-bold text-blue-800">{exercise.reps}</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3">
                    <p className="text-sm text-purple-600 font-medium">Descanso</p>
                    <p className="text-lg font-bold text-purple-800">{formatTime(exercise.restTime || 90)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-amber-400 rounded-full"></div>
                      <span className="text-sm text-gray-600">Aquecimento</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-emerald-400 rounded-full"></div>
                      <span className="text-sm text-gray-600">Trabalho</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {exercise.completed}/{exercise.total} séries
                    </span>
                    <button
                      onClick={() => handleCompleteSet(exercise.id, exercise.restTime)}
                      disabled={exercise.completed >= exercise.total}
                      className={`flex items-center gap-2 px-6 py-2 rounded-xl font-semibold transition-all ${
                        exercise.completed >= exercise.total
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      <ArrowUp className="w-4 h-4" />
                      +1 Série
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(exercise.completed / exercise.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rest Day */}
        {!todayWorkout && !isCardioDay && (
          <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Dia de Descanso</h2>
            <p className="text-gray-600 mb-6">
              Aproveite para recuperação ativa: caminhada leve, alongamento ou mobilidade
            </p>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-sm text-green-700">
                💡 A recuperação é tão importante quanto o treino para o seu progresso!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutDashboard;