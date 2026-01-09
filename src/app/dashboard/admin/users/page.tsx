// src/app/dashboard/admin/users/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import AdminLayout from '@/components/AdminLayout';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'supervisor' | 'approver' | 'purchasing';
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'supervisor' as 'admin' | 'supervisor' | 'approver' | 'purchasing'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedRole]);

  const loadUsers = async () => {
    const snap = await getDocs(collection(db, 'users'));
    const usersData = snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));
    setUsers(usersData);
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter(u => u.role === selectedRole);
    }

    setFilteredUsers(filtered);
  };

  const handleRoleChange = async (uid: string, newRole: string) => {
    if (!confirm('Tem certeza que deseja alterar a função deste usuário?')) return;

    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
      alert('Função do usuário atualizada com sucesso!');
      loadUsers();
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar função do usuário');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingUser) {
        // Atualizar usuário existente
        await updateDoc(doc(db, 'users', editingUser.uid), {
          displayName: formData.displayName,
          role: formData.role
        });
        alert('Usuário atualizado com sucesso!');
      } else {
        // Criar novo usuário no Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        // Criar documento do usuário no Firestore com o role
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: formData.email,
          displayName: formData.displayName,
          role: formData.role
        });

        alert('Usuário criado com sucesso!');
      }

      closeModal();
      loadUsers();
    } catch (error: any) {
      console.error(error);
      let errorMessage = 'Erro ao salvar usuário';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está em uso';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Senha muito fraca. Use no mínimo 6 caracteres';
      }

      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      displayName: user.displayName,
      role: user.role
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (user: UserProfile) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário ${user.displayName}?\n\nATENÇÃO: Isso remove apenas o registro do Firestore. O usuário ainda poderá fazer login pelo Firebase Authentication.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', user.uid));
      alert('Usuário excluído com sucesso!');
      loadUsers();
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir usuário');
    }
  };

  const openModal = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      password: '',
      displayName: '',
      role: 'supervisor'
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-red-100 text-red-700',
      supervisor: 'bg-blue-100 text-blue-700',
      approver: 'bg-purple-100 text-purple-700',
      purchasing: 'bg-green-100 text-green-700'
    };

    const labels = {
      admin: 'Administrador',
      supervisor: 'Supervisor',
      approver: 'Aprovador',
      purchasing: 'Compras'
    };

    return (
      <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${styles[role as keyof typeof styles]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    );
  };

  const roleStats = {
    admin: users.filter(u => u.role === 'admin').length,
    supervisor: users.filter(u => u.role === 'supervisor').length,
    approver: users.filter(u => u.role === 'approver').length,
    purchasing: users.filter(u => u.role === 'purchasing').length
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Gerenciamento de Usuários</h1>
          <p className="text-foreground-muted">Gerencie usuários e suas permissões no sistema</p>
        </div>
        <button
          onClick={openModal}
          className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/20 hover:shadow-xl transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Cadastrar Usuário
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
          <div className="text-2xl font-bold text-red-700">{roleStats.admin}</div>
          <div className="text-sm text-red-600">Administradores</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
          <div className="text-2xl font-bold text-blue-700">{roleStats.supervisor}</div>
          <div className="text-sm text-blue-600">Supervisores</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
          <div className="text-2xl font-bold text-purple-700">{roleStats.approver}</div>
          <div className="text-sm text-purple-600">Aprovadores</div>
        </div>
        <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
          <div className="text-2xl font-bold text-green-700">{roleStats.purchasing}</div>
          <div className="text-sm text-green-600">Compras</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">Pesquisar</label>
            <input
              type="text"
              placeholder="Nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-foreground focus:border-primary-500 bg-surface/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Função</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-foreground focus:border-primary-500 bg-surface/30"
            >
              <option value="all">Todas</option>
              <option value="admin">Administrador</option>
              <option value="supervisor">Supervisor</option>
              <option value="approver">Aprovador</option>
              <option value="purchasing">Compras</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold text-foreground">Usuário</th>
                <th className="p-4 font-semibold text-foreground">Email</th>
                <th className="p-4 font-semibold text-foreground">Função Atual</th>
                <th className="p-4 font-semibold text-foreground">Alterar Permissão</th>
                <th className="p-4 font-semibold text-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-foreground-muted">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => (
                  <tr key={user.uid} className={idx !== filteredUsers.length - 1 ? 'border-b border-gray-100' : ''}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.displayName?.[0] || user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{user.displayName || 'Sem nome'}</div>
                          <div className="text-xs text-foreground-muted">{user.uid.substring(0, 12)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-foreground-muted">{user.email}</td>
                    <td className="p-4">{getRoleBadge(user.role)}</td>
                    <td className="p-4">
                      <select
                        className="px-3 py-2 border border-gray-200 rounded-lg text-foreground bg-surface/30 focus:border-primary-500"
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.uid, e.target.value)}
                      >
                        <option value="supervisor">Supervisor</option>
                        <option value="approver">Aprovador</option>
                        <option value="purchasing">Compras</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-2 text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
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
          Total de {filteredUsers.length} usuário(s) encontrado(s)
        </div>
      </div>

      {/* Cards de Descrição das Funções */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-red-700">Admin</h3>
          </div>
          <p className="text-sm text-red-600">Acesso total ao sistema, gerencia produtos, usuários e todas as funcionalidades</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-semibold text-blue-700">Supervisor</h3>
          </div>
          <p className="text-sm text-blue-600">Cria e envia novos pedidos para aprovação</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-purple-700">Aprovador</h3>
          </div>
          <p className="text-sm text-purple-600">Revisa e aprova/rejeita pedidos enviados pelos supervisores</p>
        </div>

        <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-green-700">Compras</h3>
          </div>
          <p className="text-sm text-green-600">Processa pedidos aprovados e marca como finalizados</p>
        </div>
      </div>

      {/* Modal de Cadastro/Edição de Usuário */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                {editingUser ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}
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

            <form onSubmit={handleCreateUser} className="p-6">
              <div className="space-y-4">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-foreground focus:border-primary-500 bg-surface/30"
                    placeholder="João Silva"
                  />
                </div>

                {/* Email - desabilitado ao editar */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                  <input
                    type="email"
                    required={!editingUser}
                    disabled={!!editingUser}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-foreground focus:border-primary-500 bg-surface/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="usuario@empresa.com"
                  />
                  {editingUser && (
                    <p className="text-xs text-foreground-muted mt-1">O email não pode ser alterado</p>
                  )}
                </div>

                {/* Senha - apenas ao criar */}
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Senha *</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-foreground focus:border-primary-500 bg-surface/30"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <p className="text-xs text-foreground-muted mt-1">A senha deve ter no mínimo 6 caracteres</p>
                  </div>
                )}

                {/* Perfil/Role */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Perfil / Função *</label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-foreground focus:border-primary-500 bg-surface/30"
                  >
                    <option value="supervisor">Supervisor - Cria pedidos</option>
                    <option value="approver">Aprovador - Aprova pedidos</option>
                    <option value="purchasing">Compras - Finaliza pedidos</option>
                    <option value="admin">Administrador - Acesso total</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 border border-gray-300 text-foreground font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (editingUser ? 'Atualizando...' : 'Cadastrando...') : (editingUser ? 'Atualizar Usuário' : 'Cadastrar Usuário')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
