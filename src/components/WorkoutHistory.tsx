// ARQUIVO: src/components/WorkoutHistory.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { WorkoutSession, BodyMeasurement, StrengthWorkoutDetails, DetailedWorkout } from '../types/workout';
import { Calendar, Clock, ChevronDown, Dumbbell, HeartPulse, Scale, Activity, Search, Edit, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { MeasurementModal } from './MeasurementModal';

// Card para um registro de Treino de Força ou Cardio (sem alterações)
const WorkoutSessionCard: React.FC<{ entry: WorkoutSession }> = ({ entry }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isStrength = entry.type === 'strength';
  const details = entry.details as StrengthWorkoutDetails;

  const intensityMap = [
    { level: 1, label: 'Fácil', color: 'text-green-400' },
    { level: 2, label: 'Manejável', color: 'text-blue-400' },
    { level: 3, label: 'Difícil', color: 'text-orange-400' },
    { level: 4, label: 'Exaustivo', color: 'text-red-500' }
  ];
  const intensityInfo = isStrength ? intensityMap.find(i => i.level === entry.intensity) : null;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}min`;
  };

  const ActivityIcon = isStrength ? Dumbbell : HeartPulse;
  const iconGradient = isStrength ? 'bg-primary-gradient' : 'bg-secondary-gradient';
  const completionPercentage = isStrength && details.totalExercises > 0 ? Math.round((details.exercisesCompleted / details.totalExercises) * 100) : 0;

  return (
    <div className="card">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center text-white ${iconGradient}`}>
          <ActivityIcon size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-text-primary">{entry.name}</h3>
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-text-muted">
            <div className="flex items-center gap-1.5"><Calendar size={14} /><span>{formatDate(entry.completed_at)}</span></div>
            <div className="flex items-center gap-1.5"><Clock size={14} /><span>{formatDuration(entry.duration)}</span></div>
            {isStrength && intensityInfo && <div className={`flex items-center gap-1.5 font-semibold ${intensityInfo.color}`}><Activity size={14} /><span>{intensityInfo.label}</span></div>}
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        {isStrength ? (
            <div>
                <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="font-semibold text-text-secondary">Progresso</span>
                    <span className="font-bold text-primary">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-bg-secondary rounded-full h-2.5">
                    <div className="bg-primary-gradient h-2.5 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
                </div>
                 <div className="flex justify-between items-center mt-2 text-xs text-text-muted">
                    <span>Exercícios Concluídos</span>
                    <span>{details.exercisesCompleted} / {details.totalExercises}</span>
                </div>
            </div>
        ) : (
            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-bg-secondary p-4 rounded-lg">
                    <p className="text-sm text-text-muted">Distância</p>
                    <p className="text-3xl font-bold text-secondary">{(entry.details as any).distance}<span className="text-lg ml-1">km</span></p>
                </div>
                <div className="bg-bg-secondary p-4 rounded-lg">
                    <p className="text-sm text-text-muted">Pace</p>
                    <p className="text-3xl font-bold text-secondary">{(entry.details as any).pace}</p>
                </div>
            </div>
        )}
      </div>

      {isStrength && (
        <>
            <div className="border-t border-white/10 my-4"></div>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full text-center text-primary font-semibold flex items-center justify-center gap-2 hover:text-accent transition-colors">
                Ver Detalhes
                <ChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
        </>
      )}
      
      {isStrength && isOpen && details.exercises && (
        <div className="bg-bg-secondary p-4 mt-4 rounded-lg border border-white/10 space-y-3">
          {(details.exercises as DetailedWorkout['exercises']).map(ex => (
            <div key={ex.id} className="p-3 bg-black/20 rounded-lg">
              <p className="font-semibold text-text-secondary mb-2">{ex.name}</p>
              <div className="space-y-1 text-sm text-text-muted">
                {ex.sets.map(set => ( 
                  <div key={set.id} className="flex justify-between items-center">
                    <span>{set.type === 'warmup' ? 'Aquec.' : 'Série'} {set.setNumber}:</span>
                    <span className="font-mono text-text-primary">{set.achievedLoad || 0} kg x {set.achievedReps || 0} reps</span>
                  </div> 
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Card para um registro de Medição Corporal (COM ALTERAÇÕES)
const MeasurementHistoryCard: React.FC<{ 
  entry: BodyMeasurement;
  onEdit: (entry: BodyMeasurement) => void;
  onDelete: (id: string) => void;
}> = ({ entry, onEdit, onDelete }) => {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center text-white bg-accent-gradient">
            <Scale size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">Medição Corporal</h3>
            <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1"><Calendar size={14} /><span>{formatDate(entry.measured_at)}</span></div>
          </div>
        </div>
        <div className="flex items-center gap-1">
            <button onClick={() => onEdit(entry)} className="p-2 text-text-muted hover:text-primary transition-colors"><Edit size={16}/></button>
            <button onClick={() => onDelete(entry.id!)} className="p-2 text-text-muted hover:text-error transition-colors"><Trash2 size={16}/></button>
        </div>
      </div>
      <div className="text-sm bg-bg-secondary text-accent font-semibold px-3 py-1 rounded-full w-fit mb-4">{entry.source}</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        {entry.weight_kg && <div className="bg-bg-secondary p-3 rounded-lg"><p className="text-sm text-text-muted">Peso</p><p className="font-bold text-lg text-text-primary">{entry.weight_kg} kg</p></div>}
        {entry.body_fat_percentage && <div className="bg-bg-secondary p-3 rounded-lg"><p className="text-sm text-text-muted">% Gordura</p><p className="font-bold text-lg text-text-primary">{entry.body_fat_percentage} %</p></div>}
        {entry.details && Object.entries(entry.details).map(([key, value]) => (
            <div key={key} className="bg-bg-secondary p-3 rounded-lg"><p className="text-sm text-text-muted capitalize">{key.replace(/_/g, ' ')}</p><p className="font-bold text-lg text-text-primary">{value}</p></div>
        ))}
      </div>
    </div>
  );
};


// Componente principal com alterações
const WorkoutHistory: React.FC = () => {
  const { onUpdateMeasurement, onDeleteMeasurement } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [needsRefresh, setNeedsRefresh] = useState(true); // Controla o recarregamento
  const [historyEntries, setHistoryEntries] = useState<(WorkoutSession | BodyMeasurement)[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'strength' | 'cardio' | 'measurement'>('all');
  const [editingMeasurement, setEditingMeasurement] = useState<BodyMeasurement | null>(null);

  const getHistory = useCallback(async () => {
      setLoading(true);
      const [sessionsResponse, measurementsResponse] = await Promise.all([
        supabase.from('workout_sessions').select('*'),
        supabase.from('body_measurements').select('*')
      ]);
      if (sessionsResponse.error) console.error("Erro ao buscar sessões:", sessionsResponse.error);
      if (measurementsResponse.error) console.error("Erro ao buscar medições:", measurementsResponse.error);
      const sessions = (sessionsResponse.data || []).map(s => ({ ...s, entryType: 'session', date: s.completed_at }));
      const measurements = (measurementsResponse.data || []).map(m => ({ ...m, entryType: 'measurement', date: m.measured_at }));
      const combined = [...sessions, ...measurements];
      combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setHistoryEntries(combined as any[]);
      setLoading(false);
      setNeedsRefresh(false);
  }, []);

  useEffect(() => {
    if (needsRefresh) {
      getHistory();
    }
  }, [needsRefresh, getHistory]);

  const handleEdit = (measurement: BodyMeasurement) => {
    setEditingMeasurement(measurement);
  };

  const handleDelete = async (measurementId: string) => {
    await onDeleteMeasurement(measurementId);
    setNeedsRefresh(true);
  };
  
  const handleUpdate = async (measurement: BodyMeasurement) => {
      await onUpdateMeasurement(measurement);
      setEditingMeasurement(null);
      setNeedsRefresh(true);
  };

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

  if (loading) {
    return <div className="min-h-screen p-4 flex items-center justify-center"><p className="text-text-primary text-xl">Buscando histórico...</p></div>;
  }

  return (
    <>
      <div className="min-h-screen p-4 pb-24 animate-fade-in-up">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
              <h1 className="text-3xl font-bold text-text-primary mb-2">Histórico de Atividades</h1>
              <p className="text-text-muted">Acompanhe seu progresso e performance.</p>
          </div>
          
          <div className="card">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Buscar por nome..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 bg-black/20 border-2 border-white/10 rounded-xl text-text-primary focus:outline-none focus:border-primary focus:bg-primary/10 transition-all"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setFilterType('all')} className={`btn-secondary flex-1 md:flex-none ${filterType === 'all' ? 'bg-primary text-white border-primary' : ''}`}>Todos</button>
                <button onClick={() => setFilterType('strength')} className={`btn-secondary flex-1 md:flex-none ${filterType === 'strength' ? 'bg-primary text-white border-primary' : ''}`}>Força</button>
                <button onClick={() => setFilterType('cardio')} className={`btn-secondary flex-1 md:flex-none ${filterType === 'cardio' ? 'bg-secondary text-white border-secondary' : ''}`}>Cardio</button>
                <button onClick={() => setFilterType('measurement')} className={`btn-secondary flex-1 md:flex-none ${filterType === 'measurement' ? 'bg-accent text-bg-primary border-accent' : ''}`}>Medidas</button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredHistory.map((entry) => {
              if ((entry as any).entryType === 'session') {
                return <WorkoutSessionCard key={(entry as WorkoutSession).id} entry={entry as WorkoutSession} />;
              } else {
                return <MeasurementHistoryCard 
                          key={(entry as BodyMeasurement).id} 
                          entry={entry as BodyMeasurement} 
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                       />;
              }
            })}
            {filteredHistory.length === 0 && !loading && (
              <div className="card text-center">
                  <Search className="w-12 h-12 text-text-muted mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-text-primary mb-2">Nenhum registro encontrado</h3>
                  <p className="text-text-muted">Tente ajustar seus filtros ou registre uma nova atividade!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <MeasurementModal
        isOpen={!!editingMeasurement}
        onClose={() => setEditingMeasurement(null)}
        onSave={handleUpdate}
        measurementToEdit={editingMeasurement}
      />
    </>
  );
};

export default WorkoutHistory;