// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'
import { UserWorkout, DaySchedule } from './types/workout'; // Importando o tipo

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
      };
      // 1. Adicione a definição da nova tabela aqui
      weekly_schedule: {
        Row: DaySchedule;
        Insert: Omit<DaySchedule, 'id'>;
        Update: Partial<Omit<DaySchedule, 'id'>>;
      };
    };
  };
};


// Crie e exporte o cliente Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);