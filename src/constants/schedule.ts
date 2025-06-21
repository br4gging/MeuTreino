import { DaySchedule } from '../types/workout';

export const defaultSchedule: DaySchedule[] = [
  { day: 1, name: 'SEGUNDA-FEIRA', workoutType: 'strength', workoutId: null, distance: null, targetTime: null, cardioGoalType: null },
  { day: 2, name: 'TERÇA-FEIRA', workoutType: 'cardio', workoutId: null, distance: 5, targetTime: null, cardioGoalType: 'distance' },
  { day: 3, name: 'QUARTA-FEIRA', workoutType: 'strength', workoutId: null, distance: null, targetTime: null, cardioGoalType: null },
  { day: 4, name: 'QUINTA-FEIRA', workoutType: 'cardio', workoutId: null, distance: null, targetTime: 30, cardioGoalType: 'time' },
  { day: 5, name: 'SEXTA-FEIRA', workoutType: 'strength', workoutId: null, distance: null, targetTime: null, cardioGoalType: null },
  { day: 6, name: 'SÁBADO', workoutType: 'rest', workoutId: null, distance: null, targetTime: null, cardioGoalType: null },
  { day: 0, name: 'DOMINGO', workoutType: 'rest', workoutId: null, distance: null, targetTime: null, cardioGoalType: null }
]; 