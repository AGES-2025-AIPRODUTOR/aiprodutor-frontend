/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import type { AreasEntity } from '@/service/areas';

export type DraftPlantio = {
  id: string;
  inicio: string;
  fim: string;
  quantidadePlantadaKg: number | null;
  name?: string;
  productId: number;
};
export type DraftSafra = {
  nome: string;
  inicio: string;
  fim: string;
  areas: AreasEntity[];
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
  const [draft, setDraft] = useState<DraftSafra>(() => {
    if (typeof window === 'undefined') return empty;
    try {
      const raw = sessionStorage.getItem('safraDraft');
      if (!raw) return empty;
      const parsed = JSON.parse(raw) as any;

      if (parsed?.plantios?.length) {
        parsed.plantios = parsed.plantios.map((p: any) => ({
          id: p.id,
          inicio: p.inicio,
          fim: p.fim,
          quantidadePlantadaKg: p.quantidadePlantadaKg ?? null,
          productId: typeof p.productId === 'number' ? p.productId : 0,
        }));
      }
      return {
        nome: parsed?.nome ?? '',
        inicio: parsed?.inicio ?? '',
        fim: parsed?.fim ?? '',
        areas: parsed?.areas ?? [],
        plantios: parsed?.plantios ?? [],
      } as DraftSafra;
    } catch {
      return empty;
    }
  });

  // persistência
  useEffect(() => {
    try {
      sessionStorage.setItem('safraDraft', JSON.stringify(draft));
    } catch {}
  }, [draft]);

  /** ---- funções rasas com useCallback (sem nesting) ---- */
  const setBase = useCallback((p: { nome: string; inicio: string; fim: string }) => {
    setDraft((d) => ({ ...d, ...p }));
  }, []);

  const setAreas = useCallback((areas: AreasEntity[]) => {
    setDraft((d) => ({ ...d, areas }));
  }, []);

  const addPlantio = useCallback((p: DraftPlantio) => {
    setDraft((d) => ({ ...d, plantios: [...d.plantios, p] }));
  }, []);

  const removePlantio = useCallback((id: string) => {
    setDraft((d) => {
      const plantios = d.plantios.filter((x) => x.id !== id);
      return { ...d, plantios };
    });
  }, []);

  const reset = useCallback(() => setDraft(empty), []);

  const value = useMemo<Ctx>(() => ({
    draft, setBase, setAreas, addPlantio, removePlantio, reset,
  }), [draft, setBase, setAreas, addPlantio, removePlantio, reset]);

  return <WizardCtx.Provider value={value}>{children}</WizardCtx.Provider>;
}

export function useSafraWizard() {
  const ctx = useContext(WizardCtx);
  if (!ctx) throw new Error('useSafraWizard precisa estar dentro do SafraWizardProvider');
  return ctx;
}
