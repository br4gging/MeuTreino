import React from 'react';
import { DaySchedule, UserWorkout } from '../../types/workout';
import ScheduleDayCard from '../ScheduleDayCard';

interface WeeklySchedulePanelProps {
  schedule: DaySchedule[];
  userWorkouts: UserWorkout[];
  isEditing: boolean;
  isScheduleOpen: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onScheduleChange: (day: number, field: string, value: any) => void;
}

const WeeklySchedulePanel: React.FC<WeeklySchedulePanelProps> = ({
  schedule,
  userWorkouts,
  isEditing,
  isScheduleOpen,
  onEdit,
  onCancel,
  onSave,
  onScheduleChange
}) => {
  const sortedSchedule = [...schedule].sort((a, b) => a.day - b.day);
  return (
    <div className="bg-white rounded-2xl shadow-xl">
      <div className="flex items-center justify-between p-6">
        <button className="flex items-center gap-3 text-left w-full disabled:cursor-not-allowed" onClick={onEdit} disabled={isEditing}>
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">🏋️</div>
          <h3 className="text-2xl font-bold text-gray-800">Programação Semanal</h3>
        </button>
        {!isEditing ? (
          <button onClick={onEdit} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex-shrink-0">Editar</button>
        ) : (
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={onCancel} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Cancelar</button>
            <button onClick={onSave} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors">Salvar</button>
          </div>
        )}
      </div>
      <div className="px-6 pb-6">
        {(isScheduleOpen || isEditing) ? (
          <div className="space-y-4 border-t pt-4">
            {sortedSchedule.map((day) => (
              <ScheduleDayCard key={day.day} day={day} userWorkouts={userWorkouts} onScheduleChange={onScheduleChange} isEditing={isEditing} />
            ))}
          </div>
        ) : (
          <div className="border-t pt-4">
            <p className="text-gray-600 mb-4">Visão geral da sua semana. Clique no título para expandir ou em "Editar" para modificar.</p>
            <div className="flex justify-around items-center pt-2">
              {sortedSchedule.map(day => {
                const dayInitial = day.name.charAt(0);
                const workoutName = day.workoutType === 'strength' ? userWorkouts.find(w => w.id === day.workoutId)?.name : null;
                return (
                  <div key={day.day} className="flex flex-col items-center gap-2 text-center" title={day.name}>
                    <span className="font-bold text-gray-600">{dayInitial}</span>
                    <div className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center ${day.workoutType === 'strength' ? 'bg-blue-500' : day.workoutType === 'cardio' ? 'bg-orange-500' : 'bg-green-500'}`}>{day.workoutType === 'strength' ? '🏋️' : day.workoutType === 'cardio' ? '🏃' : '😴'}</div>
                    <p className="text-xs text-gray-500 w-20 truncate">{day.workoutType === 'rest' && 'Descanso'}{day.workoutType === 'cardio' && (day.distance ? `${day.distance}km` : `${day.targetTime}min`)}{day.workoutType === 'strength' && (workoutName || 'Nenhum')}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklySchedulePanel; 