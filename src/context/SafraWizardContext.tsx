'use client';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { AreasEntity } from '@/service/areas';

export type DraftPlantio = {
  id: string;
  inicio: string;       // ISO
  fim: string;          // ISO
  produtoNome: string;
  quantidadeKg: number | null;
  areaIds: number[];    // subset das áreas da safra
};

export type DraftSafra = {
  nome: string;
  inicio: string;       // ISO
  fim: string;          // ISO
  areas: AreasEntity[]; // selecionadas na 1ª tela
  plantios: DraftPlantio[];
};

const empty: DraftSafra = { nome: '', inicio: '', fim: '', areas: [], plantios: [] };

type Ctx = {
  draft: DraftSafra;
  setBase: (p: { nome: string; inicio: string; fim: string }) => void;
  setAreas: (areas: AreasEntity[]) => void;
  addPlantio: (p: DraftPlantio) => void;
  removePlantio: (id: string) => void;
  reset: () => void;
};

const WizardCtx = createContext<Ctx | null>(null);

export function SafraWizardProvider({ children }: { children: React.ReactNode }) {
  // carrega do sessionStorage (evita perder no dev)
  const [draft, setDraft] = useState<DraftSafra>(() => {
    if (typeof window === 'undefined') return empty;
    try {
      const raw = sessionStorage.getItem('safraDraft');
      return raw ? (JSON.parse(raw) as DraftSafra) : empty;
    } catch {
      return empty;
    }
  });

  // persiste a cada alteração
  useEffect(() => {
    try {
      sessionStorage.setItem('safraDraft', JSON.stringify(draft));
    } catch {}
  }, [draft]);

  const value = useMemo<Ctx>(() => ({
    draft,
    setBase: (p) => setDraft((d) => ({ ...d, ...p })),
    setAreas: (areas) => setDraft((d) => ({ ...d, areas })),
    addPlantio: (p) => setDraft((d) => ({ ...d, plantios: [...d.plantios, p] })),
    removePlantio: (id) => setDraft((d) => ({ ...d, plantios: d.plantios.filter(x => x.id !== id) })),
    reset: () => setDraft(empty),
  }), [draft]);

  return <WizardCtx.Provider value={value}>{children}</WizardCtx.Provider>;
}

export function useSafraWizard() {
  const ctx = useContext(WizardCtx);
  if (!ctx) throw new Error('useSafraWizard precisa estar dentro do SafraWizardProvider');
  return ctx;
}
