// ARQUIVO COMPLETO E ATUALIZADO: src/components/WorkoutHistory.tsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { WorkoutSession, BodyMeasurement, StrengthWorkoutDetails, DetailedWorkout } from '../types/workout';
import { Calendar, Clock, TrendingUp, Filter, Search, ChevronDown, Dumbbell, HeartPulse, Scale, Activity, BarChart3, Award } from 'lucide-react';

// Card para um registro de Treino de Força ou Cardio
const WorkoutSessionCard: React.FC<{ entry: WorkoutSession }> = ({ entry }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isStrength = entry.type === 'strength';
  const details = entry.details as StrengthWorkoutDetails;

  const intensityMap = [
    { level: 1, label: 'Fácil', color: 'bg-green-50', textColor: 'text-green-800' },
    { level: 2, label: 'Manejável', color: 'bg-yellow-50', textColor: 'text-yellow-800' },
    { level: 3, label: 'Difícil', color: 'bg-orange-50', textColor: 'text-orange-800' },
    { level: 4, label: 'Exaustivo', color: 'bg-red-50', textColor: 'text-red-800' }
  ];
  const intensityInfo = isStrength ? intensityMap.find(i => i.level === entry.intensity) : null;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
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
          {isStrength && details.totalExercises > 0 ? (
            <>
              <div className="bg-blue-50 p-3 rounded-lg"><p className="text-sm text-blue-700">Exercícios</p><p className="font-bold text-lg text-blue-900">{details.exercisesCompleted}/{details.totalExercises}</p></div>
              <div className="bg-green-50 p-3 rounded-lg"><p className="text-sm text-green-700">Conclusão</p><p className="font-bold text-lg text-green-900">{Math.round((details.exercisesCompleted / details.totalExercises) * 100)}%</p></div>
              <div className={`${intensityInfo?.color} p-3 rounded-lg`}><p className={`text-sm ${intensityInfo?.textColor}`}>Intensidade</p><p className={`font-bold text-lg ${intensityInfo?.textColor}`}>{intensityInfo?.label}</p></div>
            </>
          ) : (
            <>
              <div className="bg-orange-50 p-3 rounded-lg"><p className="text-sm text-orange-700">Distância</p><p className="font-bold text-lg text-orange-900">{(entry.details as any).distance} km</p></div>
              <div className="bg-red-50 p-3 rounded-lg"><p className="text-sm text-red-700">Pace</p><p className="font-bold text-lg text-red-900">{(entry.details as any).pace}</p></div>
              <div className="bg-teal-50 p-3 rounded-lg"><p className="text-sm text-teal-700">Performance</p><p className="font-bold text-lg text-teal-900">Excelente</p></div>
            </>
          )}
        </div>
        {isStrength && <button onClick={() => setIsOpen(!isOpen)} className="w-full text-center mt-4 text-blue-600 font-semibold flex items-center justify-center gap-2">Ver Detalhes<ChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} /></button>}
      </div>
      {isStrength && isOpen && details.exercises && (
        <div className="bg-gray-50 p-6 border-t"><div className="space-y-4">{(details.exercises as DetailedWorkout['exercises']).map(ex => (<div key={ex.id} className="p-4 bg-white rounded-lg border"><p className="font-semibold text-gray-700 mb-2">{ex.name}</p><div className="space-y-1 text-sm text-gray-600">{ex.sets.map(set => ( <div key={set.id} className="flex justify-between items-center"><span>{set.type === 'warmup' ? 'Aquec.' : 'Trabalho'} {set.setNumber}:</span><span className="font-mono">{set.achievedLoad} kg x {set.achievedReps} reps</span></div> ))}</div></div>))}</div></div>
      )}
    </div>
  );
};

// Card para um registro de Medição Corporal
const MeasurementHistoryCard: React.FC<{ entry: BodyMeasurement }> = ({ entry }) => {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Scale className="w-8 h-8 text-indigo-500" />
          <div>
            <h3 className="text-xl font-bold text-gray-800">Medição Corporal</h3>
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1"><Calendar className="w-4 h-4" /><span>{formatDate(entry.measured_at)}</span></div>
          </div>
        </div>
        <div className="text-sm bg-indigo-50 text-indigo-700 font-semibold px-3 py-1 rounded-full">{entry.source}</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {entry.weight_kg && <div className="bg-gray-100 p-3 rounded-lg"><p className="text-sm text-gray-600">Peso</p><p className="font-bold text-lg text-gray-900">{entry.weight_kg} kg</p></div>}
        {entry.body_fat_percentage && <div className="bg-gray-100 p-3 rounded-lg"><p className="text-sm text-gray-600">% Gordura</p><p className="font-bold text-lg text-gray-900">{entry.body_fat_percentage} %</p></div>}
        {entry.details && Object.entries(entry.details).map(([key, value]) => (
            <div key={key} className="bg-gray-100 p-3 rounded-lg"><p className="text-sm text-gray-600 capitalize">{key.replace(/_/g, ' ')}</p><p className="font-bold text-lg text-gray-900">{value}</p></div>
        ))}
      </div>
    </div>
  );
};


const WorkoutHistory: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [historyEntries, setHistoryEntries] = useState<(WorkoutSession | BodyMeasurement)[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'strength' | 'cardio' | 'measurement'>('all');

  useEffect(() => {
    const getHistory = async () => {
      setLoading(true);
      
      // 1. Busca dados das duas tabelas em paralelo
      const [sessionsResponse, measurementsResponse] = await Promise.all([
        supabase.from('workout_sessions').select('*'),
        supabase.from('body_measurements').select('*')
      ]);

      if (sessionsResponse.error) console.error("Erro ao buscar sessões:", sessionsResponse.error);
      if (measurementsResponse.error) console.error("Erro ao buscar medições:", measurementsResponse.error);

      // 2. Combina os dados em uma única lista
      const sessions = (sessionsResponse.data || []).map(s => ({ ...s, entryType: 'session', date: s.completed_at }));
      const measurements = (measurementsResponse.data || []).map(m => ({ ...m, entryType: 'measurement', date: m.measured_at }));
      const combined = [...sessions, ...measurements];
      
      // 3. Ordena a lista combinada pela data, do mais recente para o mais antigo
      combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setHistoryEntries(combined as any[]);
      setLoading(false);
    };

    getHistory();
  }, []);

  const filteredHistory = historyEntries.filter(entry => {
    const entryType = (entry as any).entryType;
    let nameToSearch = '';
    if (entryType === 'session') nameToSearch = (entry as WorkoutSession).name;
    if (entryType === 'measurement') nameToSearch = (entry as BodyMeasurement).source;
    
    const matchesSearch = nameToSearch.toLowerCase().includes(searchTerm.toLowerCase());
    
    let typeMatches = false;
    if (filterType === 'all') typeMatches = true;
    else if (filterType === 'measurement' && entryType === 'measurement') typeMatches = true;
    else if (entryType === 'session' && (entry as WorkoutSession).type === filterType) typeMatches = true;

    return matchesSearch && typeMatches;
  });

  if (loading) { /* ... */ }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-800 p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Histórico de Atividades</h1>
          <p className="text-blue-200">Acompanhe seu progresso e performance</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl"/></div>
            <div className="flex gap-2">
              <button onClick={() => setFilterType('all')} className={`px-4 py-3 rounded-xl font-medium transition-all ${filterType === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Todos</button>
              <button onClick={() => setFilterType('strength')} className={`px-4 py-3 rounded-xl font-medium transition-all ${filterType === 'strength' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Força</button>
              <button onClick={() => setFilterType('cardio')} className={`px-4 py-3 rounded-xl font-medium transition-all ${filterType === 'cardio' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Cardio</button>
              <button onClick={() => setFilterType('measurement')} className={`px-4 py-3 rounded-xl font-medium transition-all ${filterType === 'measurement' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Medidas</button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredHistory.map((entry) => {
            if ((entry as any).entryType === 'session') {
              return <WorkoutSessionCard key={(entry as WorkoutSession).id} entry={entry as WorkoutSession} />;
            } else {
              return <MeasurementHistoryCard key={(entry as BodyMeasurement).id} entry={entry as BodyMeasurement} />;
            }
          })}
          {filteredHistory.length === 0 && !loading && (
            <div className="bg-white rounded-2xl p-8 shadow-xl text-center"><Search className="w-12 h-12 text-gray-300 mx-auto mb-4" /><h3 className="text-xl font-bold text-gray-800 mb-2">Nenhum registro encontrado</h3><p className="text-gray-600">Parece que não há nada aqui. Tente ajustar seus filtros ou registre uma nova atividade!</p></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutHistory;