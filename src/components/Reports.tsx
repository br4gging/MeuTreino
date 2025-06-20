// ARQUIVO COMPLETO E FINAL: src/components/Reports.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { WorkoutSession, StrengthWorkoutDetails } from '../types/workout';
import { BarChart3, TrendingUp, Clock, Target, Award, Activity, AlertCircle } from 'lucide-react';

const paceToSeconds = (pace: string): number => {
  if (!pace || typeof pace !== 'string') return 0;
  const parts = pace.split(':');
  if (parts.length !== 2) return 0;
  return (parseInt(parts[0], 10) * 60) + parseInt(parts[1], 10);
};

const secondsToPace = (seconds: number): string => {
  if (!seconds || !isFinite(seconds)) return 'N/A';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const getPaceRating = (paceInSeconds: number) => {
    if (!paceInSeconds || paceInSeconds === 0) return { rating: 'N/A', bg: 'bg-gray-100', color: 'text-gray-800' };
    if (paceInSeconds < 300) return { rating: 'Excelente', bg: 'bg-green-100', color: 'text-green-800' };
    if (paceInSeconds < 360) return { rating: 'Muito Bom', bg: 'bg-blue-100', color: 'text-blue-800' };
    if (paceInSeconds < 420) return { rating: 'Bom', bg: 'bg-yellow-100', color: 'text-yellow-800' };
    return { rating: 'Regular', bg: 'bg-orange-100', color: 'text-orange-800' };
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
        const sessionData = data || [];
        setSessions(sessionData as any[]);
        if (sessionData.length > 0) {
          const cardioSessions = sessionData.filter(s => s.type === 'cardio' && (s.details as any).pace);
          if (cardioSessions.length > 0) {
            const bestPaceAllTime = Math.min(...cardioSessions.map(s => paceToSeconds((s.details as any).pace)).filter(Boolean));
            setAllTimeBestPace(bestPaceAllTime);
          }
        }
      }
      setLoading(false);
    };
    getWorkoutHistory();
  }, []);

  const calculatedStats = useMemo(() => {
    if (!sessions || sessions.length === 0) return initialStats;

    const now = new Date();
    const startDate = new Date();
    if (selectedPeriod === 'week') startDate.setDate(now.getDate() - 7);
    else if (selectedPeriod === 'month') startDate.setMonth(now.getMonth() - 1);
    else if (selectedPeriod === 'quarter') startDate.setMonth(now.getMonth() - 3);

    const filteredSessions = sessions.filter(s => new Date(s.completed_at) >= startDate);
    if (filteredSessions.length === 0) return initialStats;
    
    const cardioSessions = filteredSessions.filter(s => s.type === 'cardio' && (s.details as any)?.pace);
    const runningPacesInSeconds = cardioSessions.map(s => paceToSeconds((s.details as any).pace));
    const runningStats = {
      sessions: cardioSessions.length,
      totalDistance: cardioSessions.reduce((acc, s) => acc + (s.details as any).distance, 0),
      avgPace: runningPacesInSeconds.reduce((acc, p) => acc + p, 0) / (runningPacesInSeconds.length || 1),
      bestPace: Math.min(...runningPacesInSeconds.filter(Boolean))
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
    const topLifts = Object.entries(allLifts).sort((a, b) => b[1].length - a[1].length).slice(0, 3).map(([exercise, weights]) => ({ exercise, weight: Math.max(...weights) }));
    const strengthStats = {
      totalSessions: strengthSessions.length,
      avgDuration: strengthSessions.reduce((acc, s) => acc + s.duration, 0) / (strengthSessions.length * 60 || 1),
      completionRate: (totalCompletion / (strengthSessions.length || 1)) * 100,
      topLifts
    };
    
    return { running: runningStats, strength: strengthStats };
  }, [sessions, selectedPeriod]);

  const paceRating = getPaceRating(calculatedStats.running.avgPace);
  const isPersonalBest = calculatedStats.running.bestPace > 0 && calculatedStats.running.bestPace === allTimeBestPace;

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-800 p-4 flex items-center justify-center"><p className="text-white text-xl">Calculando relatórios...</p></div>;
  }
  
  const hasData = sessions.length > 0;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-800 p-4 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div><h1 className="text-3xl font-bold mb-2">Relatórios de Performance</h1><p className="text-blue-200">Análise detalhada do seu progresso</p></div>
            <div className="flex gap-2">
              {(['week', 'month', 'quarter'] as const).map((period) => (<button key={period} onClick={() => setSelectedPeriod(period)} className={`px-4 py-2 rounded-xl font-medium transition-all ${selectedPeriod === period ? 'bg-white text-blue-900' : 'bg-white/20 text-white hover:bg-white/30'}`}>{period === 'week' ? 'Semana' : period === 'month' ? 'Mês' : 'Trimestre'}</button>))}
            </div>
          </div>
        </div>

        {!hasData ? (
          <div className="bg-white rounded-2xl p-8 shadow-xl text-center col-span-full">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-yellow-600" /></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Dados Insuficientes</h3>
            <p className="text-gray-600">Você precisa registrar alguns treinos na aba "Histórico" antes de gerarmos seus relatórios.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-xl"><div className="flex items-center gap-3 mb-3"><Clock className="w-5 h-5 text-orange-600" /><h3 className="font-semibold text-gray-800">Pace Médio</h3></div><p className="text-3xl font-bold text-gray-900 mb-2">{secondsToPace(calculatedStats.running.avgPace)} <span className="text-lg">min/km</span></p><div className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${paceRating.bg} ${paceRating.color}`}>{paceRating.rating}</div></div>
              <div className="bg-white rounded-2xl p-6 shadow-xl"><div className="flex items-center gap-3 mb-3"><Target className="w-5 h-5 text-blue-600" /><h3 className="font-semibold text-gray-800">Distância Total</h3></div><p className="text-3xl font-bold text-gray-900 mb-2">{calculatedStats.running.totalDistance.toFixed(1)} <span className="text-lg">km</span></p><p className="text-sm text-gray-600">{calculatedStats.running.sessions} sessões de corrida</p></div>
              <div className="bg-white rounded-2xl p-6 shadow-xl"><div className="flex items-center gap-3 mb-3"><TrendingUp className="w-5 h-5 text-green-600" /><h3 className="font-semibold text-gray-800">Treinos Força</h3></div><p className="text-3xl font-bold text-gray-900 mb-2">{calculatedStats.strength.totalSessions} <span className="text-lg">sessões</span></p><p className="text-sm text-gray-600">{calculatedStats.strength.completionRate.toFixed(0)}% de conclusão</p></div>
              <div className="bg-white rounded-2xl p-6 shadow-xl"><div className="flex items-center gap-3 mb-3"><Award className="w-5 h-5 text-purple-600" /><h3 className="font-semibold text-gray-800">Melhor Pace</h3></div><p className="text-3xl font-bold text-gray-900 mb-2">{secondsToPace(calculatedStats.running.bestPace)} <span className="text-lg">min/km</span></p>{isPersonalBest && <p className="text-sm text-purple-600 font-medium">Recorde pessoal!</p>}</div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6"><Activity className="w-5 h-5 text-orange-600" /> <h3 className="text-xl font-bold text-gray-800">Performance na Corrida</h3></div>
                <div className="space-y-4"><div className="flex justify-between items-center p-4 bg-orange-50 rounded-xl"><span className="font-medium text-gray-700">Sessões de Corrida</span><span className="text-lg font-bold text-orange-600">{calculatedStats.running.sessions}</span></div><div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl"><span className="font-medium text-gray-700">Distância Total</span><span className="text-lg font-bold text-blue-600">{calculatedStats.running.totalDistance.toFixed(1)} km</span></div></div>
                <div className="mt-6 p-4 bg-gray-50 rounded-xl"><h4 className="font-semibold text-gray-800 mb-2">Análise</h4><p className="text-sm text-gray-600">{calculatedStats.running.avgPace < 360 ? 'Seu pace está excelente! Continue mantendo essa regularidade para melhorar ainda mais seu tempo e explorar distâncias maiores.' : 'Mantenha a consistência nos treinos. Foque na respiração e cadência para melhorar o pace. A cada treino você constrói mais resistência.'}</p></div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6"><BarChart3 className="w-5 h-5 text-blue-600" /><h3 className="text-xl font-bold text-gray-800">Progresso na Força</h3></div>
                <div className="space-y-4"><div className="flex justify-between items-center p-4 bg-green-50 rounded-xl"><span className="font-medium text-gray-700">Taxa de Conclusão</span><span className="text-lg font-bold text-green-600">{calculatedStats.strength.completionRate.toFixed(0)}%</span></div><div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl"><span className="font-medium text-gray-700">Duração Média</span><span className="text-lg font-bold text-purple-600">{calculatedStats.strength.avgDuration.toFixed(0)} min</span></div></div>
                <div className="mt-6"><h4 className="font-semibold text-gray-800 mb-3">Maiores Cargas (Top 3 Exercícios)</h4><div className="space-y-3">{calculatedStats.strength.topLifts.map((lift) => (<div key={lift.exercise} className="flex justify-between items-center text-sm"><span className="font-medium text-gray-700">{lift.exercise}</span><span className="font-bold text-green-600">{lift.weight}kg</span></div>))}{calculatedStats.strength.topLifts.length === 0 && <p className="text-sm text-gray-500">Nenhuma carga registrada neste período.</p>}</div></div>
                <div className="mt-6 p-4 bg-gray-50 rounded-xl"><h4 className="font-semibold text-gray-800 mb-2">Análise</h4><p className="text-sm text-gray-600">{calculatedStats.strength.completionRate > 90 ? 'Sua dedicação é notável, com uma taxa de conclusão altíssima. Continue com o foco e considere aumentar as cargas progressivamente.' : 'Ótimo trabalho em manter a rotina. Tente focar em completar todas as séries para maximizar os ganhos de força e volume.'}</p></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6"><div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center"><BarChart3 className="w-5 h-5 text-indigo-600" /></div><h3 className="text-xl font-bold text-gray-800">Insights de Performance</h3></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4"><h4 className="font-semibold text-gray-800">💪 Pontos Fortes</h4><ul className="space-y-2"><li className="flex items-center gap-2 text-sm text-gray-700"><div className="w-2 h-2 bg-green-500 rounded-full"></div>Consistência nos treinos de força</li><li className="flex items-center gap-2 text-sm text-gray-700"><div className="w-2 h-2 bg-green-500 rounded-full"></div>Melhoria gradual no pace da corrida</li><li className="flex items-center gap-2 text-sm text-gray-700"><div className="w-2 h-2 bg-green-500 rounded-full"></div>Alta taxa de conclusão dos exercícios</li></ul></div>
                <div className="space-y-4"><h4 className="font-semibold text-gray-800">🎯 Áreas de Melhoria</h4><ul className="space-y-2"><li className="flex items-center gap-2 text-sm text-gray-700"><div className="w-2 h-2 bg-orange-500 rounded-full"></div>Trabalhar variação de velocidade na corrida</li><li className="flex items-center gap-2 text-sm text-gray-700"><div className="w-2 h-2 bg-orange-500 rounded-full"></div>Focar na recuperação entre séries</li><li className="flex items-center gap-2 text-sm text-gray-700"><div className="w-2 h-2 bg-orange-500 rounded-full"></div>Aumentar progressivamente a carga</li></ul></div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;