import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { WorkoutSession, StrengthWorkoutDetails, CardioWorkoutDetails } from '../types/workout';
import { Calendar, Clock, TrendingUp, Filter, Search, ChevronDown, Dumbbell, HeartPulse } from 'lucide-react';

// Mapeia o nível de intensidade numérico para texto e cor
const intensityMap = [
  { level: 1, label: 'Fácil', color: 'bg-green-50', textColor: 'text-green-800' },
  { level: 2, label: 'Manejável', color: 'bg-yellow-50', textColor: 'text-yellow-800' },
  { level: 3, label: 'Difícil', color: 'bg-orange-50', textColor: 'text-orange-800' },
  { level: 4, label: 'Exaustivo', color: 'bg-red-50', textColor: 'text-red-800' }
];

const WorkoutHistory: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'strength' | 'cardio'>('all');
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(null);

  useEffect(() => {
    getHistory();
  }, []);

  // 1. Função para buscar os dados do Supabase
  const getHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar histórico:', error);
    } else if (data) {
      setHistory(data as any[]); // Usamos 'any[]' para evitar problemas de tipagem com o Supabase
    }
    setLoading(false);
  };

  const filteredHistory = history.filter(entry => {
    const matchesSearch = entry.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || entry.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
  };

  // 2. Estado de Carregamento
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-800 p-4 flex items-center justify-center"><p className="text-white text-xl">Carregando histórico...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-800 p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Histórico de Treinos</h1>
          <p className="text-blue-200">Acompanhe seu progresso e performance</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="Buscar treinos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setFilterType('all')} className={`px-4 py-3 rounded-xl font-medium transition-all ${filterType === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Todos</button>
              <button onClick={() => setFilterType('strength')} className={`px-4 py-3 rounded-xl font-medium transition-all ${filterType === 'strength' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Força</button>
              <button onClick={() => setFilterType('cardio')} className={`px-4 py-3 rounded-xl font-medium transition-all ${filterType === 'cardio' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Cardio</button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredHistory.map((entry) => {
            const isStrength = entry.type === 'strength';
            const details = entry.details as StrengthWorkoutDetails | CardioWorkoutDetails; // Cast para tipagem
            const intensityInfo = isStrength ? intensityMap.find(i => i.level === entry.intensity) : null;
            
            return (
              <div key={entry.id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {isStrength ? <Dumbbell className="w-8 h-8 text-blue-500" /> : <HeartPulse className="w-8 h-8 text-orange-500" />}
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{entry.name}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                          <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /><span>{formatDate(entry.completed_at)}</span></div>
                          <span>Semana {entry.week}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800">{formatDuration(entry.duration)}</p>
                      <p className="text-sm text-gray-600">Duração</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {isStrength && 'totalExercises' in details && (
                      <>
                        <div className="bg-blue-50 p-3 rounded-lg"><p className="text-sm text-blue-700">Exercícios</p><p className="font-bold text-lg text-blue-900">{details.exercisesCompleted}/{details.totalExercises}</p></div>
                        <div className="bg-green-50 p-3 rounded-lg"><p className="text-sm text-green-700">Conclusão</p><p className="font-bold text-lg text-green-900">{Math.round((details.exercisesCompleted / details.totalExercises) * 100)}%</p></div>
                        <div className={`${intensityInfo?.color} p-3 rounded-lg`}><p className={`text-sm ${intensityInfo?.textColor}`}>Intensidade</p><p className={`font-bold text-lg ${intensityInfo?.textColor}`}>{intensityInfo?.label}</p></div>
                      </>
                    )}
                    {!isStrength && 'distance' in details && (
                       <>
                        <div className="bg-orange-50 p-3 rounded-lg"><p className="text-sm text-orange-700">Distância</p><p className="font-bold text-lg text-orange-900">{details.distance} km</p></div>
                        <div className="bg-red-50 p-3 rounded-lg"><p className="text-sm text-red-700">Pace</p><p className="font-bold text-lg text-red-900">{details.pace}</p></div>
                        <div className="bg-teal-50 p-3 rounded-lg"><p className="text-sm text-teal-700">Performance</p><p className="font-bold text-lg text-teal-900">Excelente</p></div>
                      </>
                    )}
                  </div>

                  {isStrength && <button onClick={() => setOpenAccordionId(openAccordionId === entry.id ? null : entry.id)} className="w-full text-center mt-4 text-blue-600 font-semibold flex items-center justify-center gap-2">Ver Detalhes<ChevronDown className={`transition-transform ${openAccordionId === entry.id ? 'rotate-180' : ''}`} /></button>}
                </div>

                {isStrength && openAccordionId === entry.id && 'exercises' in details && (
                  <div className="bg-gray-50 p-6 border-t">
                    <div className="space-y-4">
                      {(details.exercises as DetailedWorkout['exercises']).map(ex => (
                        <div key={ex.id} className="p-4 bg-white rounded-lg border">
                          <p className="font-semibold text-gray-700 mb-2">{ex.name}</p>
                          <div className="space-y-1 text-sm text-gray-600">
                            {ex.sets.map(set => ( <div key={set.id} className="flex justify-between items-center"><span>{set.type === 'warmup' ? 'Aquec.' : 'Trabalho'} {set.setNumber}:</span><span className="font-mono">{set.achievedLoad} kg x {set.achievedReps} reps</span></div> ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          
          {/* 3. Mensagem para quando não há treinos no histórico */}
          {filteredHistory.length === 0 && (
            <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><Search className="w-8 h-8 text-gray-400" /></div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhum treino encontrado</h3>
              <p className="text-gray-600">Complete seu primeiro treino para vê-lo aqui!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutHistory;