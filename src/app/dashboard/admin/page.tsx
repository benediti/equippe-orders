// src/app/dashboard/admin/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    clients: 0,
    orders: 0,
    users: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [productsSnap, clientsSnap, ordersSnap, usersSnap] = await Promise.all([
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'clients')),
        getDocs(collection(db, 'orders')),
        getDocs(collection(db, 'users'))
      ]);

      setStats({
        products: productsSnap.size,
        clients: clientsSnap.size,
        orders: ordersSnap.size,
        users: usersSnap.size
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const cards = [
    {
      title: 'Catálogo',
      value: stats.products,
      subtitle: 'Produtos cadastrados',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      link: '/dashboard/admin/products',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Clientes',
      value: stats.clients,
      subtitle: 'Clientes ativos',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      link: '/dashboard/admin/clients',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Pedidos',
      value: stats.orders,
      subtitle: 'Pedidos no sistema',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      link: '/dashboard/admin/orders',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Usuários',
      value: stats.users,
      subtitle: 'Usuários cadastrados',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      link: '/dashboard/admin/users',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    }
  ];

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-foreground-muted">Visão geral do sistema de pedidos Equippe</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, idx) => (
          <Link key={idx} href={card.link}>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.bgColor} ${card.textColor} group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground mb-1">{card.value}</div>
                <div className="text-sm font-medium text-foreground-muted">{card.subtitle}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Catálogo */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold mb-2">Catálogo de Produtos</h3>
              <p className="text-primary-100 text-sm">Gerencie produtos com imagens, categorias e filtros avançados</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <Link
            href="/dashboard/admin/products"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-primary-600 font-semibold rounded-xl hover:shadow-xl transition-all"
          >
            Gerenciar Catálogo
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Clientes */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold mb-2">Clientes</h3>
              <p className="text-green-100 text-sm">Cadastre e gerencie os clientes do sistema</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <Link
            href="/dashboard/admin/clients"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-green-600 font-semibold rounded-xl hover:shadow-xl transition-all"
          >
            Gerenciar Clientes
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Pedidos */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold mb-2">Pedidos</h3>
              <p className="text-purple-100 text-sm">Visualize e gerencie todos os pedidos do sistema</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <Link
            href="/dashboard/admin/orders"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-purple-600 font-semibold rounded-xl hover:shadow-xl transition-all"
          >
            Ver Pedidos
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Usuários */}
        <div className="bg-gradient-to-br from-accent-500 to-accent-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold mb-2">Usuários</h3>
              <p className="text-red-100 text-sm">Gerencie usuários e suas permissões no sistema</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <Link
            href="/dashboard/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-accent-600 font-semibold rounded-xl hover:shadow-xl transition-all"
          >
            Gerenciar Usuários
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
