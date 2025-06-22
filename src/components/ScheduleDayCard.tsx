// ARQUIVO: src/components/ScheduleDayCard.tsx

import React from 'react';
import { Dumbbell, HeartPulse, BedDouble, ChevronDown } from 'lucide-react';
import { DaySchedule, UserWorkout } from '../types/workout';
import { formatKmForDisplay, formatMinutesSecondsInput, getMinutesSecondsUnmaskedValue } from '../utils/inputMasks';
import { IMaskInput } from 'react-imask';

interface ScheduleDayCardProps {
  day: DaySchedule;
  userWorkouts: UserWorkout[];
  onScheduleChange: (dayNumber: number, field: string, value: any) => void;
  isEditing: boolean;
}

const workoutTypeStyles = {
  strength: { label: 'Musculação', color: 'primary', ringColor: 'ring-primary', borderColor: 'border-primary' },
  cardio: { label: 'Cardio', color: 'secondary', ringColor: 'ring-secondary', borderColor: 'border-secondary' },
  rest: { label: 'Descanso', color: 'success', ringColor: 'ring-success', borderColor: 'border-success' },
};

const typeIcons = { strength: Dumbbell, cardio: HeartPulse, rest: BedDouble };

const ScheduleDayCard: React.FC<ScheduleDayCardProps> = ({ day, userWorkouts, onScheduleChange, isEditing }) => {
  const safeWorkoutType = day.workoutType || 'rest';
  const style = workoutTypeStyles[safeWorkoutType];
  const selectedWorkout = userWorkouts.find(w => w.id === day.workoutId);
  const TypeIcon = typeIcons[safeWorkoutType];

  // --- NOVA FUNÇÃO PARA O INPUT DE DISTÂNCIA ---
  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    // Pega apenas os dígitos para fazer a mágica da "calculadora"
    const digitsOnly = inputVal.replace(/\D/g, '');

    if (!digitsOnly) {
      onScheduleChange(day.day, 'distance', null); // Limpa o valor se o input estiver vazio
      return;
    }
    
    // Converte os dígitos para o valor numérico correto (ex: "524" -> 5.24)
    const numericValue = Number(digitsOnly) / 100;
    onScheduleChange(day.day, 'distance', numericValue);
  };

  const handleTargetTimeChange = (maskedValue: string) => {
    onScheduleChange(day.day, 'targetTime', getMinutesSecondsUnmaskedValue(maskedValue));
  };
  
  // Formata o valor da prop `day.distance` para exibição no input
  // Ex: 5.24 -> "5,24"
  const distanceDisplayValue = day.distance != null 
    ? day.distance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '';

  return (
    <div className={`bg-bg-secondary rounded-2xl p-4 transition-all duration-300 border-l-4 ${style.borderColor}`}>
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-lg text-text-primary tracking-wide">{day.name}</h4>
        <div className={`flex items-center gap-2 py-1 px-3 rounded-full bg-${style.color}/10 text-${style.color}`}>
          <TypeIcon className="w-4 h-4" />
          <span className="font-semibold text-sm">{style.label}</span>
        </div>
      </div>

      {isEditing ? (
        <div className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-2">
            {Object.entries(typeIcons).map(([type, Icon]) => {
                const typeStyle = workoutTypeStyles[type as keyof typeof workoutTypeStyles];
                return (
                <button
                    key={type}
                    onClick={() => onScheduleChange(day.day, 'workoutType', type)}
                    className={`px-3 py-2 text-sm font-semibold rounded-lg flex items-center justify-center transition-all duration-200 border-2
                        ${ safeWorkoutType === type
                            ? `bg-${typeStyle.color}/20 text-${typeStyle.color} border-${typeStyle.color}/50 shadow-inner`
                            : 'bg-black/20 text-text-muted border-transparent hover:border-white/20'
                        }`}
                >
                    <Icon className="w-5 h-5 mr-2" />
                    {typeStyle.label}
                </button>
            )})}
            </div>

            {day.workoutType === 'strength' && (
                <div className="relative">
                    <select value={day.workoutId || ''} onChange={(e) => onScheduleChange(day.day, 'workoutId', e.target.value)} className={`w-full px-4 py-3 bg-black/20 border-2 border-white/10 rounded-lg appearance-none text-text-primary font-semibold focus:ring-2 focus:${style.ringColor} focus:outline-none`}>
                        <option value="">— Selecione um treino —</option>
                        {userWorkouts.map((workout) => (<option key={workout.id} value={workout.id}>{workout.name}</option>))}
                    </select>
                    <ChevronDown className={`w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary`} />
                </div>
            )}
            {day.workoutType === 'cardio' && (
                <div className="flex gap-3">
                    <div className="flex-1">
                    <label className="block text-xs font-semibold text-text-muted mb-1">Distância (km)</label>
                    <input
                        type="text"
                        inputMode="decimal"
                        value={distanceDisplayValue}
                        onChange={handleDistanceChange}
                        placeholder="0,00"
                        className={`w-full p-2 bg-black/20 border-2 border-white/10 rounded-lg text-text-primary font-semibold focus:ring-2 focus:${style.ringColor} focus:outline-none`}
                    />
                    </div>
                    <div className="flex-1">
                    <label className="block text-xs font-semibold text-text-muted mb-1">Tempo (min)</label>
                    <IMaskInput
                        mask="00:00"
                        placeholderChar='0'
                        lazy={false}
                        overwrite={true}
                        value={formatMinutesSecondsInput(day.targetTime) || ''}
                        onAccept={(value: string) => handleTargetTimeChange(value)}
                        className={`w-full p-2 bg-black/20 border-2 border-white/10 rounded-lg text-text-primary font-semibold focus:ring-2 focus:${style.ringColor} focus:outline-none`}
                    />
                    </div>
                </div>
            )}
        </div>
      ) : (
        <div className="mt-2">
            {day.workoutType === 'strength' && ( <p className="text-sm text-text-secondary">Treino: <span className="font-semibold text-text-primary">{selectedWorkout?.name || 'Nenhum selecionado'}</span></p> )}
            {day.workoutType === 'cardio' && (
                <p className="text-sm text-text-secondary">Meta: <span className="font-semibold text-text-primary">
                    {day.distance ? `${formatKmForDisplay(day.distance)} km` : ''}
                    {day.distance && day.targetTime ? ' ou ' : ''}
                    {day.targetTime ? `${formatMinutesSecondsInput(day.targetTime)} min` : ''}
                    {!day.distance && !day.targetTime ? 'Nenhuma meta definida' : ''}
                </span></p>
            )}
        </div>
      )}
    </div>
  );
};

export default ScheduleDayCard;