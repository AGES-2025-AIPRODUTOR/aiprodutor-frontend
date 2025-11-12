/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { ConfirmDialog } from '../../../components/ui/confirmDialog';
import { Button } from '../../../components/ui/button';
import {
  AreasEntity,
  getAllIrrigationTypes,
  getAllSoilTypes,
  getAllAreas,
  // ⬇️ novo service
  getAreaById,
} from '@/service/areas';
import { getSafraById } from '@/service/safras';
import PolygonMini from '../../../components/PolygonMini';

type SelecionarAreaProps = {
  areas?: AreasEntity[];
  onChange?: (areas: AreasEntity[]) => void;
  onAddClick?: () => void;

  /** Fallbacks de carregamento */
  harvestId?: number;   // tenta carregar áreas da safra
  producerId?: number;  // pode ser usado como 2º fallback
};

type IdName = { id: number; name: string };

export default function SelecionarArea({
  areas = [],
  onChange,
  onAddClick,
  harvestId,
  producerId,
}: SelecionarAreaProps) {
  const [listaAreas, setListaAreas] = useState<AreasEntity[]>([]);
  const [confirmExcluirId, setConfirmExcluirId] = useState<number | null>(null);

  // loading e erro (para fallback automático)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // mapas ID -> nome
  const [soilMap, setSoilMap] = useState<Record<number, string>>({});
  const [irrMap, setIrrMap] = useState<Record<number, string>>({});

  // helper p/ normalizar possíveis estruturas de polygon
  const normalizePolygon = (poly: any) => {
    if (!poly) return null;
    try {
      const p = typeof poly === 'string' ? JSON.parse(poly) : poly;
      if (p?.type === 'MultiPolygon' && Array.isArray(p.coordinates) && p.coordinates.length > 0) {
        // usa o primeiro polígono do multipolígono
        return { type: 'Polygon', coordinates: p.coordinates[0] };
      }
      return p;
    } catch {
      return null;
    }
  };

  // Busca detalhes das áreas faltantes (sem polygon) individualmente
  const enrichAreasById = async (list: AreasEntity[]): Promise<AreasEntity[]> => {
    const missing = list.filter(
      (a) => !a?.polygon || !Array.isArray((a as any).polygon?.coordinates)
    );
    if (missing.length === 0) return list;

    // faz requests em paralelo; tolera falhas (Promise.allSettled)
    const results = await Promise.allSettled(
      missing.map((a) => getAreaById(a.id))
    );

    const byId = new Map<number, AreasEntity>();
    results.forEach((res, idx) => {
      const id = missing[idx].id;
      if (res.status === 'fulfilled' && res.value?.isSuccess && res.value.response) {
        const full = res.value.response as any;
        byId.set(id, {
          ...missing[idx],
          ...full,
          polygon: normalizePolygon(full.polygon) ?? missing[idx].polygon ?? null,
          soilTypeId: missing[idx].soilTypeId ?? full.soilTypeId ?? null,
          irrigationTypeId: missing[idx].irrigationTypeId ?? full.irrigationTypeId ?? null,
          areaM2: (missing[idx] as any).areaM2 ?? (full as any).areaM2 ?? null,
          color: (missing[idx] as any).color ?? (full as any).color ?? null,
          producerId: (missing[idx] as any).producerId ?? (full as any).producerId ?? null,
        });
      }
    });

    // merge final (se não veio, mantém original)
    return list.map((a) => byId.get(a.id) ?? a);
  };

  // carregamento das áreas:
  // 1) se 'areas' vier por props, usa diretamente
  // 2) senão, tenta harvestId -> áreas da safra
  //    2.1) enriquece por ID (getAreaById) se faltarem polygons
  // 3) senão, tenta producerId -> áreas do produtor (e normaliza polygon)
  useEffect(() => {
    let alive = true;

    const load = async () => {
      if (areas && areas.length > 0) {
        setListaAreas(areas);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        if (typeof harvestId === 'number' && Number.isFinite(harvestId) && harvestId > 0) {
          const { isSuccess, response, errorMessage } = await getSafraById(harvestId);
          if (!alive) return;

          if (isSuccess && response) {
            let list = (response.areas || []) as AreasEntity[];

            // ENRIQUECER por ID quando não houver polygon
            if (list.some((a) => !a?.polygon || !Array.isArray((a as any).polygon?.coordinates))) {
              list = await enrichAreasById(list);
              if (!alive) return;
            }

            setListaAreas(list);
            setError(null);
          } else {
            setListaAreas([]);
            setError(errorMessage || 'Erro ao carregar áreas da safra');
          }
        } else if (
          typeof producerId === 'number' &&
          Number.isFinite(producerId) &&
          producerId > 0
        ) {
          const res = await getAllAreas(producerId);
          if (!alive) return;

          if (res.isSuccess && res.response) {
            const list = (res.response as any[]).map((a) => ({
              ...a,
              polygon: normalizePolygon(a.polygon),
            })) as AreasEntity[];
            setListaAreas(list);
            setError(null);
          } else {
            setListaAreas([]);
            setError(res.errorMessage || 'Erro ao carregar áreas do produtor');
          }
        } else {
          setListaAreas([]);
          setError(null);
        }
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [areas, harvestId, producerId]);

  // carrega domínios (solo/irrigação) uma vez
  useEffect(() => {
    let alive = true;
    (async () => {
      const [soilRes, irrRes] = await Promise.all([getAllSoilTypes(), getAllIrrigationTypes()]);
      if (!alive) return;

      if (soilRes.isSuccess && soilRes.response) {
        setSoilMap(Object.fromEntries((soilRes.response as IdName[]).map((s) => [s.id, s.name])));
      }
      if (irrRes.isSuccess && irrRes.response) {
        setIrrMap(Object.fromEntries((irrRes.response as IdName[]).map((i) => [i.id, i.name])));
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const excluirArea = (id: number) => {
    setListaAreas((prev) => {
      const next = prev.filter((a) => a.id !== id);
      onChange?.(next);
      return next;
    });
  };

  const nomeAreaConfirm = useMemo(
    () => (confirmExcluirId ? (listaAreas.find((a) => a.id === confirmExcluirId)?.name ?? '') : ''),
    [confirmExcluirId, listaAreas]
  );

  // helpers de exibição
  const soilNameOf = (area: AreasEntity) =>
    area.soilTypeId ? (soilMap[area.soilTypeId] ?? `ID ${area.soilTypeId}`) : 'Não definido';

  const irrNameOf = (area: AreasEntity) =>
    area.irrigationTypeId
      ? (irrMap[area.irrigationTypeId] ?? `ID ${area.irrigationTypeId}`)
      : 'Não definido';

  return (
    <div className="text-gray-400">
      <div className="m-1 flex items-end justify-between">
        <label>Áreas</label>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-sm border border-green-300 text-green-300 hover:bg-green-50"
          onClick={onAddClick}
        >
          Adicionar Áreas
        </Button>
      </div>

      <div className="relative h-[8rem] w-[90vw] max-w-[600px] overflow-y-auto rounded-md border border-neutral-300 bg-white px-4 py-1">
        {loading ? (
          <div className="text-sm text-gray-400">Carregando áreas…</div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : listaAreas.length === 0 ? (
          <div className="text-sm text-gray-400">
            <span className="mb-1 block">
              Clique em 'Adicionar Áreas' para escolher entre as áreas disponíveis
            </span>
          </div>
        ) : (
          listaAreas.map((area) => (
            <div key={area.id} className="flex w-full items-center border-b border-neutral-200 py-1">
              {/* Nome + metadados */}
              <span className="block w-[60%] truncate" title={area.name}>
                {area.name}
                <span className="block text-xs text-gray-400">
                  Solo: {soilNameOf(area)} · Irrigação: {irrNameOf(area)}
                </span>
              </span>

              {/* Mini polígono */}
              <div className="ml-2 w-[20%]">
                {area.polygon?.coordinates?.length ? (
                  <PolygonMini
                    polygon={area.polygon as any}
                    size={32}
                    padding={4}
                    stroke="#4ade80"
                    fill="#a7f3d0"
                    strokeWidth={2}
                    frameStroke="#6C6A6D"
                    frameStrokeWidth={1}
                  />
                ) : null}
              </div>

              {/* Excluir */}
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto rounded-sm border border-red-600 text-red-600 hover:bg-red-50"
                onClick={() => setConfirmExcluirId(area.id)}
              >
                Excluir
              </Button>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmExcluirId !== null}
        description={`Deseja realmente excluir a área "${nomeAreaConfirm}"?`}
        onConfirm={() => {
          if (confirmExcluirId !== null) excluirArea(confirmExcluirId);
          setConfirmExcluirId(null);
        }}
        onCancel={() => setConfirmExcluirId(null)}
      />
    </div>
  );
}
