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
    <div className="bg-white rounded-2xl p-4 shadow-md border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><span className="w-5 h-5 text-amber-500">🏁</span>
          <h3 className="font-semibold text-gray-700">Progressão Semanal</h3>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-md font-semibold text-gray-800">Semana {currentWeek}</span>
          </div>
          <p className="text-xs text-gray-500">{getCurrentWeekInfo().rpeTarget}</p>
        </div>
      </div>
      <p className="text-gray-600 text-sm mt-2">{getCurrentWeekInfo().description}</p>
      <div className="flex gap-2 mt-3">
        {weekProgression.map((week) => (
          <button key={week.week} onClick={() => onWeekChange(week.week)} className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${currentWeek === week.week ? 'bg-blue-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>S{week.week}</button>
        ))}
      </div>
    </div>
  );
};

export default WeeklyProgressPanel; 