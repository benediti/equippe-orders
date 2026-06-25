// src/components/AuthProvider.tsx
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  ativo: boolean;
}

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

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // Busca sessão inicial
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        await loadProfile(session.user.id, session.user.email!, session.user.user_metadata?.full_name);
      } else {
        setUser(null);
        setLoading(false);
      }
    };

    initAuth();

    // Escuta mudanças de sessão
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadProfile(session.user.id, session.user.email!, session.user.user_metadata?.full_name);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (uid: string, email: string, fullName?: string) => {
    try {
      const { data: perfil } = await supabase
        .from('usuarios_perfis')
        .select('perfil, nome, ativo')
        .eq('user_id', uid)
        .single();

      if (perfil) {
        // Mapeia perfil do banco para role do app
        const roleMap: Record<string, string> = {
          ti: 'admin',
          admin: 'admin',
          financeiro: 'approver',
          compras: 'purchasing',
          supervisor: 'supervisor',
          supervisora: 'supervisor',
        };

        setUser({
          uid,
          email,
          displayName: perfil.nome || fullName || email.split('@')[0],
          role: roleMap[perfil.perfil] ?? 'supervisor',
          ativo: perfil.ativo,
        });
      } else {
        // Perfil ainda não criado pelo trigger — aguarda
        setUser(null);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Redireciona para login se não autenticado
  useEffect(() => {
    if (!loading && !user && pathname !== '/login' && pathname !== '/acesso-negado') {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
