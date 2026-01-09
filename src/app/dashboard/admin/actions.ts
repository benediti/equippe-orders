
// @/app/dashboard/admin/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { adminAuth } from '@/lib/firebase-admin';

export async function deleteClient(id: string) {
  try {
    await deleteDoc(doc(db, 'clients', id));
    revalidatePath('/dashboard/admin/clients');
    return { success: true, message: 'Cliente excluído com sucesso!' };
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    return { success: false, message: 'Erro ao excluir cliente.' };
  }
}

export async function deleteUser(uid: string) {
  try {
    // Excluir do Firebase Authentication
    await adminAuth.deleteUser(uid);
    // Excluir do Firestore
    await deleteDoc(doc(db, 'users', uid));
    revalidatePath('/dashboard/admin/users');
    return { success: true, message: 'Usuário excluído com sucesso!' };
  } catch (error: any) {
    console.error('Erro ao excluir usuário:', error);
     // Handle cases where the user may have been deleted from Auth but not Firestore
     if (error.code === 'auth/user-not-found') {
        try {
            await deleteDoc(doc(db, 'users', uid));
            revalidatePath('/dashboard/admin/users');
            return { success: true, message: 'Usuário não encontrado na autenticação, registro no Firestore removido.' };
        } catch (dbError) {
            console.error('Erro ao excluir usuário do aFirestore após falha na autenticação:', dbError);
            return { success: false, message: 'Erro ao excluir usuário.' };
        }
    }
    return { success: false, message: 'Erro ao excluir usuário.' };
  }
}
