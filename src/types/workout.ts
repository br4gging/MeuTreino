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
  restTime?: number; // in seconds, user-defined
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  type: 'strength' | 'cardio';
  exercises: Exercise[];
  isUserCreated?: boolean;
}

export interface CardioWorkout {
  id: string;
  name: string;
  type: 'cardio';
  distance: number; // in km
  targetTime?: number; // in minutes
  completedTime?: number;
  pace?: number; // calculated
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
// ... outras interfaces

export interface WeeklySchedule {
  day: number;
  name: string;
  workout_type: 'strength' | 'cardio' | 'rest'; // Renomeado de 'workout'
  workout_id?: string | null; // ID do treino de força
  distance?: number; // Para cardio
  target_time?: number; // Para cardio
}

export interface UserWorkout {
  id: string;
  name: string;
  exercises: Exercise[];
  createdAt: string;
}