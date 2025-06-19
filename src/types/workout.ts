// ARQUIVO COMPLETO: src/types/workout.ts

export interface DetailedSet {
  id: string;
  type: 'warmup' | 'work';
  setNumber: number;
  targetReps: string;
  achievedReps: string;
  achievedLoad: string;
  restTime: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  warmupSets: number;
  workSets: number;
  reps: string;
  rpe: string;
  lastWeight?: number;
  completed: number;
  total: number;
  restTime?: number;
  sets?: DetailedSet[];
}

export interface DetailedWorkout extends UserWorkout {
  exercises: (Exercise & { sets: DetailedSet[] })[];
}

export interface WorkoutSession {
  id: string;
  date: string;
  workoutId: string;
  type: 'strength' | 'cardio';
  exercises?: Exercise[];
  cardioData?: {
    distance: number;
    time: number;
    pace: number;
  };
  week: number;
  completed: boolean;
}

export interface WeekProgression {
  week: number;
  rpeTarget: string;
  description: string;
  volumeModifier: number;
}

// Interface para um dia da programação semanal
export interface DaySchedule {
  id?: string; // id é opcional, vem do banco mas não é criado manualmente
  day: number;
  name: string;
  workoutType: 'strength' | 'cardio' | 'rest';
  workoutId?: string | null;
  cardioGoalType?: 'distance' | 'time' | null;
  distance?: number | null;
  targetTime?: number | null;
}

export interface UserWorkout {
  id: string;
  name: string;
  exercises: Exercise[];
  createdAt: string;
}

// ARQUIVO: src/types/workout.ts
// Adicione estas novas interfaces ao final do arquivo.

// Detalhes específicos para um treino de força salvo.
export interface StrengthWorkoutDetails {
  exercises: (Exercise & { sets: DetailedSet[] })[];
  exercisesCompleted: number;
  totalExercises: number;
}

// Detalhes específicos para um treino de cardio salvo.
export interface CardioWorkoutDetails {
  distance: number;
  pace: string; // Ex: "5:30 min/km"
}

// A interface principal para uma entrada no histórico.
// Corresponde à nossa tabela 'workout_sessions'.
export interface WorkoutSession {
  id: string;
  created_at: string;
  user_id: string;
  completed_at: string;
  name: string;
  type: 'strength' | 'cardio';
  duration: number; // em segundos
  week: number;
  details: StrengthWorkoutDetails | CardioWorkoutDetails;
  intensity?: number;
}