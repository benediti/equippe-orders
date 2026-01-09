// src/lib/seed-data.ts
// Script para popular o Firestore com dados iniciais
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export async function seedClients() {
  const clientsRef = collection(db, 'clients');
  const snapshot = await getDocs(clientsRef);

  // Só adiciona se não houver clientes
  if (snapshot.empty) {
    const clients = [
      { name: 'Setor Administrativo', code: 'ADM-01' },
      { name: 'Setor de Limpeza', code: 'LMP-01' },
      { name: 'Setor de Manutenção', code: 'MNT-01' },
      { name: 'Cozinha/Refeitório', code: 'COZ-01' },
      { name: 'Recepção', code: 'RCP-01' }
    ];

    for (const client of clients) {
      await addDoc(clientsRef, client);
    }

    console.log('Clientes adicionados com sucesso!');
    return true;
  }

  console.log('Clientes já existem no banco de dados');
  return false;
}

export async function seedProducts() {
  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);

  // Só adiciona se não houver produtos
  if (snapshot.empty) {
    const products = [
      { name: 'Detergente Neutro 5L', unit: 'UN', sku: 'LMP-001', stock: 50, active: true },
      { name: 'Desinfetante 2L', unit: 'UN', sku: 'LMP-002', stock: 30, active: true },
      { name: 'Álcool Gel 500ml', unit: 'UN', sku: 'LMP-003', stock: 100, active: true },
      { name: 'Papel Toalha (pacote)', unit: 'CX', sku: 'LMP-004', stock: 25, active: true },
      { name: 'Sabonete Líquido 1L', unit: 'UN', sku: 'LMP-005', stock: 40, active: true },
      { name: 'Saco de Lixo 100L', unit: 'CX', sku: 'LMP-006', stock: 20, active: true },
      { name: 'Luva de Látex (par)', unit: 'CX', sku: 'EPI-001', stock: 150, active: true },
      { name: 'Pano de Limpeza', unit: 'UN', sku: 'LMP-007', stock: 80, active: true }
    ];

    for (const product of products) {
      await addDoc(productsRef, product);
    }

    console.log('Produtos adicionados com sucesso!');
    return true;
  }

  console.log('Produtos já existem no banco de dados');
  return false;
}

export async function seedAllData() {
  try {
    const clientsAdded = await seedClients();
    const productsAdded = await seedProducts();

    return {
      success: true,
      clientsAdded,
      productsAdded
    };
  } catch (error) {
    console.error('Erro ao popular dados:', error);
    return {
      success: false,
      error
    };
  }
}
