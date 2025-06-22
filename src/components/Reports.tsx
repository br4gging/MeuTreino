import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { WorkoutSession, StrengthWorkoutDetails } from '../types/workout';
import { TrendingUp, Clock, Target, Award, Activity, AlertCircle, Dumbbell, HeartPulse } from 'lucide-react';

// Funções utilitárias mantidas no topo
const paceToSeconds = (pace: string): number => {
  if (!pace || typeof pace !== 'string') return 0;
  const parts = pace.split(':');
  if (parts.length !== 2) return 0;
  return (parseInt(parts[0], 10) * 60) + parseInt(parts[1], 10);
};

const secondsToPace = (seconds: number): string => {
  if (!seconds || !isFinite(seconds) || seconds === 0) return 'N/A';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const getPaceRating = (paceInSeconds: number) => {
    if (!paceInSeconds || paceInSeconds === 0) return { rating: 'N/A', color: 'text-text-muted' };
    if (paceInSeconds < 300) return { rating: 'Excelente', color: 'text-green-400' };
    if (paceInSeconds < 360) return { rating: 'Muito Bom', color: 'text-blue-400' };
    if (paceInSeconds < 420) return { rating: 'Bom', color: 'text-yellow-400' };
    return { rating: 'Regular', color: 'text-orange-400' };
};

const initialStats = {
  running: { avgPace: 0, totalDistance: 0, sessions: 0, bestPace: 0 },
  strength: { totalSessions: 0, avgDuration: 0, completionRate: 0, topLifts: [] as { exercise: string; weight: number }[] }
};

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('week');
  const [allTimeBestPace, setAllTimeBestPace] = useState<number>(0);

  useEffect(() => {
    const getWorkoutHistory = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('workout_sessions').select('*');
      if (error) {
        console.error("Erro ao buscar relatórios:", error);
        setSessions([]);
      } else {
        const sessionData = (data as WorkoutSession[]) || [];
        setSessions(sessionData);
        if (sessionData.length > 0) {
          const cardioSessions = sessionData.filter(s => s.type === 'cardio' && (s.details as any).pace);
          if (cardioSessions.length > 0) {
            const bestPaceAllTime = Math.min(...cardioSessions.map(s => paceToSeconds((s.details as any).pace)).filter(p => p > 0));
            setAllTimeBestPace(bestPaceAllTime > 0 ? bestPaceAllTime : 0);
          }
        }
      }
      setLoading(false);
    };
    getWorkoutHistory();
  }, []);

  const calculatedStats = useMemo(() => {
    if (!sessions || sessions.length === 0) return initialStats;
    // Lógica de cálculo de estatísticas (mantida)
    const now = new Date();
    const startDate = new Date();
    if (selectedPeriod === 'week') startDate.setDate(now.getDate() - 7);
    else if (selectedPeriod === 'month') startDate.setMonth(now.getMonth() - 1);
    else if (selectedPeriod === 'quarter') startDate.setMonth(now.getMonth() - 3);

    const filteredSessions = sessions.filter(s => new Date(s.completed_at) >= startDate);
    if (filteredSessions.length === 0) return initialStats;
    
    const cardioSessions = filteredSessions.filter(s => s.type === 'cardio' && (s.details as any)?.pace);
    const runningPacesInSeconds = cardioSessions.map(s => paceToSeconds((s.details as any).pace)).filter(p => p > 0);
    const runningStats = {
      sessions: cardioSessions.length,
      totalDistance: cardioSessions.reduce((acc, s) => acc + (s.details as any).distance, 0),
      avgPace: runningPacesInSeconds.length > 0 ? runningPacesInSeconds.reduce((acc, p) => acc + p, 0) / runningPacesInSeconds.length : 0,
      bestPace: runningPacesInSeconds.length > 0 ? Math.min(...runningPacesInSeconds) : 0
    };
    
    const strengthSessions = filteredSessions.filter(s => s.type === 'strength');
    const totalCompletion = strengthSessions.reduce((acc, s) => {
        const details = s.details as StrengthWorkoutDetails;
        if (!details.totalExercises || details.totalExercises === 0) return acc;
        return acc + (details.exercisesCompleted / details.totalExercises);
    }, 0);
    const allLifts: { [key: string]: number[] } = {};
    strengthSessions.forEach(s => {
      const details = s.details as StrengthWorkoutDetails;
      if (!details.exercises) return;
      details.exercises.forEach(ex => {
        if (!allLifts[ex.name]) allLifts[ex.name] = [];
        const maxLoad = Math.max(...ex.sets.map(set => parseFloat(set.achievedLoad) || 0));
        if (maxLoad > 0) allLifts[ex.name].push(maxLoad);
      });
    });
    const topLifts = Object.entries(allLifts)
      .filter(([_, weights]) => weights.length > 0) // Garantir que só entrem exercícios com cargas
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 3)
      .map(([exercise, weights]) => ({ exercise, weight: Math.max(...weights) }));
    
    const strengthStats = {
      totalSessions: strengthSessions.length,
      avgDuration: strengthSessions.length > 0 ? strengthSessions.reduce((acc, s) => acc + s.duration, 0) / (strengthSessions.length * 60) : 0,
      completionRate: strengthSessions.length > 0 ? (totalCompletion / strengthSessions.length) * 100 : 0,
      topLifts
    };
    
    return { running: runningStats, strength: strengthStats };
  }, [sessions, selectedPeriod]);
  
  const isPersonalBest = useMemo(() => {
    return calculatedStats.running.bestPace > 0 && allTimeBestPace > 0 && calculatedStats.running.bestPace <= allTimeBestPace;
  }, [calculatedStats.running.bestPace, allTimeBestPace]);

  const paceRating = getPaceRating(calculatedStats.running.avgPace);

  if (loading) { return <div className="min-h-screen p-4 flex items-center justify-center"><p className="text-text-primary text-xl">Calculando relatórios...</p></div>; }
  
  const hasData = sessions.length > 0;
  
  return (
    <div className="min-h-screen p-4 pb-24 animate-fade-in-up">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className='flex-1'>
                <h1 className="text-3xl font-bold text-text-primary mb-1">Relatórios</h1>
                <p className="text-text-muted">Sua performance no período selecionado.</p>
            </div>
            <div className="flex gap-2 bg-bg-secondary p-1 rounded-xl">
              {(['week', 'month', 'quarter'] as const).map((period) => (<button key={period} onClick={() => setSelectedPeriod(period)} className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${selectedPeriod === period ? 'bg-primary text-white' : 'text-text-muted hover:bg-white/5'}`}>{period === 'week' ? 'Semana' : period === 'month' ? 'Mês' : 'Trimestre'}</button>))}
            </div>
        </div>

        {!hasData ? (
          <div className="card text-center col-span-full mt-8">
            <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
            <h3 className="text-xl font-bold text-text-primary mb-2">Dados Insuficientes</h3>
            <p className="text-text-muted">Registre alguns treinos para que possamos gerar seus relatórios.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card text-center"><h3 className="font-semibold text-text-muted mb-2">Pace Médio</h3><p className="metric-value">{secondsToPace(calculatedStats.running.avgPace)}</p><p className={`text-sm font-semibold mt-1 ${paceRating.color}`}>{paceRating.rating}</p></div>
                <div className="card text-center"><h3 className="font-semibold text-text-muted mb-2">Distância Total</h3><p className="metric-value">{calculatedStats.running.totalDistance.toFixed(1)} <span className="text-2xl text-text-secondary">km</span></p><p className="text-sm text-text-muted mt-1">{calculatedStats.running.sessions} {calculatedStats.running.sessions === 1 ? 'corrida' : 'corridas'}</p></div>
                <div className="card text-center"><h3 className="font-semibold text-text-muted mb-2">Treinos Musculação</h3><p className="metric-value">{calculatedStats.strength.totalSessions}</p><p className="text-sm text-text-muted mt-1">{calculatedStats.strength.completionRate.toFixed(0)}% de conclusão</p></div>
                <div className="card text-center"><h3 className="font-semibold text-text-muted mb-2">Melhor Pace</h3><p className="metric-value">{secondsToPace(calculatedStats.running.bestPace)}</p>{isPersonalBest && <p className="text-sm text-accent font-medium mt-1">Recorde pessoal!</p>}</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 flex items-center justify-center rounded-lg bg-secondary-gradient text-white"><HeartPulse size={20}/></div><h3 className="text-xl font-bold text-text-primary">Performance na Corrida</h3></div>
                 <div className="space-y-4">
                    <div className="p-4 bg-bg-secondary rounded-xl"><p className="font-semibold text-text-primary mb-2">Análise</p><p className="text-sm text-text-muted">{calculatedStats.running.avgPace < 360 ? 'Seu pace está excelente! Continue mantendo essa regularidade para melhorar ainda mais seu tempo e explorar distâncias maiores.' : 'Mantenha a consistência nos treinos. Foque na respiração e cadência para melhorar o pace. A cada treino você constrói mais resistência.'}</p></div>
                 </div>
              </div>

              <div className="card">
                <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary-gradient text-white"><Dumbbell size={20}/></div><h3 className="text-xl font-bold text-text-primary">Progresso na Musculação</h3></div>
                <div className="space-y-4">
                    <h4 className="font-semibold text-text-primary text-center">Maiores Cargas do Período</h4>
                     {calculatedStats.strength.topLifts.length > 0 ? calculatedStats.strength.topLifts.map((lift) => (
                        <div key={lift.exercise} className="flex justify-between items-center bg-bg-secondary p-3 rounded-lg">
                            <span className="text-sm font-medium text-text-secondary truncate pr-2">{lift.exercise}</span>
                            <span className="font-bold text-lg text-primary">{lift.weight}kg</span>
                        </div>
                    )) : <p className="text-sm text-text-muted text-center py-4">Nenhuma carga registrada.</p>}
                     <div className="p-4 bg-bg-secondary rounded-xl"><p className="font-semibold text-text-primary mb-2">Análise</p><p className="text-sm text-text-muted">{calculatedStats.strength.completionRate > 90 ? 'Sua dedicação é notável, com uma taxa de conclusão altíssima. Continue com o foco e considere aumentar as cargas progressivamente.' : 'Ótimo trabalho em manter a rotina. Tente focar em completar todas as séries para maximizar os ganhos de força e volume.'}</p></div>
                </div>
              </div>
            </div>

             <div className="card">
              <div className="flex items-center justify-center gap-3 mb-6"><Award className="w-5 h-5 text-accent" /><h3 className="text-xl font-bold text-text-primary">Insights de Performance</h3></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3"><h4 className="font-semibold text-text-primary">💪 Pontos Fortes</h4><ul className="space-y-2 list-inside">{['Consistência nos treinos', 'Melhoria gradual no pace', 'Alta taxa de conclusão'].map(item => <li key={item} className="flex items-center gap-2 text-sm text-text-secondary"><div className="w-2 h-2 bg-success rounded-full"></div>{item}</li>)}</ul></div>
                <div className="space-y-3"><h4 className="font-semibold text-text-primary">🎯 Áreas de Melhoria</h4><ul className="space-y-2 list-inside">{['Trabalhar variação de velocidade', 'Focar na recuperação entre séries', 'Aumentar progressivamente a carga'].map(item => <li key={item} className="flex items-center gap-2 text-sm text-text-secondary"><div className="w-2 h-2 bg-warning rounded-full"></div>{item}</li>)}</ul></div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;