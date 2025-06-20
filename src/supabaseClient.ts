// ARQUIVO COMPLETO E CORRIGIDO FINALMENTE: src/supabaseClient.ts

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

// Pegue a URL e a chave da sua página de configurações da API no Supabase
const supabaseUrl = 'https://cfbgtgyxrwkzsdqyfkbi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmYmd0Z3l4cndrenNkcXlma2JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMDMyNTksImV4cCI6MjA2NTc3OTI1OX0.WB6okauKiEYAx15vBzm7gz7CXgt8O4DD_c8oztMKfmM';

// Definindo um tipo para o banco de dados para ter autocompletar
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
      } // <-- SEM PONTO-E-VÍRGULA AQUI
    },
    Enums: {
      workout_type: 'strength' | 'cardio'
    } // <-- SEM PONTO-E-VÍRGULA AQUI
  }
};

// Crie e exporte o cliente Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);