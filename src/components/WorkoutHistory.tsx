import React, { useState } from 'react';
import { Calendar, Clock, TrendingUp, Filter, Search } from 'lucide-react';

interface HistoryEntry {
  id: string;
  date: string;
  type: 'strength' | 'cardio';
  workout: string;
  duration: number;
  week: number;
  details?: {
    exercisesCompleted?: number;
    totalExercises?: number;
    distance?: number;
    pace?: number;
  };
}

const WorkoutHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'strength' | 'cardio'>('all');

  // Mock data for demonstration
  const historyData: HistoryEntry[] = [
    {
      id: '1',
      date: '2024-01-15',
      type: 'strength',
      workout: 'TREINO A (FORÇA)',
      duration: 65,
      week: 1,
      details: { exercisesCompleted: 6, totalExercises: 6 }
    },
    {
      id: '2',
      date: '2024-01-14',
      type: 'cardio',
      workout: 'CORRIDA 5KM',
      duration: 28,
      week: 1,
      details: { distance: 5, pace: 5.6 }
    },
    {
      id: '3',
      date: '2024-01-12',
      type: 'strength',
      workout: 'TREINO B (FORÇA)',
      duration: 70,
      week: 1,
      details: { exercisesCompleted: 5, totalExercises: 6 }
    },
    {
      id: '4',
      date: '2024-01-11',
      type: 'cardio',
      workout: 'CORRIDA 5KM',
      duration: 29,
      week: 1,
      details: { distance: 5, pace: 5.8 }
    },
    {
      id: '5',
      date: '2024-01-10',
      type: 'strength',
      workout: 'TREINO A (FORÇA)',
      duration: 62,
      week: 1,
      details: { exercisesCompleted: 6, totalExercises: 6 }
    }
  ];

  const filteredHistory = historyData.filter(entry => {
    const matchesSearch = entry.workout.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || entry.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const getTypeColor = (type: string) => {
    return type === 'strength' 
      ? 'from-blue-500 to-indigo-500' 
      : 'from-orange-500 to-red-500';
  };

  const getTypeBg = (type: string) => {
    return type === 'strength' 
      ? 'bg-blue-50 text-blue-700' 
      : 'bg-orange-50 text-orange-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Histórico de Treinos</h1>
          <p className="text-blue-200">Acompanhe seu progresso e performance</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar treinos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  filterType === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterType('strength')}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  filterType === 'strength'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Força
              </button>
              <button
                onClick={() => setFilterType('cardio')}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  filterType === 'cardio'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cardio
              </button>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {filteredHistory.map((entry) => (
            <div key={entry.id} className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getTypeColor(entry.type)} flex items-center justify-center`}>
                    {entry.type === 'strength' ? (
                      <TrendingUp className="w-6 h-6 text-white" />
                    ) : (
                      <Clock className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{entry.workout}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{formatDate(entry.date)}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getTypeBg(entry.type)}`}>
                        Semana {entry.week}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">{formatDuration(entry.duration)}</p>
                  <p className="text-sm text-gray-600">Duração</p>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                {entry.type === 'strength' && entry.details && (
                  <>
                    <div className="bg-blue-50 rounded-xl p-3">
                      <p className="text-sm text-blue-600 font-medium">Exercícios</p>
                      <p className="text-lg font-bold text-blue-800">
                        {entry.details.exercisesCompleted}/{entry.details.totalExercises}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3">
                      <p className="text-sm text-green-600 font-medium">Taxa Conclusão</p>
                      <p className="text-lg font-bold text-green-800">
                        {Math.round((entry.details.exercisesCompleted! / entry.details.totalExercises!) * 100)}%
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3">
                      <p className="text-sm text-purple-600 font-medium">Intensidade</p>
                      <p className="text-lg font-bold text-purple-800">Alta</p>
                    </div>
                  </>
                )}
                
                {entry.type === 'cardio' && entry.details && (
                  <>
                    <div className="bg-orange-50 rounded-xl p-3">
                      <p className="text-sm text-orange-600 font-medium">Distância</p>
                      <p className="text-lg font-bold text-orange-800">{entry.details.distance}km</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-3">
                      <p className="text-sm text-red-600 font-medium">Pace</p>
                      <p className="text-lg font-bold text-red-800">{entry.details.pace}min/km</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3">
                      <p className="text-sm text-green-600 font-medium">Performance</p>
                      <p className="text-lg font-bold text-green-800">
                        {entry.details.pace! < 6 ? 'Excelente' : 'Boa'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredHistory.length === 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhum treino encontrado</h3>
            <p className="text-gray-600">Tente ajustar os filtros ou fazer uma nova busca</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutHistory;