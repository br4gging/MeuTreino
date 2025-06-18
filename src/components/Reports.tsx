import React, { useState } from 'react';
import { BarChart3, TrendingUp, Clock, Target, Calendar, Award } from 'lucide-react';

const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('week');

  // Mock data for demonstration
  const runningStats = {
    week: { avgPace: 5.8, totalDistance: 10, sessions: 2, bestPace: 5.4 },
    month: { avgPace: 5.9, totalDistance: 40, sessions: 8, bestPace: 5.2 },
    quarter: { avgPace: 6.1, totalDistance: 120, sessions: 24, bestPace: 5.0 }
  };

  const strengthStats = {
    week: { 
      totalSessions: 3, 
      avgDuration: 65, 
      completionRate: 95,
      progressions: [
        { exercise: 'Agachamento', increase: 5 },
        { exercise: 'Supino', increase: 2.5 },
        { exercise: 'Terra', increase: 10 }
      ]
    },
    month: { 
      totalSessions: 12, 
      avgDuration: 67, 
      completionRate: 92,
      progressions: [
        { exercise: 'Agachamento', increase: 20 },
        { exercise: 'Supino', increase: 15 },
        { exercise: 'Terra', increase: 25 }
      ]
    },
    quarter: { 
      totalSessions: 36, 
      avgDuration: 64, 
      completionRate: 88,
      progressions: [
        { exercise: 'Agachamento', increase: 40 },
        { exercise: 'Supino', increase: 30 },
        { exercise: 'Terra', increase: 50 }
      ]
    }
  };

  const currentRunningStats = runningStats[selectedPeriod];
  const currentStrengthStats = strengthStats[selectedPeriod];

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'week': return 'Esta Semana';
      case 'month': return 'Este Mês';
      case 'quarter': return 'Este Trimestre';
      default: return 'Esta Semana';
    }
  };

  const getPaceRating = (pace: number) => {
    if (pace < 5.5) return { rating: 'Excelente', color: 'text-green-600', bg: 'bg-green-50' };
    if (pace < 6.0) return { rating: 'Muito Bom', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (pace < 6.5) return { rating: 'Bom', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { rating: 'Regular', color: 'text-orange-600', bg: 'bg-orange-50' };
  };

  const paceRating = getPaceRating(currentRunningStats.avgPace);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-800 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Relatórios de Performance</h1>
              <p className="text-blue-200">Análise detalhada do seu progresso</p>
            </div>
            <div className="flex gap-2">
              {(['week', 'month', 'quarter'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    selectedPeriod === period
                      ? 'bg-white text-blue-900'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {getPeriodLabel(period)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Pace Médio</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {currentRunningStats.avgPace} min/km
            </p>
            <div className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${paceRating.bg} ${paceRating.color}`}>
              {paceRating.rating}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Distância Total</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {currentRunningStats.totalDistance} km
            </p>
            <p className="text-sm text-gray-600">
              {currentRunningStats.sessions} sessões de corrida
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Treinos Força</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {currentStrengthStats.totalSessions}
            </p>
            <p className="text-sm text-gray-600">
              {currentStrengthStats.completionRate}% conclusão
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Melhor Pace</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {currentRunningStats.bestPace} min/km
            </p>
            <p className="text-sm text-green-600 font-medium">
              Recorde pessoal!
            </p>
          </div>
        </div>

        {/* Detailed Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Running Performance */}
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Performance na Corrida</h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-orange-50 rounded-xl">
                <span className="font-medium text-gray-700">Pace Médio</span>
                <span className="text-lg font-bold text-orange-600">
                  {currentRunningStats.avgPace} min/km
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                <span className="font-medium text-gray-700">Melhor Pace</span>
                <span className="text-lg font-bold text-green-600">
                  {currentRunningStats.bestPace} min/km
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                <span className="font-medium text-gray-700">Consistência</span>
                <span className="text-lg font-bold text-blue-600">
                  {currentRunningStats.sessions > 6 ? 'Excelente' : 'Boa'}
                </span>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-2">Análise</h4>
                <p className="text-sm text-gray-600">
                  {currentRunningStats.avgPace < 6.0 
                    ? 'Seu pace está excelente! Continue mantendo essa regularidade para melhorar ainda mais.'
                    : 'Mantenha a consistência nos treinos. Foque na respiração e cadência para melhorar o pace.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Strength Progress */}
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Progresso na Força</h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                <span className="font-medium text-gray-700">Sessões Completas</span>
                <span className="text-lg font-bold text-blue-600">
                  {currentStrengthStats.totalSessions}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                <span className="font-medium text-gray-700">Taxa de Conclusão</span>
                <span className="text-lg font-bold text-green-600">
                  {currentStrengthStats.completionRate}%
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl">
                <span className="font-medium text-gray-700">Duração Média</span>
                <span className="text-lg font-bold text-purple-600">
                  {currentStrengthStats.avgDuration} min
                </span>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold text-gray-800 mb-3">Progressões de Carga</h4>
              <div className="space-y-3">
                {currentStrengthStats.progressions.map((prog, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{prog.exercise}</span>
                    <span className="text-sm font-bold text-green-600">+{prog.increase}kg</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Insights de Performance</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">💪 Pontos Fortes</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Consistência nos treinos de força
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Melhoria gradual no pace da corrida
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Alta taxa de conclusão dos exercícios
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">🎯 Áreas de Melhoria</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Trabalhar variação de velocidade na corrida
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Focar na recuperação entre séries
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Aumentar progressivamente a carga
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;