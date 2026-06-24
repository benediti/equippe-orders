// src/lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Singleton para uso em client components
export const supabase = createClient();

// Tipos dos módulos do sistema
export type NivelAcesso = 'admin' | 'editor' | 'viewer';

export interface ModuloUsuario {
  slug: string;
  nome: string;
  sistema: string;
  icone: string;
  rota_app: string;
  ordem: number;
  nivel: NivelAcesso;
}

export interface PerfilUsuario {
  user_id: string;
  perfil: string;
  nome: string;
  ativo: boolean;
  email: string;
}
