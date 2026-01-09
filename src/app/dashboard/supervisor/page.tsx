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
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedClient, setSelectedClient] = useState('');

  useEffect(() => {
    loadProducts();
    loadClients();
  }, [user]);

  const loadProducts = async () => {
    const snap = await getDocs(collection(db, 'products'));
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    setProducts(data.filter(p => p.active));
  };

  const loadClients = async () => {
    if (!user) return;
    const q = query(collection(db, 'clients'), where('supervisorId', '==', user.uid));
    const snap = await getDocs(q);
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
    setClients(data.filter(c => c.active));
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
      alert('Selecione um cliente e adicione produtos ao carrinho.');
      return;
    }

    const client = clients.find(c => c.id === selectedClient);
    if (!client) return;

    try {
      await addDoc(collection(db, 'orders'), {
        supervisorId: user?.uid,
        supervisorName: user?.displayName,
        clientId: selectedClient,
        clientName: client.sectorName,
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
    <DashboardLayout role="supervisor">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Criar Pedido</h1>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Selecione o Cliente</h2>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Escolha um cliente</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.sectorName}
              </option>
            ))}
          </select>
          {selectedClientData && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <p><strong>Setor:</strong> {selectedClientData.sectorName}</p>
              {selectedClientData.phone && <p><strong>Telefone:</strong> {selectedClientData.phone}</p>}
              {selectedClientData.email && <p><strong>Email:</strong> {selectedClientData.email}</p>}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Produtos Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <div key={product.id} className="border rounded p-4">
                <h3 className="font-medium">{product.name}</h3>
                {product.sku && <p className="text-sm text-gray-600">SKU: {product.sku}</p>}
                <p className="text-sm text-gray-600">Unidade: {product.unit}</p>
                <p className="text-sm text-gray-600">Estoque: {product.stock}</p>
                <button
                  onClick={() => addToCart(product)}
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                >
                  Adicionar
                </button>
              </div>
            ))}
          </div>
        </div>

        {cart.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Carrinho</h2>
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.productId} className="flex items-center justify-between border-b pb-2">
                  <span>{item.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="bg-gray-200 px-2 py-1 rounded"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="bg-gray-200 px-2 py-1 rounded"
                    >
                      +
                    </button>
                    <button
                      onClick={() => updateQuantity(item.productId, 0)}
                      className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleSubmitOrder}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 w-full"
            >
              Enviar Pedido
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
