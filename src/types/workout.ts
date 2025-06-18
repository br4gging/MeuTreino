// src/types/workout.ts

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
  day: number;
  name: string;
  workoutType: 'strength' | 'cardio' | 'rest';
  workoutId?: string | null;

  // Propriedades de Cardio
  cardioGoalType?: 'distance' | 'time';
  distance?: number;
  targetTime?: number;
}

export interface UserWorkout {
  id: string;
  name: string;
  exercises: Exercise[];
  createdAt: string;
}