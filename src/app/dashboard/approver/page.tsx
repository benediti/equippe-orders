// src/app/dashboard/approver/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, OrderItem } from '@/lib/types';
import DashboardLayout from '@/components/DashboardLayout';

export default function ApproverDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editedProducts, setEditedProducts] = useState<OrderItem[]>([]);

  useEffect(() => {
    loadPendingOrders();
  }, []);

  const loadPendingOrders = async () => {
    const q = query(collection(db, 'orders'), where('status', '==', 'pending'));
    const snap = await getDocs(q);
    setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
  };

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setEditedProducts(order.products.map(p => ({
      ...p,
      approvedQuantity: p.approvedQuantity ?? p.quantity
    })));
  };

  const updateApprovedQuantity = (productId: string, approvedQty: number) => {
    setEditedProducts(editedProducts.map(p =>
      p.productId === productId ? { ...p, approvedQuantity: approvedQty } : p
    ));
  };

  const handleApprove = async () => {
    if (!selectedOrder) return;

    try {
      await updateDoc(doc(db, 'orders', selectedOrder.id), {
        status: 'approved',
        products: editedProducts
      });
      alert('Pedido aprovado com sucesso!');
      setSelectedOrder(null);
      loadPendingOrders();
    } catch (error) {
      console.error(error);
      alert('Erro ao aprovar pedido');
    }
  };

  const handleReject = async () => {
    if (!selectedOrder) return;

    if (!confirm('Tem certeza que deseja rejeitar este pedido?')) return;

    try {
      await updateDoc(doc(db, 'orders', selectedOrder.id), {
        status: 'rejected'
      });
      alert('Pedido rejeitado!');
      setSelectedOrder(null);
      loadPendingOrders();
    } catch (error) {
      console.error(error);
      alert('Erro ao rejeitar pedido');
    }
  };

  return (
    <DashboardLayout
      title="Aprovação de Pedidos"
      subtitle="Revise e aprove ou rejeite pedidos pendentes"
    >
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Lista de Pedidos Pendentes */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="font-semibold text-foreground mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Pedidos Pendentes
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
              {orders.length}
            </span>
          </h2>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p className="text-foreground-muted">Nenhum pedido pendente</p>
              <p className="text-sm text-foreground-muted mt-1">Todos os pedidos foram processados</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {orders.map(order => (
                <div
                  key={order.id}
                  onClick={() => handleSelectOrder(order)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedOrder?.id === order.id
                      ? 'bg-purple-50 border-purple-500 shadow-md'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-semibold text-foreground">{order.clientName}</div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium">
                      Pendente
                    </span>
                  </div>
                  <div className="text-sm text-foreground-muted">
                    <div className="flex items-center gap-1 mb-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {order.supervisorName}
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      {order.products.length} produto(s)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detalhes do Pedido Selecionado */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            {!selectedOrder ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <p className="text-foreground-muted">Selecione um pedido</p>
                <p className="text-sm text-foreground-muted mt-1">Clique em um pedido para revisar</p>
              </div>
            ) : (
              <div>
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Detalhes do Pedido
                </h2>

                <div className="mb-6 p-4 bg-surface rounded-xl border border-gray-100">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-foreground-muted">Cliente:</span>
                      <div className="font-semibold text-foreground">{selectedOrder.clientName}</div>
                    </div>
                    <div>
                      <span className="text-foreground-muted">Supervisor:</span>
                      <div className="font-semibold text-foreground">{selectedOrder.supervisorName}</div>
                    </div>
                  </div>
                </div>

                <h3 className="font-semibold text-foreground mb-3 text-sm">Produtos Solicitados</h3>
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {editedProducts.map(item => (
                    <div key={item.productId} className="p-3 bg-surface rounded-lg border border-gray-100">
                      <div className="font-medium text-foreground mb-2">{item.name}</div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <span className="text-foreground-muted">Solicitado:</span>
                          <span className="ml-2 font-semibold text-foreground">{item.quantity}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          <label className="text-sm text-foreground-muted">Aprovar:</label>
                          <input
                            type="number"
                            value={item.approvedQuantity ?? item.quantity}
                            onChange={(e) => updateApprovedQuantity(item.productId, parseInt(e.target.value) || 0)}
                            className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-center text-foreground bg-white focus:border-purple-500"
                            min="0"
                            max={item.quantity}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleApprove}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-green-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Aprovar
                  </button>
                  <button
                    onClick={handleReject}
                    className="flex-1 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-accent-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Rejeitar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
