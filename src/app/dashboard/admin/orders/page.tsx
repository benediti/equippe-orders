// src/app/dashboard/admin/orders/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/AdminLayout';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
}

interface Order {
  id: string;
  clientId: string;
  clientName: string;
  supervisorId: string;
  supervisorName: string;
  items: OrderItem[];
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: any;
  approvedAt?: any;
  completedAt?: any;
  notes?: string;
}

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, selectedStatus]);

  const loadOrders = async () => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const ordersData = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
    setOrders(ordersData);
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter(o =>
        o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.supervisorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(o => o.status === selectedStatus);
    }

    setFilteredOrders(filtered);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-blue-100 text-blue-700',
      rejected: 'bg-red-100 text-red-700',
      completed: 'bg-green-100 text-green-700'
    };

    const labels = {
      pending: 'Pendente',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
      completed: 'Finalizado'
    };

    return (
      <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Gerenciamento de Pedidos</h1>
        <p className="text-foreground-muted">Visualize e gerencie todos os pedidos do sistema</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
          <div className="text-2xl font-bold text-yellow-700">
            {orders.filter(o => o.status === 'pending').length}
          </div>
          <div className="text-sm text-yellow-600">Pendentes</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
          <div className="text-2xl font-bold text-blue-700">
            {orders.filter(o => o.status === 'approved').length}
          </div>
          <div className="text-sm text-blue-600">Aprovados</div>
        </div>
        <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
          <div className="text-2xl font-bold text-green-700">
            {orders.filter(o => o.status === 'completed').length}
          </div>
          <div className="text-sm text-green-600">Finalizados</div>
        </div>
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
          <div className="text-2xl font-bold text-red-700">
            {orders.filter(o => o.status === 'rejected').length}
          </div>
          <div className="text-sm text-red-600">Rejeitados</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">Pesquisar</label>
            <input
              type="text"
              placeholder="Cliente, supervisor ou ID do pedido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-foreground focus:border-primary-500 bg-surface/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-foreground focus:border-primary-500 bg-surface/30"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendentes</option>
              <option value="approved">Aprovados</option>
              <option value="completed">Finalizados</option>
              <option value="rejected">Rejeitados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Pedidos e Detalhes */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Lista de Pedidos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-foreground mb-4">Lista de Pedidos</h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-foreground-muted">
                Nenhum pedido encontrado
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all ${
                    selectedOrder?.id === order.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{order.clientName}</h4>
                      <p className="text-sm text-foreground-muted">ID: {order.id.substring(0, 8)}</p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="text-xs text-foreground-muted">
                    <div>Supervisor: {order.supervisorName}</div>
                    <div>Data: {formatDate(order.createdAt)}</div>
                    <div>Itens: {order.items.length} produto(s)</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detalhes do Pedido */}
        <div className="lg:sticky lg:top-24 h-fit">
          {selectedOrder ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-foreground mb-4">Detalhes do Pedido</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-foreground-muted">ID do Pedido</label>
                  <p className="text-sm text-foreground font-mono">{selectedOrder.id}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground-muted">Cliente</label>
                  <p className="text-sm text-foreground font-semibold">{selectedOrder.clientName}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground-muted">Supervisor</label>
                  <p className="text-sm text-foreground">{selectedOrder.supervisorName}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground-muted">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground-muted">Data de Criação</label>
                  <p className="text-sm text-foreground">{formatDate(selectedOrder.createdAt)}</p>
                </div>

                {selectedOrder.approvedAt && (
                  <div>
                    <label className="text-sm font-medium text-foreground-muted">Data de Aprovação</label>
                    <p className="text-sm text-foreground">{formatDate(selectedOrder.approvedAt)}</p>
                  </div>
                )}

                {selectedOrder.completedAt && (
                  <div>
                    <label className="text-sm font-medium text-foreground-muted">Data de Finalização</label>
                    <p className="text-sm text-foreground">{formatDate(selectedOrder.completedAt)}</p>
                  </div>
                )}

                {selectedOrder.notes && (
                  <div>
                    <label className="text-sm font-medium text-foreground-muted">Observações</label>
                    <p className="text-sm text-foreground">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-foreground mb-3">Itens do Pedido</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-surface rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{item.productName}</p>
                      </div>
                      <div className="text-sm text-foreground-muted">
                        {item.quantity} {item.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-foreground-muted">Selecione um pedido para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
