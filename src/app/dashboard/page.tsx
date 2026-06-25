// src/app/dashboard/page.tsx
'use client';
import { useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (!user.ativo) {
        router.push('/acesso-negado');
        return;
      }

      // Redireciona por perfil
      switch (user.role) {
        case 'admin':
          router.push('/dashboard/admin');
          break;
        case 'approver':
          router.push('/dashboard/approver');
          break;
        case 'purchasing':
          router.push('/dashboard/purchasing');
          break;
        case 'supervisor':
        default:
          router.push('/dashboard/supervisor');
          break;
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-200 border-t-primary-500 mx-auto mb-4"></div>
        <p className="text-foreground-muted font-medium">Redirecionando...</p>
      </div>
    </div>
  );
}
