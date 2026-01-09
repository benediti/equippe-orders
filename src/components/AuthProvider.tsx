// src/components/AuthProvider.tsx
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserProfile } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data();

            // --- CORREÇÃO DE COMPATIBILIDADE ---
            // Aqui tratamos os dados antigos (ADMIN maiúsculo, campo 'name')
            const roleNormalizada = data.role ? data.role.toLowerCase() : 'supervisor';
            const nomeNormalizado = data.name || data.displayName || firebaseUser.displayName || 'Usuário';

            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: nomeNormalizado,
              role: roleNormalizada // Transforma 'ADMIN' em 'admin'
            });
          } else {
            // Usuário não tem documento no Firestore - criar um com role padrão 'supervisor'
            console.log("Usuário sem documento no Firestore. Criando documento automático...");

            const newUserData = {
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
              role: 'supervisor' // Role padrão para novos usuários
            };

            await setDoc(userDocRef, newUserData);

            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: newUserData.displayName,
              role: 'supervisor'
            });
          }
        } catch (error) {
          console.error("Erro ao buscar/criar perfil:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}