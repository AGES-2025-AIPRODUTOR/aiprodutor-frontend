/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { AreasEntity } from '@/service/areas';

export type DraftPlantio = {
  id: string;
  inicio: string;                  // "YYYY-MM-DD"
  fim: string;                     // "YYYY-MM-DD"
  quantidadePlantadaKg: number | null;
  areaIds: number[];

  // NEW
  productId: number;
  varietyId: number;
};

export type DraftSafra = {
  nome: string;
  inicio: string;       // "YYYY-MM-DD"
  fim: string;          // "YYYY-MM-DD"
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
  // carrega do sessionStorage (com MIGRAÇÃO do shape antigo)
  const [draft, setDraft] = useState<DraftSafra>(() => {
    if (typeof window === 'undefined') return empty;
    try {
      const raw = sessionStorage.getItem('safraDraft');
      if (!raw) return empty;
      const parsed = JSON.parse(raw) as any;

      // migração leve: se plantio antigo tinha 'produtoNome' e não tinha ids
      if (parsed?.plantios?.length) {
        parsed.plantios = parsed.plantios.map((p: any) => ({
          id: p.id,
          inicio: p.inicio,
          fim: p.fim,
          quantidadePlantadaKg: p.quantidadePlantadaKg ?? null,
          areaIds: p.areaIds ?? [],
          productId: typeof p.productId === 'number' ? p.productId : 0,  // 0 = precisa escolher
          varietyId: typeof p.varietyId === 'number' ? p.varietyId : 0,
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
