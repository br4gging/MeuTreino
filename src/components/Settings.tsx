import React, { useState } from 'react';
import { User, Bell, Database, Download, Upload, Trash2 } from 'lucide-react';

const Settings: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-800 p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Configurações</h1>
          <p className="text-blue-200">Personalize sua experiência de treino</p>
        </div>

        {/* Profile Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Perfil</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome
              </label>
              <input
                type="text"
                placeholder="Seu nome"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  placeholder="70"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  placeholder="175"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Notificações</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Lembrete de treino</p>
                <p className="text-sm text-gray-600">Receba notificações para não perder seus treinos</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Dados</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Backup automático</p>
                <p className="text-sm text-gray-600">Salve seus dados automaticamente na nuvem</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoBackup}
                  onChange={(e) => setAutoBackup(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <button className="flex items-center justify-center gap-3 p-4 border-2 border-blue-500 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors">
                <Download className="w-5 h-5" />
                Exportar Dados
              </button>
              <button className="flex items-center justify-center gap-3 p-4 border-2 border-green-500 text-green-600 rounded-xl hover:bg-green-50 transition-colors">
                <Upload className="w-5 h-5" />
                Importar Dados
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-red-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-red-600">Zona de Perigo</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-xl">
              <p className="font-medium text-red-800 mb-2">Resetar todos os dados</p>
              <p className="text-sm text-red-600 mb-4">
                Esta ação irá remover permanentemente todos os seus treinos, histórico e configurações.
              </p>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium">
                Resetar Dados
              </button>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-white text-center">
          <h3 className="font-bold mb-2">Workout Tracker</h3>
          <p className="text-sm text-blue-200 mb-1">Versão 1.0.0</p>
          <p className="text-xs text-blue-300">
            Desenvolvido para maximizar seus resultados de treino
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;