// ARQUIVO: src/components/ScheduleDayCard.tsx

import React from 'react';
import { Dumbbell, HeartPulse, BedDouble, ChevronDown } from 'lucide-react';
import { DaySchedule, UserWorkout } from '../types/workout';
import { formatKmToIMaskNumber, formatKmForDisplay, formatMinutesSecondsInput, getKmUnmaskedValue, getMinutesSecondsUnmaskedValue } from '../utils/inputMasks';
import { IMaskInput } from 'react-imask';
import IMask from 'imask'; // Importar IMask aqui para usar MaskedRange


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

  const [localDistanceInput, setLocalDistanceInput] = React.useState<string>(formatKmToIMaskNumber(day.distance));
  const [localTargetTimeInput, setLocalTargetTimeInput] = React.useState<string>(formatMinutesSecondsInput(day.targetTime));

  React.useEffect(() => {
    const newFormattedDistance = formatKmToIMaskNumber(day.distance);
    if (newFormattedDistance !== localDistanceInput) {
      setLocalDistanceInput(newFormattedDistance);
    }

    const newFormattedTime = formatMinutesSecondsInput(day.targetTime);
    if (newFormattedTime !== localTargetTimeInput) {
      setLocalTargetTimeInput(newFormattedTime);
    }
  }, [day.distance, day.targetTime, localDistanceInput, localTargetTimeInput]);


  const handleDistanceChange = (maskedValue: string) => {
    setLocalDistanceInput(maskedValue);
    onScheduleChange(day.day, 'distance', getKmUnmaskedValue(maskedValue));
  };

  const handleTargetTimeChange = (maskedValue: string) => {
    setLocalTargetTimeInput(maskedValue);
    onScheduleChange(day.day, 'targetTime', getMinutesSecondsUnmaskedValue(maskedValue));
  };


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
                    <IMaskInput
                        mask={Number}
                        mask={{
                            mask: Number,
                            radix: ",",
                            scale: 2,
                            thousandsSeparator: "",
                            padFractionalZeros: true,
                            normalizeZeros: true,
                            autofix: true,
                            signed: false,
                            mapToRadix: ['.'],
                        }}
                        value={localDistanceInput}
                        onAccept={(value: string) => handleDistanceChange(value)}
                        placeholder="0,00"
                        className={`w-full p-2 bg-black/20 border-2 border-white/10 rounded-lg text-text-primary font-semibold focus:ring-2 focus:${style.ringColor} focus:outline-none`}
                    />
                    </div>
                    <div className="flex-1">
                    <label className="block text-xs font-semibold text-text-muted mb-1">Tempo (min)</label>
                    <IMaskInput
                        mask="HH:MM"
                        lazy={false}
                        overwrite={true}
                        placeholderChar="0"
                        blocks={{
                          HH: {
                            mask: IMask.MaskedRange,
                            from: 0,
                            to: 99,
                            autofix: true,
                            maxLength: 2
                          },
                          MM: {
                            mask: IMask.MaskedRange,
                            from: 0,
                            to: 59,
                            autofix: true,
                            maxLength: 2
                          },
                        }}
                        value={localTargetTimeInput}
                        onAccept={(value: string) => handleTargetTimeChange(value)}
                        placeholder="00:00"
                        className={`w-full p-2 bg-black/20 border-2 border-white/10 rounded-lg text-text-primary font-semibold focus:ring-2 focus:${style.ringColor} focus:outline-none`}
                    />
                    </div>
                </div>
            )}
        </div>
      ) : (
        <div className="mt-2">
            {day.workoutType === 'strength' && (
                <p className="text-sm text-text-secondary">Treino: <span className="font-semibold text-text-primary">{selectedWorkout?.name || 'Nenhum selecionado'}</span></p>
            )}
            {day.workoutType === 'cardio' && (
                <p className="text-sm text-text-secondary">Meta: <span className="font-semibold text-text-primary">
                    {day.distance ? `${formatKmForDisplay(day.distance)} km` : ''}
                    {day.distance && day.targetTime ? ' ou ' : ''}
                    {day.targetTime ? `${formatMinutesSecondsInput(day.targetTime)} min` : 'Nenhuma meta definida'}
                </span></p>
            )}
        </div>
      )}
    </div>
  );
};

export default ScheduleDayCard;