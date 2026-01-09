// src/app/dashboard/admin/clients/page.tsx
'use client';
import { useState, useEffect, useTransition } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminLayout from '@/components/AdminLayout';
import { deleteClient } from '../actions';

interface Client {
  id: string;
  clientCode?: string;
  sectorName: string;
  supervisorId?: string;
  supervisorName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  neighborhood?: string;
  zipCode?: string;
  active: boolean;
}

interface Supervisor {
  uid: string;
  displayName: string;
  email: string;
}

export default function ClientsManagementPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    clientCode: '',
    sectorName: '',
    supervisorId: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    neighborhood: '',
    zipCode: '',
    active: true
  });

  useEffect(() => {
    loadClients();
    loadSupervisors();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, selectedStatus]);

  const loadClients = async () => {
    const snap = await getDocs(collection(db, 'clients'));
    const clientsData = snap.docs.map(d => ({ id: d.id, ...d.data() } as Client));
    setClients(clientsData);
  };

  const loadSupervisors = async () => {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'supervisor'));
      const snap = await getDocs(q);
      const supervisorsData = snap.docs.map(d => ({
        uid: d.id,
        displayName: d.data().displayName || d.data().email,
        email: d.data().email
      } as Supervisor));
      console.log('Supervisores carregados:', supervisorsData);
      setSupervisors(supervisorsData);
    } catch (error) {
      console.error('Erro ao carregar supervisores:', error);
    }
  };

  const filterClients = () => {
    let filtered = [...clients];

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.sectorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.clientCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.supervisorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm)
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(c =>
        selectedStatus === 'active' ? c.active : !c.active
      );
    }

    setFilteredClients(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const selectedSupervisor = supervisors.find(s => s.uid === formData.supervisorId);

      const clientData = {
        ...formData,
        supervisorName: selectedSupervisor?.displayName || ''
      };

      if (editingClient) {
        await updateDoc(doc(db, 'clients', editingClient.id), clientData);
        alert('Cliente atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'clients'), clientData);
        alert('Cliente cadastrado com sucesso!');
      }

      closeModal();
      loadClients();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar cliente');
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      clientCode: client.clientCode || '',
      sectorName: client.sectorName,
      supervisorId: client.supervisorId || '',
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || '',
      city: client.city || '',
      state: client.state || '',
      neighborhood: client.neighborhood || '',
      zipCode: client.zipCode || '',
      active: client.active ?? true
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este setor?')) return;

    startTransition(async () => {
      const result = await deleteClient(id);
      if (result.success) {
        alert(result.message);
        loadClients(); // Recarrega os clientes para atualizar a UI
      } else {
        alert(result.message);
      }
    });
  };

  const toggleActive = async (client: Client) => {
    try {
      await updateDoc(doc(db, 'clients', client.id), {
        active: !client.active
      });
      loadClients();
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar status');
    }
  };

  const openModal = () => {
    setEditingClient(null);
    setFormData({
      clientCode: '',
      sectorName: '',
      supervisorId: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      neighborhood: '',
      zipCode: '',
      active: true
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Gerenciamento de Setores</h1>
          <p className="text-foreground-muted">Cadastre e gerencie os setores e seus supervisores</p>
        </div>
        <button
          onClick={openModal}
          className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/20 hover:shadow-xl transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Cadastrar Setor
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">Pesquisar</label>
            <input
              type="text"
              placeholder="Nome do setor, código, supervisor..."
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
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Setores */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold text-foreground">Código</th>
                <th className="p-4 font-semibold text-foreground">Nome do Setor</th>
                <th className="p-4 font-semibold text-foreground">Supervisor</th>
                <th className="p-4 font-semibold text-foreground">Telefone</th>
                <th className="p-4 font-semibold text-foreground">Cidade</th>
                <th className="p-4 font-semibold text-foreground">Status</th>
                <th className="p-4 font-semibold text-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-foreground-muted">
                    Nenhum setor encontrado
                  </td>
                </tr>
              ) : (
                filteredClients.map((client, idx) => (
                  <tr key={client.id} className={idx !== filteredClients.length - 1 ? 'border-b border-gray-100' : ''}>
                    <td className="p-4">
                      <span className="font-mono text-sm text-foreground-muted">{client.clientCode || '-'}</span>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-foreground">{client.sectorName}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-foreground">{client.supervisorName || '-'}</div>
                    </td>
                    <td className="p-4 text-foreground-muted">{client.phone || '-'}</td>
                    <td className="p-4 text-foreground-muted">
                      {client.city ? `${client.city}/${client.state || ''}` : '-'}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleActive(client)}
                        disabled={isPending}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                          client.active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {client.active ? '✓ Ativo' : '✗ Inativo'}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(client)}
                           disabled={isPending}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                           disabled={isPending}
                          className="p-2 text-accent-600 hover:bg-accent-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Excluir"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-surface/50 border-t border-gray-200 text-sm text-foreground-muted">
          Total de {filteredClients.length} setor(es) encontrado(s)
        </div>
      </div>

      {/* Modal de Cadastro/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                {editingClient ? 'Editar Setor' : 'Ficha de Cadastro de Setor'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-foreground-muted hover:text-foreground"
                title="Fechar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Código do Setor */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Código Setor</label>
                  <input
                    type="text"
                    value={formData.clientCode}
                    onChange={(e) => setFormData({ ...formData, clientCode: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-foreground focus:border-primary-500 bg-surface/30"
                    placeholder="Ex: 2088310039"
                  />
                </div>

                {/* Espaço vazio */}
                <div></div>

                {/* Nome do Setor */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Nome do Setor *</label>
                  <input
                    type="text"
                    required
                    value={formData.sectorName}
                    onChange={(e) => setFormData({ ...formData, sectorName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-foreground focus:border-primary-500 bg-surface/30"
                    placeholder="Ex: Setor de Limpeza"
                  />
                </div>

                {/* Supervisor Responsável */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Supervisor Responsável *</label>
                  <select
                    required
                    value={formData.supervisorId}
                    onChange={(e) => setFormData({ ...formData, supervisorId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-foreground focus:border-primary-500 bg-surface/30"
                  >
                    <option value="">Selecione um supervisor...</option>
                    {supervisors.map(supervisor => (
                      <option key={supervisor.uid} value={supervisor.uid}>
                        {supervisor.displayName} ({supervisor.email})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-foreground-muted mt-1">
                    O supervisor poderá ver e gerenciar apenas seus próprios setores
                  </p>
                </div>

                {/* Telefone */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Telefone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-foreground focus:border-primary-500 bg-surface/30"
                    placeholder="(11) 3901-0453"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-foreground focus:border-primary-500 bg-surface/30"
                    placeholder="setor@empresa.com"
                  />
                </div>

                {/* Endereço */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Endereço</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-foreground focus:border-primary-500 bg-surface/30"
                    placeholder="RUA FORMOSA 367 23 ANDAR"
                  />
                </div>

                {/* Cidade */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Cidade</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-foreground focus:border-primary-500 bg-surface/30"
                    placeholder="SAO PAULO"
                  />
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Estado</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-foreground focus:border-primary-500 bg-surface/30"
                  >
                    <option value="">Selecione...</option>
                    <option value="AC">AC</option>
                    <option value="AL">AL</option>
                    <option value="AP">AP</option>
                    <option value="AM">AM</option>
                    <option value="BA">BA</option>
                    <option value="CE">CE</option>
                    <option value="DF">DF</option>
                    <option value="ES">ES</option>
                    <option value="GO">GO</option>
                    <option value="MA">MA</option>
                    <option value="MT">MT</option>
                    <option value="MS">MS</option>
                    <option value="MG">MG</option>
                    <option value="PA">PA</option>
                    <option value="PB">PB</option>
                    <option value="PR">PR</option>
                    <option value="PE">PE</option>
                    <option value="PI">PI</option>
                    <option value="RJ">RJ</option>
                    <option value="RN">RN</option>
                    <option value="RS">RS</option>
                    <option value="RO">RO</option>
                    <option value="RR">RR</option>
                    <option value="SC">SC</option>
                    <option value="SP">SP</option>
                    <option value="SE">SE</option>
                    <option value="TO">TO</option>
                  </select>
                </div>

                {/* Bairro */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Bairro</label>
                  <input
                    type="text"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-foreground focus:border-primary-500 bg-surface/30"
                    placeholder="CENTRO"
                  />
                </div>

                {/* CEP */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">CEP</label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-foreground focus:border-primary-500 bg-surface/30"
                    placeholder="01049000"
                  />
                </div>

                {/* Status */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-5 h-5 text-primary-500 rounded border-gray-300 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-foreground">Setor Ativo</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border border-gray-300 text-foreground font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-xl transition-all"
                >
                  {editingClient ? 'Atualizar Setor' : 'Cadastrar Setor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
