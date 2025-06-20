// ARQUIVO COMPLETO E CORRIGIDO: src/components/Auth.tsx

import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Lock } from 'lucide-react';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  // FUNÇÃO CORRIGIDA: Mais explícita para evitar erros internos do Supabase.
  const handleAuthAction = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    if (isSignUp) {
      // Chamada explícita para criar conta
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        alert(error.message);
      } else if (data.user) {
        // O Supabase pode retornar um usuário sem 'identities' se a confirmação de e-mail estiver habilitada.
        // Isso é um sucesso parcial, e precisamos avisar o usuário para checar o e-mail.
        if (data.user.identities && data.user.identities.length > 0) {
            alert('Cadastro realizado! Verifique seu e-mail para confirmar a conta.');
        }
      }
    } else {
      // Chamada explícita para fazer login
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        alert(error.message);
      }
      // Se o login for bem-sucedido, o onAuthStateChange no App.tsx vai cuidar do resto.
    }

    setLoading(false);
  };
  
  const handleGoogleLogin = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    // A página será redirecionada pelo Supabase, então setLoading(false) pode não ser executado.
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          {isSignUp ? 'Criar Conta' : 'Bem-vindo!'}
        </h1>
        <p className="text-blue-200 text-center mb-8">
          {isSignUp ? 'Comece a registrar seus treinos.' : 'Acesse sua conta para continuar.'}
        </p>

        <form onSubmit={handleAuthAction} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-blue-200" htmlFor="email">Email</label>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" size={20} />
              <input
                id="email"
                className="w-full bg-white/20 border border-white/30 rounded-lg py-3 pl-12 pr-4 text-white placeholder-blue-300 focus:ring-2 focus:ring-teal-400 focus:outline-none"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-blue-200" htmlFor="password">Senha</label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" size={20} />
              <input
                id="password"
                className="w-full bg-white/20 border border-white/30 rounded-lg py-3 pl-12 pr-4 text-white placeholder-blue-300 focus:ring-2 focus:ring-teal-400 focus:outline-none"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 text-white font-bold py-3 rounded-lg hover:bg-teal-600 transition-all duration-300 disabled:bg-teal-800"
            >
              {loading ? 'Carregando...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
            </button>
          </div>
        </form>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/30"></div></div>
          <div className="relative flex justify-center text-sm"><span className="bg-blue-800 px-2 text-blue-200">ou</span></div>
        </div>
        
        <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white/90 text-blue-900 font-bold py-3 rounded-lg hover:bg-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
        >
             <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.519-3.487-11.01-8.41l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.916,36.641,44,31.1,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
            </svg>
            Entrar com Google
        </button>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-teal-300 hover:text-teal-200"
          >
            {isSignUp ? 'Já tem uma conta? Faça login.' : 'Não tem uma conta? Crie uma.'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;