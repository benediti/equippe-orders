// src/app/dashboard/purchasing/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/lib/types';
import DashboardLayout from '@/components/DashboardLayout';

export default function PurchasingDashboard() {
  const [approvedOrders, setApprovedOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'approved' | 'completed'>('approved');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const approvedQuery = query(collection(db, 'orders'), where('status', '==', 'approved'));
    const approvedSnap = await getDocs(approvedQuery);
    setApprovedOrders(approvedSnap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));

    const completedQuery = query(collection(db, 'orders'), where('status', '==', 'completed'));
    const completedSnap = await getDocs(completedQuery);
    setCompletedOrders(completedSnap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
  };

  const markAsCompleted = async (orderId: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'completed'
      });
      alert('Pedido marcado como concluído!');
      loadOrders();
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar pedido');
    }
  };

  const exportToCSV = (order: Order) => {
    const headers = ['Produto', 'Quantidade Solicitada', 'Quantidade Aprovada'];
    const rows = order.products.map(p => [
      p.name,
      p.quantity.toString(),
      (p.approvedQuantity ?? p.quantity).toString()
    ]);

    const csvContent = [
      `Cliente: ${order.clientName}`,
      `Supervisor: ${order.supervisorName}`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pedido_${order.clientName.replace(/\s/g, '_')}_${order.id.substring(0, 8)}.csv`;
    link.click();
  };

  return (
    <DashboardLayout
      title="Gestão de Compras"
      subtitle="Gerencie pedidos aprovados e exporte relatórios"
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 w-fit">
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === 'approved'
              ? 'bg-green-500 text-white shadow-md'
              : 'text-foreground-muted hover:bg-surface'
          }`}
        >
          <span className="flex items-center gap-2">
            Aprovados
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold">
              {approvedOrders.length}
            </span>
          </span>
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === 'completed'
              ? 'bg-green-500 text-white shadow-md'
              : 'text-foreground-muted hover:bg-surface'
          }`}
        >
          <span className="flex items-center gap-2">
            Concluídos
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold">
              {completedOrders.length}
            </span>
          </span>
        </button>
      </div>

      {/* Conteúdo: Pedidos Aprovados */}
      {activeTab === 'approved' && (
        <div className="space-y-4">
          {approvedOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-200 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p className="text-foreground-muted">Nenhum pedido aprovado no momento</p>
              <p className="text-sm text-foreground-muted mt-1">Pedidos aprovados aparecerão aqui</p>
            </div>
          ) : (
            approvedOrders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                      {order.clientName}
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">
                        Aprovado
                      </span>
                    </h3>
                    <p className="text-sm text-foreground-muted mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Supervisor: {order.supervisorName}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-3 text-foreground text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Produtos ({order.products.length})
                  </h4>
                  <div className="space-y-2 bg-surface p-3 rounded-xl">
                    {order.products.map((p, idx) => (
                      <div key={idx} className="flex justify-between text-sm pb-2 border-b border-gray-200 last:border-0 last:pb-0">
                        <span className="text-foreground font-medium">{p.name}</span>
                        <span className="text-foreground-muted">
                          Solicitado: <strong className="text-foreground">{p.quantity}</strong> |
                          Aprovado: <strong className="text-green-600">{p.approvedQuantity ?? p.quantity}</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => exportToCSV(order)}
                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exportar CSV
                  </button>
                  <button
                    onClick={() => markAsCompleted(order.id)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-green-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Marcar como Concluído
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Conteúdo: Pedidos Concluídos */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          {completedOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-200 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-foreground-muted">Nenhum pedido concluído ainda</p>
              <p className="text-sm text-foreground-muted mt-1">Pedidos concluídos aparecerão aqui</p>
            </div>
          ) : (
            completedOrders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                      {order.clientName}
                      <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold">
                        Concluído
                      </span>
                    </h3>
                    <p className="text-sm text-foreground-muted mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Supervisor: {order.supervisorName}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-3 text-foreground text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Produtos ({order.products.length})
                  </h4>
                  <div className="space-y-2 bg-surface p-3 rounded-xl">
                    {order.products.map((p, idx) => (
                      <div key={idx} className="flex justify-between text-sm pb-2 border-b border-gray-200 last:border-0 last:pb-0">
                        <span className="text-foreground font-medium">{p.name}</span>
                        <span className="text-foreground-muted">
                          Quantidade: <strong className="text-foreground">{p.approvedQuantity ?? p.quantity}</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => exportToCSV(order)}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Exportar CSV
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
