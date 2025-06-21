import { supabase } from '../supabaseClient';
import { UserWorkout, Exercise } from '../types/workout';

// Buscar todos os treinos do usuário
export async function fetchUserWorkouts(userId: string): Promise<UserWorkout[]> {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('createdAt', { ascending: false });
  if (error) throw error;
  return data as UserWorkout[];
}

// Criar novo treino
export async function createWorkout(
  userId: string,
  name: string,
  exercises: Exercise[]
): Promise<UserWorkout> {
  const { data, error } = await supabase
    .from('workouts')
    .insert([{ user_id: userId, name, exercises }])
    .select()
    .single();
  if (error) throw error;
  return data as UserWorkout;
}

// Atualizar treino existente
export async function updateWorkout(
  workoutId: string,
  updates: Partial<Omit<UserWorkout, 'id' | 'createdAt'>>
): Promise<UserWorkout> {
  const { data, error } = await supabase
    .from('workouts')
    .update(updates)
    .eq('id', workoutId)
    .select()
    .single();
  if (error) throw error;
  return data as UserWorkout;
}

// Deletar treino
export async function deleteWorkout(workoutId: string): Promise<void> {
  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', workoutId);
  if (error) throw error;
} 