/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { AreasEntity } from '@/service/areas';

type Props = {
  /** Lista de áreas permitidas (as da safra) */
  allowed: AreasEntity[];
  /** Áreas já selecionadas quando o modal abre */
  already?: AreasEntity[];
  /** Controla exibição; se preferir, pode omitir e renderizar condicionalmente no pai */
  isOpen?: boolean;
  /** Confirma seleção */
  onConfirm: (areas: AreasEntity[]) => void;
  /** Fecha modal sem salvar */
  onClose: () => void;
  /** Título opcional */
  title?: string;
};

export default function PickAreasModal({
  allowed,
  already = [],
  isOpen = true,
  onConfirm,
  onClose,
  title = 'Selecione áreas da safra',
}: Props) {
  // Se usar isOpen controlado, evita render sem necessidade
  
  const initial = useMemo(() => new Set(already.map((a) => a.id)), [already]);
  const [ids, setIds] = useState<Set<number>>(initial);
  
  if (!isOpen) return null;
  const toggle = (id: number) =>
    setIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const allChecked = ids.size > 0 && ids.size === allowed.length;
  const someChecked = ids.size > 0 && ids.size < allowed.length;

  const toggleAll = () =>
    setIds((prev) => {
      if (prev.size === allowed.length) return new Set<number>(); // limpa tudo
      return new Set(allowed.map((a) => a.id)); // marca tudo
    });

  const handleConfirm = () => {
    const picked = allowed.filter((a) => ids.has(a.id));
    onConfirm(picked);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
        <div className="mb-3 flex items-start justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="mb-2 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={allChecked}
              ref={(el) => {
                if (el) el.indeterminate = someChecked;
              }}
              onChange={toggleAll}
              className="h-4 w-4 accent-green-600"
            />
            {allChecked ? 'Desmarcar todas' : 'Selecionar todas'}
          </label>

          <button
            type="button"
            onClick={() => setIds(new Set<number>())}
            className="text-xs text-gray-500 hover:underline"
          >
            Limpar
          </button>
        </div>

        <div className="mt-2 max-h-[50vh] space-y-2 overflow-y-auto">
          {allowed.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma área disponível.</p>
          ) : (
            allowed.map((a) => (
              <label key={a.id} className="flex items-center gap-2 rounded border p-2">
                <input
                  type="checkbox"
                  checked={ids.has(a.id)}
                  onChange={() => toggle(a.id)}
                  className="h-4 w-4 accent-green-600"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.name}</p>
                  {'areaM2' in a && a.areaM2 && (
                    <p className="truncate text-xs text-gray-500">{String((a as any).areaM2)} m²</p>
                  )}
                </div>
              </label>
            ))
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={handleConfirm}
            disabled={ids.size === 0}
          >
            Concluir
          </Button>
        </div>
      </div>
    </div>
  );
}
