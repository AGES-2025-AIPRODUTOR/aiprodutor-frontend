/* eslint-disable @typescript-eslint/no-explicit-any */
// app/cadastrarSafra/plantiosEditar/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import PageTitle from '@/components/PageTitle';
import { Button } from '@/components/ui/button';
import DateFieldModal from '@/components/ui/dateModal';
import SelecionarArea from '@/app/cadastrarSafra/components/selectAreas';
import AreaListModal from '@/app/cadastrarSafra/components/areasList/AreaList'; // << mesmo modal do cadastro
import { Input } from '@/components/ui/input';

import type { AreasEntity } from '@/service/areas';
import { getSafraById } from '@/service/safras';

import { getPlantioById, updatePlantio, type PlantioUpdate } from '@/service/plantios';

// util: "12,3 kg" -> 12.3
function parseKg(value: string): number | null {
  const n = value
    .replace(/\s*kg\s*$/i, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();
  const v = parseFloat(n);
  return Number.isFinite(v) ? v : null;
}

export default function EditarPlantioPage() {
  const router = useRouter();

  // /cadastrarSafra/plantiosEditar?safraId=1&plantioId=101
  const search = useSearchParams();
  const sid = useMemo(() => {
    const q = search.get('safraId');
    const n = q ? Number(q) : NaN;
    return Number.isFinite(n) ? n : 1;
  }, [search]);
  const pid = useMemo(() => {
    const q = search.get('plantioId');
    const n = q ? Number(q) : NaN;
    return Number.isFinite(n) ? n : 101;
  }, [search]);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [origProductId, setOrigProductId] = useState<number | null>(null);
  const [origVarietyId, setOrigVarietyId] = useState<number | null>(null);
  const [origQuantityHarvested, setOrigQuantityHarvested] = useState<number | null>(null);
  const [inicio, setInicio] = useState(''); // plantingDate
  const [fim, setFim] = useState(''); // expectedHarvestDate
  const [produtoNome, setProdutoNome] = useState(''); // name
  const [qtdTxt, setQtdTxt] = useState(''); // quantityPlanted (string com " kg")
  const [selecionadas, setSelecionadas] = useState<AreasEntity[]>([]);
  const [allowedAreas, setAllowedAreas] = useState<AreasEntity[]>([]);
  const [abrirAreas, setAbrirAreas] = useState(false);

  // carrega safra (para restringir áreas) + plantio
  useEffect(() => {
    let cancel = false;

    (async () => {
      const [safraRes, plantioRes] = await Promise.all([getSafraById(sid), getPlantioById(pid)]);
      if (cancel) return;

      if (!safraRes.isSuccess || !safraRes.response) {
        setErro(safraRes.errorMessage || 'Erro ao carregar safra');
        setLoading(false);
        return;
      }
      if (!plantioRes.isSuccess || !plantioRes.response) {
        setErro(plantioRes.errorMessage || 'Erro ao carregar plantio');
        setLoading(false);
        return;
      }

      const s = safraRes.response;
      const p = plantioRes.response;

      setAllowedAreas(s.areas || []);
      setInicio(p.plantingDate?.slice(0, 10) ?? '');
      setFim(p.expectedHarvestDate ? p.expectedHarvestDate.slice(0, 10) : '');
      setProdutoNome(p.name || '');
      setQtdTxt(
        p.quantityPlanted != null && Number.isFinite(p.quantityPlanted)
          ? `${p.quantityPlanted} kg`
          : ''
      );
      setOrigProductId(p.productId ?? null);
      setOrigVarietyId(p.varietyId ?? null);
      setOrigQuantityHarvested(
        // se o DTO tiver, preserve; se não existir no back, pode deixar null
        (p as any).quantityHarvested ?? null
      );

      // API retorna p.areas (objetos). Mantemos apenas as que pertencem à safra:
      const idsSelecionadas = new Set((p.areas ?? []).map((a: { id: any }) => a.id));
      setSelecionadas((s.areas || []).filter((a: AreasEntity) => idsSelecionadas.has(a.id)));

      setLoading(false);
    })();

    return () => {
      cancel = true;
    };
  }, [sid, pid]);

  const podeSalvar =
    !!inicio &&
    !!fim &&
    produtoNome.trim().length > 0 &&
    parseKg(qtdTxt) !== null &&
    selecionadas.length > 0;

  const onSalvar = async () => {
    if (!podeSalvar) return;

    const body: PlantioUpdate = {
      harvestId: sid, // <-- ADICIONE
      areaId: selecionadas[0]?.id,

      name: produtoNome.trim(),
      plantingDate: inicio,
      expectedHarvestDate: fim || null,
      quantityPlanted: parseKg(qtdTxt) ?? 0,

      // preserve o que veio
      productId: origProductId,
      varietyId: origVarietyId,
      quantityHarvested: origQuantityHarvested,
    };

    const { isSuccess, errorMessage } = await updatePlantio(pid, body);
    if (isSuccess) {
      router.push(`/cadastrarSafra/safraEditar?safraId=${sid}`);
    } else {
      alert(errorMessage || 'Falha ao salvar');
    }
  };

  if (loading) return <main className="p-6">Carregando…</main>;
  if (erro) return <main className="p-6 text-red-600">{erro}</main>;

  return (
    <main className="mx-auto flex w-full max-w-md flex-col px-4 pb-24 pt-2">
      <PageTitle
        title="Editar Plantio"
        href={`/cadastrarSafra/safraEditar?safraId=${sid}`}
        variant="center"
      />

      {/* Datas */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DateFieldModal
          label="Data Início"
          value={inicio}
          onChange={(v) => {
            setInicio(v);
            if (fim && v && v > fim) setFim('');
          }}
          required
          max={fim || undefined}
        />
        <DateFieldModal
          label="Previsão Final"
          value={fim}
          onChange={setFim}
          required
          min={inicio || undefined}
        />
      </div>

      {/* Nome do plantio */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">Nome do Plantio *</label>
        <input
          value={produtoNome}
          onChange={(e) => setProdutoNome(e.target.value)}
          placeholder="Ex.: Plantio de tomate"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Quantidade plantada */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Quantidade Plantada *
        </label>
        <Input unit="kg" value={qtdTxt} onChange={(e) => setQtdTxt(e.target.value)} />
      </div>

      {/* Áreas (apenas as da safra) */}
      <div className="mb-2">
        <SelecionarArea
          areas={selecionadas}
          onChange={setSelecionadas}
          onAddClick={() => setAbrirAreas(true)}
        />
      </div>

      {/* Modal de áreas — mesmo do cadastro de safra */}
      <AreaListModal
        isOpen={abrirAreas}
        onClose={() => setAbrirAreas(false)}
        onConfirm={(picked) => {
          // mantém somente áreas da safra (por segurança)
          const allowed = new Set(allowedAreas.map((a) => a.id));
          const filtradas = picked.filter((a) => allowed.has(a.id));
          setSelecionadas(filtradas);
          setAbrirAreas(false);
        }}
        areas={allowedAreas} // usa lista pronta (sem fetch)
        excludeIds={[]} // no editar, mostramos todas as da safra
      />

      {/* Ações */}
      <div className="mt-6 flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.push(`/cadastrarSafra/safraEditar?safraId=${sid}`)}
        >
          Cancelar
        </Button>
        <Button
          className="flex-1 bg-green-600 hover:bg-green-700"
          onClick={onSalvar}
          disabled={!podeSalvar}
        >
          Editar
        </Button>
      </div>
    </main>
  );
}
