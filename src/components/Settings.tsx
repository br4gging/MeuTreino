import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User, Bell, Key, LogOut, Trash2, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

// --- Componente do Modal de Perigo (sem alterações) ---
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
      <div className="card max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-error">Resetar Dados</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={24} /></button>
        </div>
        <p className="text-text-muted mb-6">Selecione os dados que deseja apagar permanentemente. **Esta ação não pode ser desfeita.**</p>
        <div className="space-y-4">
          <label className="flex items-center p-4 bg-bg-secondary rounded-lg cursor-pointer hover:bg-white/5 border border-white/10"><input type="checkbox" name="delete_workouts" checked={options.delete_workouts} onChange={handleCheckboxChange} className="h-5 w-5 rounded text-error focus:ring-error bg-transparent border-text-muted" /><span className="ml-3 font-medium text-text-secondary">Meus Treinos (moldes)</span></label>
          <label className="flex items-center p-4 bg-bg-secondary rounded-lg cursor-pointer hover:bg-white/5 border border-white/10"><input type="checkbox" name="delete_schedule" checked={options.delete_schedule} onChange={handleCheckboxChange} className="h-5 w-5 rounded text-error focus:ring-error bg-transparent border-text-muted" /><span className="ml-3 font-medium text-text-secondary">Programação Semanal</span></label>
          <label className="flex items-center p-4 bg-bg-secondary rounded-lg cursor-pointer hover:bg-white/5 border border-white/10"><input type="checkbox" name="delete_sessions" checked={options.delete_sessions} onChange={handleCheckboxChange} className="h-5 w-5 rounded text-error focus:ring-error bg-transparent border-text-muted" /><span className="ml-3 font-medium text-text-secondary">Histórico de Sessões</span></label>
          <label className="flex items-center p-4 bg-bg-secondary rounded-lg cursor-pointer hover:bg-white/5 border border-white/10"><input type="checkbox" name="delete_measurements" checked={options.delete_measurements} onChange={handleCheckboxChange} className="h-5 w-5 rounded text-error focus:ring-error bg-transparent border-text-muted" /><span className="ml-3 font-medium text-text-secondary">Medidas Corporais</span></label>
        </div>
        <div className="mt-8">
          <button onClick={() => onDelete(options)} disabled={!isAnyOptionSelected || loading} className="w-full btn bg-error text-white disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Apagando...' : 'Apagar Dados Selecionados'}
          </button>
        </div>
      </div>
    </div>
  );
};

const InputField = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full px-4 py-3 bg-black/20 border-2 border-white/10 rounded-xl text-text-primary focus:outline-none focus:border-primary focus:bg-primary/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-black/30" />
);

const Settings: React.FC = () => {
  const { showToast, showConfirmation, setLoading: setGlobalLoading, loading: globalLoading } = useAppContext();
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);
  
  useEffect(() => {
    const fetchProfile = async () => {
      setProfileLoading(true); 
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email || '');
          const { data: profileData, error } = await supabase.from('profiles').select('display_name').eq('id', user.id).single();
          if (error && error.code !== 'PGRST116') throw error;
          if (profileData) setDisplayName(profileData.display_name || '');
        }
      } catch (error: any) {
        showToast("Erro ao carregar perfil: " + error.message, { type: 'error' });
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [showToast]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setProfileLoading(false);
      return;
    };
    const { error } = await supabase.from('profiles').upsert({ id: user.id, display_name: displayName, updated_at: new Date().toISOString() });
    if (error) { showToast("Erro ao atualizar o perfil: " + error.message, { type: 'error' }); } 
    else { showToast("Perfil atualizado com sucesso!"); }
    setProfileLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { showToast("A nova senha deve ter pelo menos 6 caracteres.", { type: 'error' }); return; }
    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { showToast("Erro ao atualizar a senha: " + error.message, { type: 'error' }); } 
    else { showToast("Senha atualizada com sucesso!"); setNewPassword(''); }
    setPasswordLoading(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showToast("Erro ao sair: " + error.message, { type: 'error' });
    }
  };
  
  const handleDataDelete = async (options: Record<string, boolean>) => {
    setIsDangerModalOpen(false);
    showConfirmation("Apagar Dados Selecionados?", "Você tem CERTEZA ABSOLUTA? Esta ação não pode ser desfeita e os dados serão perdidos para sempre.",
      async () => {
        setGlobalLoading(true);
        try {
          const { error } = await supabase.rpc('delete_user_data', options);
          if (error) throw error;
          showToast("Dados selecionados foram apagados com sucesso.");
          window.location.reload();
        } catch (error: any) {
           showToast("Erro ao apagar os dados: " + error.message, {type: 'error'});
           setGlobalLoading(false);
        }
      }
    )
  };
  
  // >>>>> NOVA FUNÇÃO IMPLEMENTADA <<<<<
  const handleDeleteAccount = async () => {
    showConfirmation(
      "Apagar sua conta permanentemente?",
      "Todos os seus dados (perfil, treinos, histórico, TUDO) serão apagados para SEMPRE. Esta ação é IRREVERSÍVEL. Tem certeza que quer continuar?",
      async () => {
        setGlobalLoading(true);
        try {
          // Chame a sua função de Edge aqui. 
          // Se o nome for diferente, altere 'delete-user-account'.
          const { error } = await supabase.functions.invoke('delete-user-account');

          if (error) throw error;
          
          // Se a chamada for bem sucedida, o usuário será deslogado automaticamente
          // pelo backend. O listener onAuthStateChange no App.tsx cuidará do resto.
          showToast("Conta apagada com sucesso. Sentiremos sua falta!");

        } catch (error: any) {
          showToast("Erro ao apagar a conta: " + error.message, { type: 'error' });
          setGlobalLoading(false); // Só desativa o loading se der erro.
        }
      }
    )
  };

  return (
    <>
      <div className="min-h-screen p-4 pb-24 animate-fade-in-up">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-text-primary mb-2">Ajustes</h1>
            <p className="text-text-muted">Gerencie seu perfil e preferências.</p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-6"><User className="w-5 h-5 text-primary" /> <h3 className="text-xl font-bold text-text-primary">Perfil</h3></div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Nome de Perfil</label>
                <InputField type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Seu apelido" disabled={profileLoading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Email (não pode ser alterado)</label>
                <InputField type="email" value={email} disabled />
              </div>
              <button type="submit" disabled={profileLoading} className="btn-primary disabled:opacity-50">
                {profileLoading ? 'Salvando...' : 'Salvar Perfil'}
              </button>
            </form>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-6"><Key className="w-5 h-5 text-text-muted" /> <h3 className="text-xl font-bold text-text-primary">Alterar Senha</h3></div>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Nova Senha</label>
                <InputField type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" disabled={passwordLoading}/>
              </div>
              <button type="submit" disabled={passwordLoading || newPassword.length < 6} className="btn-secondary disabled:opacity-50">
                {passwordLoading ? 'Atualizando...' : 'Atualizar Senha'}
              </button>
            </form>
          </div>
          
          <div className="card">
            <div className="flex items-center gap-3 mb-6"><Bell className="w-5 h-5 text-warning" /> <h3 className="text-xl font-bold text-text-primary">Notificações</h3></div>
            <div className="flex items-center justify-between opacity-50">
              <div><p className="font-medium text-text-secondary">Lembrete de treino</p><p className="text-sm text-text-muted">Funcionalidade indisponível no momento</p></div>
              <label className="relative inline-flex items-center cursor-not-allowed"><input type="checkbox" disabled className="sr-only peer" /><div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div></label>
            </div>
          </div>
          
          <button onClick={handleLogout} disabled={globalLoading} className="w-full flex items-center justify-center gap-3 p-4 border-2 border-white/10 text-text-secondary rounded-xl hover:bg-white/5 transition-colors font-bold disabled:opacity-50">
            <LogOut className="w-5 h-5" />
            Sair da Conta
          </button>
          
          <div className="card border-2 border-error/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-error/20 rounded-lg flex items-center justify-center"><Trash2 className="w-5 h-5 text-error" /></div>
              <h3 className="text-xl font-bold text-error">Zona de Perigo</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-error/10 rounded-xl">
                <p className="font-medium text-error mb-2">Resetar dados do aplicativo</p>
                <p className="text-sm text-error/80 mb-4">Apague seletivamente seus treinos, histórico, programação e medições.</p>
                <button onClick={() => setIsDangerModalOpen(true)} disabled={globalLoading} className="btn bg-error text-white disabled:opacity-50">
                  Gerir os Meus Dados
                </button>
              </div>
              <div className="p-4 bg-black/20 rounded-xl">
                 <p className="font-medium text-text-secondary mb-2">Apagar conta</p>
                 <p className="text-sm text-text-muted mb-4">Isso irá remover permanentemente sua conta e todos os dados. Esta ação é irreversível.</p>
                 {/* >>>>> BOTÃO ATIVADO E CONECTADO <<<<< */}
                 <button onClick={handleDeleteAccount} disabled={globalLoading} className="btn btn-secondary border-error/50 text-error hover:bg-error/20 disabled:opacity-50">
                  Apagar a Minha Conta
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
        loading={globalLoading}
      />
    </>
  );
};

export default Settings;