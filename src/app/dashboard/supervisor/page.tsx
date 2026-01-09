// src/app/dashboard/supervisor/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { Product, Client, OrderItem } from '@/lib/types';
import DashboardLayout from '@/components/DashboardLayout';

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [cart, setCart] = useState<OrderItem[]>([]);

  useEffect(() => {
    if (user) {
      loadClients();
      loadProducts();
    }
  }, [user]);

  const loadClients = async () => {
    if (!user) return;

    // Carregar apenas os setores onde o supervisor atual é o responsável
    const q = query(
      collection(db, 'clients'),
      where('supervisorId', '==', user.uid),
      where('active', '==', true)
    );
    const snap = await getDocs(q);
    const clientsData = snap.docs.map(d => ({ id: d.id, ...d.data() } as Client));
    setClients(clientsData);
  };

  const loadProducts = async () => {
    const snap = await getDocs(collection(db, 'products'));
    const prods = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
    setProducts(prods.filter(p => p.active));
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        quantity: 1
      }]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.productId !== productId));
    } else {
      setCart(cart.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      ));
    }
  };

  const handleSubmitOrder = async () => {
    if (!selectedClient || cart.length === 0) {
      alert('Selecione um cliente e adicione produtos ao carrinho!');
      return;
    }

    const client = clients.find(c => c.id === selectedClient);
    if (!client) return;

    try {
      await addDoc(collection(db, 'orders'), {
        supervisorId: user?.uid,
        supervisorName: user?.displayName,
        clientId: selectedClient,
        clientName: client.name,
        status: 'pending',
        products: cart,
        createdAt: serverTimestamp()
      });

      alert('Pedido enviado com sucesso!');
      setCart([]);
      setSelectedClient('');
    } catch (error) {
      console.error(error);
      alert('Erro ao enviar pedido');
    }
  };

  const selectedClientData = clients.find(c => c.id === selectedClient);

  return (
    <DashboardLayout
      title="Novo Pedido"
      subtitle="Selecione produtos e crie uma solicitação de pedido"
    >
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda: Cliente e Produtos */}
        <div className="space-y-6">
          {/* Seleção de Cliente */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Cliente / Setor
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-foreground focus:border-primary-500 bg-surface/30"
            >
              <option value="">-- Selecione um cliente --</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
              ))}
            </select>
            {selectedClientData && (
              <div className="mt-3 p-3 bg-primary-50 rounded-lg">
                <p className="text-sm text-primary-700">
                  <strong>{selectedClientData.name}</strong> • Código: {selectedClientData.code}
                </p>
              </div>
            )}
          </div>

          {/* Lista de Produtos */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Produtos Disponíveis ({products.length})
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {products.length === 0 ? (
                <p className="text-center py-8 text-foreground-muted">Nenhum produto disponível</p>
              ) : (
                products.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-3 rounded-lg border border-gray-100 hover:bg-surface transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{p.name}</h4>
                      <p className="text-sm text-foreground-muted">{p.unit} • Estoque: {p.stock}</p>
                    </div>
                    <button
                      onClick={() => addToCart(p)}
                      className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Adicionar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Coluna Direita: Carrinho */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="font-semibold text-foreground mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Carrinho
              </span>
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                {cart.length} {cart.length === 1 ? 'item' : 'itens'}
              </span>
            </h2>

            {cart.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-foreground-muted">Carrinho vazio</p>
                <p className="text-sm text-foreground-muted mt-1">Adicione produtos para criar um pedido</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.productId} className="p-3 bg-surface rounded-lg border border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-foreground flex-1">{item.name}</h4>
                        <button
                          onClick={() => updateQuantity(item.productId, 0)}
                          className="text-accent-500 hover:text-accent-600 p-1"
                          title="Remover"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)}
                          className="w-16 text-center px-2 py-1.5 border border-gray-200 rounded-lg text-foreground bg-white"
                          min="1"
                        />
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                        <span className="text-sm text-foreground-muted ml-auto">
                          Qtd: <strong className="text-foreground">{item.quantity}</strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSubmitOrder}
                  disabled={!selectedClient || cart.length === 0}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold py-4 rounded-xl shadow-lg shadow-green-500/20 hover:shadow-xl transition-all disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Enviar Pedido
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
