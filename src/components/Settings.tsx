// ARQUIVO: src/components/Settings.tsx (COMPLETO E FINAL)

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User, Bell, Key, LogOut, Trash2, X } from 'lucide-react';

// Novo componente de Modal para a Zona de Perigo
const DangerZoneModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onDelete: (options: Record<string, boolean>) => void;
  loading: boolean;
}> = ({ isOpen, onClose, onDelete, loading }) => {
  const [options, setOptions] = useState({
    delete_workouts: false,
    delete_schedule: false,
    delete_sessions: false,
    delete_measurements: false,
  });

  if (!isOpen) return null;

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setOptions(prev => ({ ...prev, [name]: checked }));
  };

  const isAnyOptionSelected = Object.values(options).some(v => v);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-red-600">Resetar Dados</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X size={24} /></button>
        </div>
        <p className="text-gray-600 mb-6">Selecione os dados que deseja apagar permanentemente. **Esta ação não pode ser desfeita.**</p>
        
        <div className="space-y-4">
          <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input type="checkbox" name="delete_workouts" checked={options.delete_workouts} onChange={handleCheckboxChange} className="h-5 w-5 rounded text-red-600 focus:ring-red-500" />
            <span className="ml-3 font-medium text-gray-800">Meus Treinos (moldes)</span>
          </label>
          <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input type="checkbox" name="delete_schedule" checked={options.delete_schedule} onChange={handleCheckboxChange} className="h-5 w-5 rounded text-red-600 focus:ring-red-500" />
            <span className="ml-3 font-medium text-gray-800">Programação Semanal</span>
          </label>
          <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input type="checkbox" name="delete_sessions" checked={options.delete_sessions} onChange={handleCheckboxChange} className="h-5 w-5 rounded text-red-600 focus:ring-red-500" />
            <span className="ml-3 font-medium text-gray-800">Histórico de Sessões</span>
          </label>
           <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input type="checkbox" name="delete_measurements" checked={options.delete_measurements} onChange={handleCheckboxChange} className="h-5 w-5 rounded text-red-600 focus:ring-red-500" />
            <span className="ml-3 font-medium text-gray-800">Medidas Corporais</span>
          </label>
        </div>

        <div className="mt-8">
          <button 
            onClick={() => onDelete(options)} 
            disabled={!isAnyOptionSelected || loading}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Apagando...' : 'Apagar Dados Selecionados'}
          </button>
        </div>
      </div>
    </div>
  );
};


const Settings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);
  
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setEmail(user.email || '');
        const { data: profileData } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setDisplayName(profileData.display_name || '');
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, display_name: displayName, updated_at: new Date().toISOString() });

    if (error) {
      alert("Erro ao atualizar o perfil: " + error.message);
    } else {
      alert("Perfil atualizado com sucesso!");
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
        alert("A nova senha deve ter pelo menos 6 caracteres.");
        return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
        alert("Erro ao atualizar a senha: " + error.message);
    } else {
        alert("Senha atualizada com sucesso!");
        setNewPassword('');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
  };
  
  const handleDataDelete = async (options: Record<string, boolean>) => {
    if (window.confirm("Você tem CERTEZA que quer apagar os dados selecionados?")) {
        setLoading(true);
        const { error } = await supabase.rpc('delete_user_data', options);
        
        if (error) {
          alert("Erro ao apagar os dados: " + error.message);
        } else {
          alert("Dados selecionados foram apagados com sucesso.");
          setIsDangerModalOpen(false);
          // Opcional: recarregar a página para refletir os dados apagados
          window.location.reload();
        }
        setLoading(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    alert("Função de apagar conta ainda será implementada.");
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-800 p-4 pb-20">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">Configurações</h1>
            <p className="text-blue-200">Gerencie seu perfil e preferências</p>
          </div>

          {/* Perfil */}
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6"><User className="w-5 h-5 text-blue-600" /> <h3 className="text-xl font-bold text-gray-800">Perfil</h3></div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome de Perfil</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Seu apelido" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email (não pode ser alterado)</label>
                <input type="email" value={email} disabled className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed" />
              </div>
              <button type="submit" disabled={loading} className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Salvando...' : 'Salvar Perfil'}
              </button>
            </form>
          </div>

          {/* Senha */}
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6"><Key className="w-5 h-5 text-gray-600" /> <h3 className="text-xl font-bold text-gray-800">Alterar Senha</h3></div>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
              <button type="submit" disabled={loading || newPassword.length < 6} className="px-5 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50">
                {loading ? 'Atualizando...' : 'Atualizar Senha'}
              </button>
            </form>
          </div>

          {/* Notificações */}
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6"><Bell className="w-5 h-5 text-yellow-600" /> <h3 className="text-xl font-bold text-gray-800">Notificações</h3></div>
            <div className="flex items-center justify-between">
              <div><p className="font-medium text-gray-800">Lembrete de treino</p><p className="text-sm text-gray-600">Funcionalidade indisponível no momento</p></div>
              <label className="relative inline-flex items-center cursor-not-allowed opacity-50"><input type="checkbox" disabled className="sr-only peer" /><div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></label>
            </div>
          </div>
          
          {/* Logout */}
          <div className="bg-white rounded-2xl p-6 shadow-xl">
             <button onClick={handleLogout} disabled={loading} className="w-full flex items-center justify-center gap-3 p-4 border-2 border-gray-500 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors font-bold disabled:opacity-50">
               <LogOut className="w-5 h-5" />
               Sair da Conta
             </button>
          </div>

          {/* Zona de Perigo */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-red-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center"><Trash2 className="w-5 h-5 text-red-600" /></div>
              <h3 className="text-xl font-bold text-red-600">Zona de Perigo</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-xl">
                <p className="font-medium text-red-800 mb-2">Resetar dados do aplicativo</p>
                <p className="text-sm text-red-600 mb-4">Apague seletivamente seus treinos, histórico, programação e medições.</p>
                <button onClick={() => setIsDangerModalOpen(true)} disabled={loading} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50">
                  Gerenciar Meus Dados
                </button>
              </div>
              <div className="p-4 bg-gray-100 border rounded-xl">
                 <p className="font-medium text-gray-800 mb-2">Apagar conta</p>
                 <p className="text-sm text-gray-600 mb-4">Isso irá remover permanentemente sua conta e todos os dados. Esta ação é irreversível.</p>
                 <button onClick={handleDeleteAccount} disabled={true} className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                  Apagar Minha Conta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DangerZoneModal
        isOpen={isDangerModalOpen}
        onClose={() => setIsDangerModalOpen(false)}
        onDelete={handleDataDelete}
        loading={loading}
      />
    </>
  );
};

export default Settings;