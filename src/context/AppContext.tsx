// ARQUIVO: src/context/AppContext.tsx

import { createContext, useContext, ReactNode } from 'react';
import { UserWorkout, DaySchedule, DetailedWorkout, BodyMeasurement } from '../types/workout';

export interface ConfirmationState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

export interface AppState {
  loading: boolean;
  setLoading: (isLoading: boolean) => void;
  userWorkouts: UserWorkout[];
  weeklySchedule: DaySchedule[];
  activeWorkout: DetailedWorkout | null;
  isWorkoutInProgress: boolean;
  totalWorkoutTime: number;
  restTimer: number;
  isRestTimerRunning: boolean;
  activeSetInfo: { exerciseName: string };
  currentWeek: number;
  confirmationState: ConfirmationState;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showIntensityModal: boolean;
  setShowIntensityModal: (show: boolean) => void;
  refetchWorkouts: () => Promise<void>;
  handleSaveSchedule: (newSchedule: DaySchedule[]) => Promise<boolean>;
  onStartWorkout: (workout: DetailedWorkout) => void;
  onSaveWorkout: () => void;
  confirmSaveWorkoutWithIntensity: (intensity: number) => Promise<void>;
  onSaveCardio: (data: { distance: number; time: number; pace: string }) => Promise<void>;
  onSetChange: (exId: string, setId: string, field: 'achievedReps' | 'achievedLoad' | 'restTime', value: string) => void;
  onToggleSetComplete: (exId: string, setId: string) => void;
  onStopRestimer: () => void;
  onWeekChange: (week: number) => void;
  onSaveMeasurement: (measurement: BodyMeasurement) => Promise<void>;
  showToast: (message: string, options?: { type?: 'success' | 'error' }) => void;
  showConfirmation: (title: string, message: string, onConfirm: () => void) => void;
  hideConfirmation: () => void;
  onCancelWorkout: () => void; // Adicionado aqui
}

export const AppContext = createContext<AppState | undefined>(undefined);

export const useAppContext = (): AppState => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext deve ser usado dentro de um AppProvider');
  }
  return context;
};