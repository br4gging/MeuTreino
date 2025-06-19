import React from 'react';
import { Dumbbell, HeartPulse, BedDouble, ChevronDown } from 'lucide-react';
import { DaySchedule, UserWorkout } from '../types/workout';

interface ScheduleDayCardProps {
  day: DaySchedule;
  userWorkouts: UserWorkout[];
  onScheduleChange: (dayNumber: number, field: string, value: any) => void;
  isEditing: boolean;
}

const workoutTypeStyles = {
  strength: { label: 'Musculação', borderColor: 'border-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-600', ringColor: 'ring-blue-500' },
  cardio: { label: 'Cardio', borderColor: 'border-orange-500', bgColor: 'bg-orange-50', textColor: 'text-orange-600', ringColor: 'ring-orange-500' },
  rest: { label: 'Descanso', borderColor: 'border-green-500', bgColor: 'bg-green-50', textColor: 'text-green-600', ringColor: 'ring-green-500' },
};

const typeIcons = { strength: Dumbbell, cardio: HeartPulse, rest: BedDouble };

const ScheduleDayCard: React.FC<ScheduleDayCardProps> = ({ day, userWorkouts, onScheduleChange, isEditing }) => {
  const style = workoutTypeStyles[day.workoutType];
  if (!style) {
    return (
      <div className="bg-red-100 border-l-8 border-red-500 text-red-700 p-4 rounded-2xl">
        <p className="font-bold">Erro nos Dados</p>
        <p className="text-sm">Tipo de treino inválido para o dia: {day.name}.</p>
      </div>
    );
  }

  const selectedWorkout = userWorkouts.find(w => w.id === day.workoutId);
  const TypeIcon = typeIcons[day.workoutType];

  return (
    <div className={`bg-white rounded-2xl shadow-md border-l-8 ${style.borderColor} overflow-hidden transition-all duration-300`}>
      <div className="p-5">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-lg text-gray-800 tracking-wide">{day.name}</h4>
          <div className={`flex items-center gap-2 py-1 px-3 rounded-full ${style.bgColor} ${style.textColor}`}>
            <TypeIcon className="w-5 h-5" />
            <span className="font-semibold text-sm">{style.label}</span>
          </div>
        </div>
        
        {isEditing && (
            <div className="mt-4 grid grid-cols-3 gap-2">
            {Object.entries(typeIcons).map(([type, Icon]) => (
                <button
                    key={type}
                    onClick={() => onScheduleChange(day.day, 'workoutType', type)}
                    className={`px-3 py-2 text-sm font-semibold rounded-lg flex items-center justify-center transition-all duration-200 border-2 ${
                        day.workoutType === type
                        ? `${workoutTypeStyles[type as keyof typeof workoutTypeStyles].bgColor} ${workoutTypeStyles[type as keyof typeof workoutTypeStyles].textColor} ${workoutTypeStyles[type as keyof typeof workoutTypeStyles].borderColor} shadow-inner`
                        : 'bg-gray-100 text-gray-700 border-transparent hover:border-gray-300'
                    }`}
                >
                    <Icon className="w-5 h-5 mr-2" />
                    {workoutTypeStyles[type as keyof typeof workoutTypeStyles].label}
                </button>
            ))}
            </div>
        )}
      </div>

      {isEditing && day.workoutType === 'strength' && (
        <div className={`p-5 border-t-2 border-dashed ${style.borderColor} ${style.bgColor}`}>
            <label className={`block text-sm font-bold mb-2 ${style.textColor}`}>Treino do Dia</label>
            <div className="relative">
                <select value={day.workoutId || ''} onChange={(e) => onScheduleChange(day.day, 'workoutId', e.target.value)} className={`w-full px-4 py-3 border-2 ${style.borderColor} rounded-lg appearance-none ${style.bgColor} ${style.textColor} font-semibold focus:ring-2 ${style.ringColor} focus:outline-none`}>
                    <option value="">— Selecione um treino —</option>
                    {userWorkouts.map((workout) => (<option key={workout.id} value={workout.id}>{workout.name}</option>))}
                </select>
                <ChevronDown className={`w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${style.textColor}`} />
            </div>
        </div>
      )}
      {isEditing && day.workoutType === 'cardio' && (
        <div className={`p-5 border-t-2 border-dashed ${style.borderColor} ${style.bgColor}`}>
          <label className={`block text-sm font-bold mb-2 ${style.textColor}`}>Metas do Cardio</label>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Distância (km)</label>
              <input type="number" value={day.distance || ''} onChange={(e) => onScheduleChange(day.day, 'distance', parseFloat(e.target.value))} className={`w-full p-2 border-2 ${style.borderColor} rounded-lg ${style.bgColor} ${style.textColor} font-semibold focus:ring-2 ${style.ringColor} focus:outline-none`} />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tempo (min)</label>
              <input type="number" value={day.targetTime || ''} onChange={(e) => onScheduleChange(day.day, 'targetTime', parseInt(e.target.value, 10))} className={`w-full p-2 border-2 ${style.borderColor} rounded-lg ${style.bgColor} ${style.textColor} font-semibold focus:ring-2 ${style.ringColor} focus:outline-none`} />
            </div>
          </div>
        </div>
      )}

      {!isEditing && day.workoutType === 'strength' && (
         <div className={`px-5 pb-4`}>
            <div className={`p-3 rounded-lg ${style.bgColor}`}>
                <p className={`font-semibold ${style.textColor}`}>Treino: {selectedWorkout?.name || 'Nenhum selecionado'}</p>
            </div>
         </div>
      )}
       {!isEditing && day.workoutType === 'cardio' && (
         <div className={`px-5 pb-4`}>
            <div className={`p-3 rounded-lg ${style.bgColor}`}>
                <p className={`font-semibold ${style.textColor}`}>Meta: {day.distance ? `${day.distance} km` : ''}{day.distance && day.targetTime ? ' ou ' : ''}{day.targetTime ? `${day.targetTime} min` : 'Nenhuma meta definida'}</p>
            </div>
         </div>
      )}
    </div>
  );
};

export default ScheduleDayCard;