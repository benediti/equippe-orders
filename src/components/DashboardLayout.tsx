// src/components/DashboardLayout.tsx
'use client';
import { ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { useAuth } from './AuthProvider';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function DashboardLayout({ children, title, subtitle, actions }: DashboardLayoutProps) {
  const { user } = useAuth();

  const handleLogout = () => auth.signOut();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-accent-500 text-white';
      case 'supervisor': return 'bg-primary-500 text-white';
      case 'approver': return 'bg-purple-500 text-white';
      case 'purchasing': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'supervisor': return 'Supervisor';
      case 'approver': return 'Aprovador';
      case 'purchasing': return 'Compras';
      default: return role;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-surface to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo e Título */}
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-500 rounded-xl shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Equippe</h1>
                <p className="text-xs text-foreground-muted">Sistema de Pedidos</p>
              </div>
            </div>

            {/* User Info e Actions */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">{user?.displayName}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(user?.role || '')}`}>
                  {getRoleLabel(user?.role || '')}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-accent-600 hover:bg-accent-50 rounded-xl transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground">{title}</h2>
            {subtitle && <p className="text-foreground-muted mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex gap-3">{actions}</div>}
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
