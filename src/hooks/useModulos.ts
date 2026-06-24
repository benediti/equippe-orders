// src/hooks/useModulos.ts
// Hook que retorna os módulos disponíveis para o usuário logado
'use client';
import { useEffect, useState } from 'react';
import { supabase, type ModuloUsuario } from '@/lib/supabase';

export function useModulos() {
  const [modulos, setModulos] = useState<ModuloUsuario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchModulos() {
      const { data, error } = await supabase
        .from('meus_modulos')
        .select('*');

      if (!error && data) {
        setModulos(data as ModuloUsuario[]);
      }
      setLoading(false);
    }

    fetchModulos();
  }, []);

  const temAcesso = (slug: string, nivelMinimo: 'viewer' | 'editor' | 'admin' = 'viewer') => {
    const modulo = modulos.find(m => m.slug === slug);
    if (!modulo) return false;
    const hierarquia = { viewer: 0, editor: 1, admin: 2 };
    return hierarquia[modulo.nivel] >= hierarquia[nivelMinimo];
  };

  const modulosPorSistema = (sistema: string) =>
    modulos.filter(m => m.sistema === sistema);

  return { modulos, loading, temAcesso, modulosPorSistema };
}
