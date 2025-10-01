// components/areas/SelecionarArea.tsx
/* eslint-disable react/no-unescaped-entities */
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { ConfirmDialog } from './confirmDialog';
import { AreasEntity, getAllIrrigationTypes, getAllSoilTypes } from '@/service/areas';
import PolygonMini from '../PolygonMini';

type SelecionarAreaProps = {
  areas?: AreasEntity[];
  onChange?: (areas: AreasEntity[]) => void;
  onAddClick?: () => void;
};

type IdName = { id: number; name: string };

export default function SelecionarArea({ areas = [], onChange, onAddClick }: SelecionarAreaProps) {
  const [listaAreas, setListaAreas] = useState<AreasEntity[]>([]);
  const [confirmExcluirId, setConfirmExcluirId] = useState<number | null>(null);

  // mapas ID -> nome
  const [soilMap, setSoilMap] = useState<Record<number, string>>({});
  const [irrMap, setIrrMap] = useState<Record<number, string>>({});

  // carrega áreas iniciais vindas da página
  useEffect(() => setListaAreas(areas), [areas]);

  // carrega domínios (solo/irrigação) uma vez
  useEffect(() => {
    let alive = true;
    (async () => {
      const [soilRes, irrRes] = await Promise.all([getAllSoilTypes(), getAllIrrigationTypes()]);
      if (!alive) return;

      if (soilRes.isSuccess && soilRes.response) {
        setSoilMap(
          Object.fromEntries((soilRes.response as IdName[]).map((s) => [s.id, s.name]))
        );
      }
      if (irrRes.isSuccess && irrRes.response) {
        setIrrMap(
          Object.fromEntries((irrRes.response as IdName[]).map((i) => [i.id, i.name]))
        );
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
    () => (confirmExcluirId ? listaAreas.find((a) => a.id === confirmExcluirId)?.name ?? '' : ''),
    [confirmExcluirId, listaAreas]
  );

  // helpers de exibição
  const soilNameOf = (area: AreasEntity) =>
    area.soilTypeId ? soilMap[area.soilTypeId] ?? `ID ${area.soilTypeId}` : 'Não definido';

  const irrNameOf = (area: AreasEntity) =>
    area.irrigationTypeId
      ? irrMap[area.irrigationTypeId] ?? `ID ${area.irrigationTypeId}`
      : 'Não definido';

  return (
    <div className="text-gray-400">
      <div className="m-1 flex items-end justify-between">
        <label>Áreas</label>
        <button
          className="rounded-sm border border-green-300 p-0.5 text-green-300"
          onClick={onAddClick}
        >
          Adicionar Áreas
        </button>
      </div>

      <div className="relative h-[8rem] w-[90vw] max-w-[600px] overflow-y-auto rounded-md border border-neutral-300 bg-white px-4 py-1">
        {listaAreas.length === 0 ? (
          <div className="text-sm text-gray-400">
            <span className="mb-1 block">
              Clique em 'Adicionar Áreas' para escolher entre as áreas disponíveis
            </span>
          </div>
        ) : (
          listaAreas.map((area) => (
            <div
              key={area.id}
              className="flex w-full items-center border-b border-neutral-200 py-1"
            >
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
                    polygon={area.polygon}
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
              <button
                className="ml-auto rounded-sm border border-red-700 p-0.5 text-red-700"
                onClick={() => setConfirmExcluirId(area.id)}
              >
                Excluir
              </button>
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
