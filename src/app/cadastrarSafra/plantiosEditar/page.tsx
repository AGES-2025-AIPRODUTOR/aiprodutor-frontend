/* eslint-disable @typescript-eslint/no-explicit-any */
// app/cadastrarSafra/plantiosEditar/page.tsx
'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import PageTitle from '@/components/PageTitle';
import { Button } from '@/components/ui/button';
import DateFieldModal from '@/components/ui/dateModal';
import SelecionarArea from '@/app/cadastrarSafra/components/selectAreas';
import AreaListModal from '@/app/cadastrarSafra/components/areasList/AreaList';
import { Input } from '@/components/ui/input';

import type { AreasEntity } from '@/service/areas';
import { getSafraById } from '@/service/safras';

import { getPlantioById, updatePlantio, type PlantioUpdate } from '@/service/plantios';
import { toast } from 'sonner';

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

function EditarPlantioContent() {
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

  // campos do formulário (novo contrato)
  const [inicio, setInicio] = useState('');              // plantingDate (YYYY-MM-DD)
  const [fimPlantio, setFimPlantio] = useState('');      // plantingEndDate (YYYY-MM-DD) opcional
  const [fimColheita, setFimColheita] = useState('');    // expectedHarvestDate (YYYY-MM-DD) opcional
  const [nomePlantio, setNomePlantio] = useState('');    // name
  const [qtdTxt, setQtdTxt] = useState('');              // quantityPlanted (string com " kg")
  const [qtdColhidaTxt, setQtdColhidaTxt] = useState(''); // quantityHarvested (string com " kg")
  const [produtividadeTxt, setProdutividadeTxt] = useState(''); // expectedYield (number)

  // manter product/variety do back (se não editar aqui)
  const [origProductId, setOrigProductId] = useState<number | null>(null);
  const [origVarietyId, setOrigVarietyId] = useState<number | null>(null);

  // Áreas apenas para referência/UX (não vai no PATCH novo)
  const [selecionadas, setSelecionadas] = useState<AreasEntity[]>([]);
  const [allowedAreas, setAllowedAreas] = useState<AreasEntity[]>([]);
  const [abrirAreas, setAbrirAreas] = useState(false);

  // carrega safra (para restringir visualmente as áreas) + plantio
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
      setFimPlantio(p.plantingEndDate ? p.plantingEndDate.slice(0, 10) : '');
      setFimColheita(p.expectedHarvestDate ? p.expectedHarvestDate.slice(0, 10) : '');
      setNomePlantio(p.name || '');

      setQtdTxt(
        p.quantityPlanted != null && Number.isFinite(p.quantityPlanted)
          ? `${p.quantityPlanted} kg`
          : ''
      );
      setQtdColhidaTxt(
        (p as any).quantityHarvested != null && Number.isFinite((p as any).quantityHarvested)
          ? `${(p as any).quantityHarvested} kg`
          : ''
      );
      setProdutividadeTxt(
        (p as any).expectedYield != null && Number.isFinite((p as any).expectedYield)
          ? String((p as any).expectedYield)
          : ''
      );

      setOrigProductId(p.productId ?? null);
      setOrigVarietyId(p.varietyId ?? null);

      // API pode retornar p.areas; mostramos apenas as que pertencem à safra
      const idsSelecionadas = new Set((p as any).areas?.map((a: { id: number }) => a.id) ?? []);
      setSelecionadas((s.areas || []).filter((a: AreasEntity) => idsSelecionadas.has(a.id)));

      setLoading(false);
    })();

    return () => {
      cancel = true;
    };
  }, [sid, pid]);

  // validações mínimas (contrato novo requer: name, plantingDate, harvestId; os demais são opcionais)
  const podeSalvar =
    !!inicio &&
    nomePlantio.trim().length > 0 &&
    parseKg(qtdTxt) !== null;

  const onSalvar = async () => {
    if (!podeSalvar) return;

    // monta payload conforme novo contrato
    const body: PlantioUpdate = {
      harvestId: sid,                      // obrigatório
      name: nomePlantio.trim(),            // obrigatório
      plantingDate: inicio,                // "YYYY-MM-DD" (service converte p/ ISO Z)
      plantingEndDate: fimPlantio || null, // opcional
      expectedHarvestDate: fimColheita || null, // opcional
      quantityPlanted: parseKg(qtdTxt) ?? 0,
      quantityHarvested: parseKg(qtdColhidaTxt) ?? null,
      productId: origProductId,            // preservado (se não edita aqui)
      varietyId: origVarietyId,            // preservado
      expectedYield: produtividadeTxt ? Number(produtividadeTxt) : null,
    };

    const { isSuccess, errorMessage } = await updatePlantio(pid, body);
    if (isSuccess) {
      router.push(`/cadastrarSafra/safraEditar?safraId=${sid}`);
    } else {
      toast.error(errorMessage || 'Falha ao salvar');
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
          label="Data Início do Plantio"
          value={inicio}
          onChange={(v) => {
            setInicio(v);
            if (fimPlantio && v && v > fimPlantio) setFimPlantio('');
            if (fimColheita && v && v > fimColheita) setFimColheita('');
          }}
          required
          max={(fimPlantio || fimColheita) || undefined}
        />
        <DateFieldModal
          label="Término do Plantio (opcional)"
          value={fimPlantio}
          onChange={(v) => {
            setFimPlantio(v);
            if (v && fimColheita && v > fimColheita) setFimColheita('');
          }}
          min={inicio || undefined}
        />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DateFieldModal
          label="Previsão de Colheita (opcional)"
          value={fimColheita}
          onChange={setFimColheita}
          min={(fimPlantio || inicio) || undefined}
        />
      </div>

      {/* Nome do plantio */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">Nome do Plantio *</label>
        <Input
          value={nomePlantio}
          onChange={(e) => setNomePlantio(e.target.value)}
          placeholder="Ex.: Plantio de tomate"
        />
      </div>

      {/* Quantidades */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Quantidade Plantada * 
        </label>
        <Input unit="kg" value={qtdTxt} onChange={(e) => setQtdTxt(e.target.value)} />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Quantidade Colhida (opcional)
          </label>
          <Input unit="kg" value={qtdColhidaTxt} onChange={(e) => setQtdColhidaTxt(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Produtividade Esperada (número)
          </label>
          <Input
            type="number"
            value={produtividadeTxt}
            onChange={(e) => setProdutividadeTxt(e.target.value)}
            placeholder="ex.: 800000"
          />
        </div>
      </div>

      {/* Áreas (apenas referência visual – não é enviado no PATCH novo) */}
      <div className="mb-2">
        <SelecionarArea
          areas={selecionadas}
          onChange={setSelecionadas}
          onAddClick={() => setAbrirAreas(true)}
        />
      </div>

      {/* Modal de áreas — mesmo do cadastro de safra (não afeta o PATCH, apenas ajuda o usuário) */}
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
        areas={allowedAreas}        // usa lista pronta (sem fetch)
        excludeIds={[]}             // no editar, mostramos todas as da safra
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
          className="flex-1"
          onClick={onSalvar}
          disabled={!podeSalvar}
        >
          Salvar
        </Button>
      </div>
    </main>
  );
}

export default function EditarPlantioPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Carregando...</div>}>
      <EditarPlantioContent />
    </Suspense>
  );
}
