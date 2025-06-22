// ARQUIVO: src/types/workout.ts

export interface DetailedSet {
  id: string;
  type: 'warmup' | 'work';
  setNumber: number;
  targetReps: string;
  targetValue: string; // <-- ADICIONADO AQUI
  achievedReps: string;
  achievedLoad: string;
  restTime: number;
  completed: boolean;
  lastWeight?: number; 
}

export interface SetTemplate {
  id: string;
  type: 'warmup' | 'work';
  value: string; // Este campo guarda o RIR ou a % de Carga no molde
  reps: string;
  restTime: string; 
  lastWeight?: number;
}

export interface Exercise {
  id: string;
  name: string;
  sets: SetTemplate[];
  notes?: string;
  completed: number;
  total: number;
  rpe: string;
  detailedSets?: DetailedSet[]; 
}

export interface UserWorkout {
  id: string;
  name: string;
  exercises: Exercise[];
  createdAt: string;
}

export interface DetailedWorkout extends UserWorkout {
  exercises: (Exercise & { sets: DetailedSet[] })[];
}

export interface StrengthWorkoutDetails {
  exercises: (Exercise & { sets: DetailedSet[] })[];
  exercisesCompleted: number;
  totalExercises: number;
}

export interface CardioWorkoutDetails {
  distance: number;
  pace: string;
}

export interface WorkoutSession {
  id: string;
  created_at: string;
  user_id: string;
  completed_at: string;
  name: string;
  type: 'strength' | 'cardio';
  duration: number;
  week: number;
  details: StrengthWorkoutDetails | CardioWorkoutDetails;
  intensity?: number;
}

export interface DaySchedule {
  id?: string;
  user_id?: string;
  day: number;
  name: string;
  workoutType: 'strength' | 'cardio' | 'rest';
  workoutId?: string | null;
  cardioGoalType?: 'distance' | 'time' | null;
  distance?: number | null;
  targetTime?: number | null;
}

export interface Profile {
  id: string;
  updated_at?: string;
  display_name: string;
}

export interface CustomMeasurementField {
  id: string;
  user_id: string;
  field_key: string;
  label: string;
  unit: string;
}

export interface UserMeasurementSource {
  id: string;
  user_id: string;
  source_name: string;
  created_at: string;
}

export interface BodyMeasurement {
  id?: string;
  user_id?: string;
  created_at?: string;
  measured_at: string;
  source: string;
  weight_kg?: number;
  body_fat_percentage?: number;
  details?: { [key: string]: any };
}