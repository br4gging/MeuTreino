import React, { useState } from 'react';
import { DaySchedule, UserWorkout } from '../../types/workout';
import ScheduleDayCard from '../ScheduleDayCard';
import { Calendar, Edit, X, Check, Dumbbell, HeartPulse, BedDouble } from 'lucide-react';

interface WeeklySchedulePanelProps {
  schedule: DaySchedule[];
  userWorkouts: UserWorkout[];
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onScheduleChange: (day: number, field: string, value: any) => void;
}

const WeeklySchedulePanel: React.FC<WeeklySchedulePanelProps> = ({
  schedule,
  userWorkouts,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onScheduleChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const sortedSchedule = [...schedule].sort((a, b) => a.day - b.day);

  const dayIcons: { [key: string]: React.ElementType } = {
    strength: Dumbbell,
    cardio: HeartPulse,
    rest: BedDouble,
  };

  const dayColors: { [key: string]: string } = {
    strength: 'bg-primary-gradient',
    cardio: 'bg-secondary-gradient',
    rest: 'bg-success-gradient',
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <button className="flex items-center gap-4 text-left w-full" onClick={() => setIsOpen(!isOpen)} disabled={isEditing}>
          <div className="w-12 h-12 bg-primary-gradient rounded-lg flex items-center justify-center text-white">
            <Calendar size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-text-primary">Programação Semanal</h3>
            <p className="text-sm text-text-muted">Sua rotina de treinos da semana</p>
          </div>
        </button>
        <div className="flex gap-2 flex-shrink-0">
          {!isEditing ? (
            <button onClick={onEdit} className="btn-secondary flex items-center gap-2"><Edit size={16}/> Editar</button>
          ) : (
            <>
              <button onClick={onCancel} className="btn-secondary flex items-center gap-2"><X size={16}/> Cancelar</button>
              <button onClick={onSave} className="btn bg-success text-white flex items-center gap-2"><Check size={16}/> Salvar</button>
            </>
          )}
        </div>
      </div>
      
      {(isOpen || isEditing) && (
        <div className="space-y-4 border-t border-white/10 pt-4 mt-6">
          {sortedSchedule.map((day) => (
            <ScheduleDayCard key={day.day} day={day} userWorkouts={userWorkouts} onScheduleChange={onScheduleChange} isEditing={isEditing} />
          ))}
        </div>
      )}

      {!(isOpen || isEditing) && (
         <div className="border-t border-white/10 pt-4 mt-6">
            <div className="flex justify-around items-center pt-2">
              {sortedSchedule.map(day => {
                const DayIcon = dayIcons[day.workoutType] || BedDouble;
                return (
                  <div key={day.day} className="flex flex-col items-center gap-2 text-center" title={day.name}>
                    <span className="font-bold text-text-muted">{day.name.substring(0, 3)}</span>
                    <div className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white ${dayColors[day.workoutType]}`}>
                        <DayIcon size={20} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
      )}
    </div>
  );
};

export default WeeklySchedulePanel;