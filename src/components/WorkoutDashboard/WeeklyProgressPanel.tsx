import React from 'react';

interface WeekInfo {
  week: number;
  rpeTarget: string;
  description: string;
}

interface WeeklyProgressPanelProps {
  currentWeek: number;
  onWeekChange: (week: number) => void;
  weekProgression: WeekInfo[];
}

const WeeklyProgressPanel: React.FC<WeeklyProgressPanelProps> = ({ currentWeek, onWeekChange, weekProgression }) => {
  const getCurrentWeekInfo = () => weekProgression.find(w => w.week === currentWeek) || weekProgression[0];
  return (
    <div className="card bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/30">
        <div className="flex items-start justify-between">
            <div>
                <h3 className="text-xl font-bold text-text-primary">Progressão Semanal</h3>
                <p className="text-text-muted text-sm mt-1">{getCurrentWeekInfo().description}</p>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
                 <span className="text-lg font-semibold text-text-primary">Semana {currentWeek}</span>
                 <p className="text-sm font-medium text-accent">{getCurrentWeekInfo().rpeTarget}</p>
            </div>
        </div>

        <div className="flex justify-start gap-3 mt-4">
            {weekProgression.map((week) => (
            <button
                key={week.week}
                onClick={() => onWeekChange(week.week)}
                className={`w-12 h-12 rounded-full font-semibold text-white flex items-center justify-center transition-all duration-300
                ${currentWeek === week.week
                    ? 'bg-primary-gradient shadow-lg scale-110'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
            >
                S{week.week}
            </button>
            ))}
      </div>
    </div>
  );
};

export default WeeklyProgressPanel;