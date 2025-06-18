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

export interface WeeklySchedule {
  day: number;
  workout: string;
  name: string;
  workoutId?: string;
}

export interface UserWorkout {
  id: string;
  name: string;
  exercises: Exercise[];
  createdAt: string;
}