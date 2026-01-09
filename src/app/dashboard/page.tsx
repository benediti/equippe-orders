// src/app/dashboard/page.tsx
'use client';
import { useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') router.push('/dashboard/admin');
      else if (user.role === 'supervisor') router.push('/dashboard/supervisor');
      else if (user.role === 'approver') router.push('/dashboard/approver');
      else if (user.role === 'purchasing') router.push('/dashboard/purchasing');
      else router.push('/login'); // Se não tiver role, volta (ou mostra erro)
    }
  }, [user, loading, router]);

  return <div className="p-8 text-center">Redirecionando...</div>;
}