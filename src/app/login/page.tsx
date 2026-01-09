// src/app/login/page.tsx
'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Se der certo, o AuthProvider vai detectar e redirecionar
      router.push('/dashboard'); 
    } catch (err: any) {
      console.error(err);
      setError('Erro ao entrar. Verifique e-mail e senha.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-surface p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4 shadow-lg shadow-primary-500/20">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Equippe</h1>
          <p className="text-foreground-muted text-sm">Sistema de Pedidos</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-accent-50 border border-accent-200 rounded-xl">
            <p className="text-accent-600 text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-foreground placeholder:text-foreground-muted/50 focus:border-primary-500 bg-surface/30"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-foreground placeholder:text-foreground-muted/50 focus:border-primary-500 bg-surface/30"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30"
          >
            Entrar
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-foreground-muted">
            Secure login powered by Firebase
          </p>
        </div>
      </div>
    </div>
  );
}