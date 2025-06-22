// ARQUIVO: src/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';
import { 
  UserWorkout, 
  DaySchedule, 
  WorkoutSession, 
  Profile, 
  BodyMeasurement, 
  CustomMeasurementField,
  UserMeasurementSource
} from './types/workout';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export type Database = {
  public: {
    Tables: {
      workouts: {
        Row: UserWorkout;
        Insert: Omit<UserWorkout, 'id' | 'createdAt'>;
        Update: Partial<UserWorkout>;
      },
      weekly_schedule: {
        Row: DaySchedule;
        Insert: Omit<DaySchedule, 'id'>;
        Update: Partial<Omit<DaySchedule, 'id'>>;
      },
      workout_sessions: {
        Row: WorkoutSession;
        Insert: Omit<WorkoutSession, 'id' | 'created_at' | 'user_id' | 'completed_at'>;
        Update: Partial<Omit<WorkoutSession, 'id' | 'created_at' | 'user_id' | 'completed_at'>>;
      },
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
      },
      body_measurements: {
        Row: BodyMeasurement;
        Insert: Omit<BodyMeasurement, 'id' | 'user_id' | 'created_at'>;
        Update: Partial<BodyMeasurement>;
      },
      custom_measurement_fields: {
        Row: CustomMeasurementField;
        Insert: Omit<CustomMeasurementField, 'id' | 'user_id' | 'created_at'>;
        Update: Partial<CustomMeasurementField>;
      },
      user_measurement_sources: {
        Row: UserMeasurementSource;
        Insert: Omit<UserMeasurementSource, 'id' | 'user_id' | 'created_at'>;
        Update: Partial<UserMeasurementSource>;
      } // <-- CORREÇÃO: Ponto e vírgula removido
    },
    Enums: {
      workout_type: 'strength' | 'cardio'
    } // <-- CORREÇÃO: Ponto e vírgula removido
  }
};

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
