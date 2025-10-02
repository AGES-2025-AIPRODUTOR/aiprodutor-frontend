/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import Loading from '@/components/Loading';
import {
  getAllAreas,
  getAllIrrigationTypes,
  getAllSoilTypes,
  type AreasEntity,
} from '@/service/areas';
import AreaCardList from './AreaCardList';
import PolygonMini from '@/components/PolygonMini';

type AreaListModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selected: AreasEntity[]) => void;

  /** Modo A: lista pronta de áreas (não faz fetch) */
  areas?: AreasEntity[];

  /** Modo B: busca áreas pelo produtor (se `areas` não vier) */
  producerId?: number;

  /** Ocultar estas áreas da lista (ex.: já selecionadas) */
  excludeIds?: number[];
};

// helper: formata área (m²/ha)
function formatArea(raw: unknown) {
  const val = Number(raw);
  if (!Number.isFinite(val) || val <= 0) return '—';
  if (val >= 10_000) {
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(val / 10_000) + ' ha';
  }
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(val) + ' m²';
}

export default function AreaListModal({
  isOpen,
  onClose,
  onConfirm,
  areas: presetAreas,
  producerId,
  excludeIds = [],
}: AreaListModalProps) {
  const [areas, setAreas] = useState<AreasEntity[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [soilMap, setSoilMap] = useState<Record<number, string>>({});
  const [irrMap, setIrrMap] = useState<Record<number, string>>({});

  // chave estável pra evitar loops quando excludeIds muda por referência
  const excludeKey = useMemo(
    () => (excludeIds.length ? [...excludeIds].sort((a, b) => a - b).join(',') : ''),
    [excludeIds]
  );

  useEffect(() => {
    if (!isOpen) return;

    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);

      // carrega domínios
      const [soilRes, irrRes] = await Promise.all([getAllSoilTypes(), getAllIrrigationTypes()]);
      if (!alive) return;

      if (soilRes.isSuccess && soilRes.response) {
        const map = Object.fromEntries((soilRes.response as any[]).map((s: any) => [s.id, s.name]));
        setSoilMap(map);
      }
      if (irrRes.isSuccess && irrRes.response) {
        const map = Object.fromEntries((irrRes.response as any[]).map((i: any) => [i.id, i.name]));
        setIrrMap(map);
      }

      // modo A: usa lista pronta
      if (presetAreas && Array.isArray(presetAreas)) {
        const excl = new Set(excludeIds);
        setAreas(presetAreas.filter((a) => !excl.has(a.id)));
        setSelectedIds([]);
        setLoading(false);
        return;
      }

      // modo B: busca por produtor
      const areasRes = await getAllAreas(producerId ?? 0);
      if (!alive) return;

      if (areasRes.isSuccess && areasRes.response) {
        const excl = new Set(excludeIds);
        setAreas((areasRes.response as AreasEntity[]).filter((a) => !excl.has(a.id)));
        setSelectedIds([]);
        setError(null);
      } else {
        setAreas([]);
        setSelectedIds([]);
        setError(areasRes.errorMessage || 'Erro ao carregar áreas');
      }

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [isOpen, producerId, presetAreas, excludeKey]);

  const toggleSelection = (id: number, checked: boolean) =>
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((i) => i !== id)));

  const allChecked = areas.length > 0 && selectedIds.length === areas.length;
  const someChecked = selectedIds.length > 0 && selectedIds.length < areas.length;

  const toggleAll = () => {
    if (allChecked) setSelectedIds([]);
    else setSelectedIds(areas.map((a) => a.id));
  };

  const handleConfirm = () => {
    onConfirm(areas.filter((a) => selectedIds.includes(a.id)));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-background w-[95vw] max-w-xl h-[90vh] rounded-lg shadow-lg p-6 flex flex-col">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold">Selecione as áreas desejadas</h2>

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
        </div>

        <div className="flex-1 overflow-y-auto mt-4 flex flex-col gap-3">
          {loading && <Loading label="Carregando áreas..." center />}
          {error && <p className="text-red-600">{error}</p>}

          {!loading &&
            !error &&
            areas.map((area) => (
              <div key={area.id} className="flex items-center justify-between p-3 border rounded-lg shadow-md text-gray-600 text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-[44px] h-[44px] flex items-center justify-center">
                    {area.polygon?.coordinates?.length ? (
                      <PolygonMini
                        polygon={area.polygon as any}
                        size={40}
                        padding={4}
                        stroke="#4ade80"
                        fill="#a7f3d0"
                        strokeWidth={2}
                        frameStroke="#6C6A6D"
                        frameStrokeWidth={1}
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0">
                    <h1 className="font-bold text-base truncate">{area.name}</h1>
                    <p className="truncate">Tipo de solo: {area.soilTypeId ? soilMap[area.soilTypeId] ?? `Solo #${area.soilTypeId}` : 'Não definido'}</p>
                    <p className="truncate">Tipo de irrigação: {area.irrigationTypeId ? irrMap[area.irrigationTypeId] ?? `Irrigação #${area.irrigationTypeId}` : 'Não definido'}</p>
                    <p className="truncate">Tamanho: {formatArea((area as any).areaM2)}</p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={selectedIds.includes(area.id)}
                  onChange={(e) => toggleSelection(area.id, e.target.checked)}
                  className="w-6 h-6 accent-green-600 cursor-pointer flex-shrink-0 ml-3"
                />
              </div>
            ))}
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60"
            disabled={selectedIds.length === 0}
          >
            Concluir
          </Button>
        </div>
      </div>
    </div>
  );
}
