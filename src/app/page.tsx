// src/app/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-surface">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-6 shadow-lg shadow-primary-500/20 animate-pulse">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-3 border-primary-200 border-t-primary-500 mx-auto mb-4"></div>
        <p className="text-foreground-muted font-medium">Carregando...</p>
      </div>
    </div>
  );
}
