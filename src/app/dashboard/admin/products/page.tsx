// src/app/dashboard/admin/products/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import AdminLayout from '@/components/AdminLayout';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  productCode: string;
  image?: string;
  isContracted: boolean;
  stock?: number;
  unit?: string;
  active: boolean;
}

export default function ProductManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: 0,
    productCode: '',
    stock: 0,
    unit: 'UN',
    active: true,
    isContracted: false
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, selectedStatus]);

  const loadProducts = async () => {
    const snap = await getDocs(collection(db, 'products'));
    const productsData = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
    setProducts(productsData);
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.productCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(p =>
        selectedStatus === 'active' ? p.active : !p.active
      );
    }

    setFilteredProducts(filtered);
  };

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const timestamp = Date.now();
    const storageRef = ref(storage, `products/temp_${timestamp}_${timestamp}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let imageUrl = editingProduct?.image || '';

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const productData = {
        ...formData,
        image: imageUrl,
        price: Number(formData.price),
        stock: Number(formData.stock)
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        alert('Produto atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'products'), productData);
        alert('Produto cadastrado com sucesso!');
      }

      closeModal();
      loadProducts();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar produto');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category || '',
      price: product.price || 0,
      productCode: product.productCode || '',
      stock: product.stock || 0,
      unit: product.unit || 'UN',
      active: product.active ?? true,
      isContracted: product.isContracted ?? false
    });
    setImagePreview(product.image || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      await deleteDoc(doc(db, 'products', id));
      alert('Produto excluído!');
      loadProducts();
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir produto');
    }
  };

  const toggleActive = async (product: Product) => {
    try {
      await updateDoc(doc(db, 'products', product.id), {
        active: !product.active
      });
      loadProducts();
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar status');
    }
  };

  const openModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      price: 0,
      productCode: '',
      stock: 0,
      unit: 'UN',
      active: true,
      isContracted: false
    });
    setImageFile(null);
    setImagePreview('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview('');
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Gerenciamento de Produtos</h1>
          <p className="text-foreground-muted">Cadastre, edite e gerencie o catálogo de produtos</p>
        </div>
        <button
          onClick={openModal}
          className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/20 hover:shadow-xl transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Cadastrar Produto
        </button>
      </div>
      {/* Filtros */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">Pesquisar</label>
            <input
              type="text"
              placeholder="Nome, código ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-foreground focus:border-primary-500 bg-surface/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Categoria</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-foreground focus:border-primary-500 bg-surface/30"
            >
              <option value="all">Todas</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
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

      {/* Tabela de Produtos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold text-foreground w-16"></th>
                <th className="p-4 font-semibold text-foreground">Nome</th>
                <th className="p-4 font-semibold text-foreground">Código</th>
                <th className="p-4 font-semibold text-foreground">Estoque</th>
                <th className="p-4 font-semibold text-foreground">Preço</th>
                <th className="p-4 font-semibold text-foreground">Categoria</th>
                <th className="p-4 font-semibold text-foreground">Status</th>
                <th className="p-4 font-semibold text-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-foreground-muted">
                    Nenhum produto encontrado
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, idx) => (
                  <tr key={product.id} className={idx !== filteredProducts.length - 1 ? 'border-b border-gray-100' : ''}>
                    <td className="p-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-foreground">{product.name}</div>
                      {product.description && (
                        <div className="text-xs text-foreground-muted line-clamp-1">{product.description.substring(0, 50)}...</div>
                      )}
                    </td>
                    <td className="p-4 text-foreground-muted">{product.productCode || '-'}</td>
                    <td className="p-4 text-foreground">
                      <span className={product.stock && product.stock > 0 ? 'text-green-600 font-medium' : 'text-gray-500'}>
                        {product.stock || 0} {product.unit || 'UN'}
                      </span>
                    </td>
                    <td className="p-4 text-foreground font-semibold">R$ {product.price.toFixed(2)}</td>
                    <td className="p-4">
                      {product.category && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-lg text-xs font-medium">
                          {product.category}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleActive(product)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          product.active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {product.active ? '✓ Ativo' : '✗ Inativo'}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
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
          Total de {filteredProducts.length} produto(s) encontrado(s)
        </div>
      </div>

      {/* Modal de Cadastro/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
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
                {/* Imagem */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Imagem do Produto</label>
                  <div className="flex gap-4 items-center">
                    {imagePreview && (
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-foreground bg-surface/30"
                    />
                  </div>
                </div>

                {/* Nome */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Nome *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-foreground focus:border-primary-500 bg-surface/30"
                    placeholder="Ex: Limpador multiuso 500ml"
                  />
                </div>

                {/* Descrição */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-foreground focus:border-primary-500 bg-surface/30"
                    placeholder="Descrição detalhada do produto..."
                  />
                </div>

                {/* Código */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Código do Produto</label>
                  <input
                    type="text"
                    value={formData.productCode}
                    onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-foreground focus:border-primary-500 bg-surface/30"
                    placeholder="Ex: FL-001"
                  />
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Categoria *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-foreground focus:border-primary-500 bg-surface/30"
                    placeholder="Ex: Limpeza"
                    list="categories"
                  />
                  <datalist id="categories">
                    {categories.map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                {/* Preço */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-foreground focus:border-primary-500 bg-surface/30"
                    placeholder="0.00"
                  />
                </div>

                {/* Estoque */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Estoque</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-foreground focus:border-primary-500 bg-surface/30"
                  />
                </div>

                {/* Unidade */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Unidade</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-foreground focus:border-primary-500 bg-surface/30"
                  >
                    <option value="UN">Unidade</option>
                    <option value="CX">Caixa</option>
                    <option value="LT">Litro</option>
                    <option value="KG">Kg</option>
                    <option value="PC">Pacote</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-5 h-5 text-primary-500 rounded border-gray-300 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-foreground">Produto Ativo</span>
                  </label>
                </div>

                {/* Contratado */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isContracted}
                      onChange={(e) => setFormData({ ...formData, isContracted: e.target.checked })}
                      className="w-5 h-5 text-primary-500 rounded border-gray-300 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-foreground">Produto Contratado</span>
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
                  {editingProduct ? 'Atualizar Produto' : 'Cadastrar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
