// src/lib/types.ts
export type Role = 'admin' | 'supervisor' | 'approver' | 'purchasing';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
}

export interface Product {
  id: string;
  name: string;
  sku: string; // Código do produto (opcional)
  unit: string; // ex: Litro, Caixa, Unidade
  stock: number;
  active: boolean;
}

export interface Client {
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

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  approvedQuantity?: number;
}

export interface Order {
  id: string;
  supervisorId: string;
  supervisorName: string;
  clientId: string;
  clientName: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  products: OrderItem[];
  createdAt: any; // Firestore Timestamp
}