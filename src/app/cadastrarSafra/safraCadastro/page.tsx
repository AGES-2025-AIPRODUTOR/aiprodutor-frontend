'use client';

import React, { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import PageTitle from '@/components/PageTitle';
import { Button } from '@/components/ui/button';
import DateFieldModal from '@/components/ui/dateModal';
import AreaListModal from '@/app/cadastrarSafra/components/areasList/AreaList';
import SelecionarArea from '@/app/cadastrarSafra/components/selectAreas';
import type { AreasEntity } from '@/service/areas';
import SafraSteps from '@/app/cadastrarSafra/components/SafraSteps';
import { useSafraWizard } from '@/context/SafraWizardContext';

function CadastrarSafraContent() {
  const router = useRouter();
  const search = useSearchParams();
  const { setBase, setAreas } = useSafraWizard();

  const producerId = useMemo(() => {
    const q = search?.get('producerId');
    const n = q ? Number(q) : NaN;
    return Number.isFinite(n) && n > 0 ? n : 1;
  }, [search]);

  const [nomeSafra, setNomeSafra] = useState('');
  const [inicio, setInicio] = useState<string>(''); // "YYYY-MM-DD"
  const [fim, setFim] = useState<string>(''); // "YYYY-MM-DD"
  const [selecionadas, setSelecionadas] = useState<AreasEntity[]>([]);
  const [abrirModalAreas, setAbrirModalAreas] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // evita duplicar áreas ao confirmar no modal
  const aoConfirmarAreas = (areasNovas: AreasEntity[]) => {
    setSelecionadas((prev) => {
      const map = new Map<number, AreasEntity>();
      [...prev, ...areasNovas].forEach((a) => map.set(a.id, a));
      return [...map.values()];
    });
  };
  const excludeIds = useMemo(() => selecionadas.map((a) => a.id), [selecionadas]);

  // validações mínimas: nome + datas coerentes + ao menos 1 área
  const datasOK = !inicio || !fim ? false : inicio <= fim;
  const podeAvancar =
    nomeSafra.trim().length > 0 &&
    inicio.length > 0 &&
    fim.length > 0 &&
    datasOK &&
    selecionadas.length > 0;

  const onProximo = async () => {
    if (!podeAvancar) return;
    try {
      setSalvando(true);
      // guarda no wizard (consumo pela próxima página / criação)
      setBase({ nome: nomeSafra.trim(), inicio, fim });
      setAreas(selecionadas);
      router.push('/cadastrarSafra/plantiosCadastro');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col px-4 pb-24 pt-2">
      <PageTitle title="Nova Safra" href="/cadastrarSafra" variant="center" />
      <SafraSteps active="safra" title="Adicionar plantio" className="mb-3" />

      {/* Datas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DateFieldModal
          label="Data Início"
          value={inicio}
          onChange={(v) => {
            setInicio(v);
            if (fim && v && v > fim) setFim(''); // garante coerência
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

      {/* Nome */}
      <div className="mb-5">
        <label className="mb-1 block text-sm font-medium text-gray-700">Nome *</label>
        <input
          type="text"
          value={nomeSafra}
          onChange={(e) => setNomeSafra(e.target.value)}
          placeholder="Ex.: Safra de Laranja 25/26"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
        {!datasOK && inicio && fim && (
          <p className="mt-1 text-xs text-red-600">
            A data de início deve ser anterior ou igual à data final.
          </p>
        )}
      </div>

      {/* Áreas */}
      <div className="mb-2">
        <label className="mb-1 block text-sm font-medium text-gray-700">Áreas</label>
        <SelecionarArea
          areas={selecionadas}
          onChange={setSelecionadas}
          onAddClick={() => setAbrirModalAreas(true)}
        />
      </div>

      {/* Ações */}
      <div className="mt-6 flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1 border-green-700 text-green-700"
        >
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={onProximo}
          disabled={!podeAvancar || salvando}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60"
        >
          {salvando ? 'Carregando…' : 'Próximo'}
        </Button>
      </div>

      {/* Modal de adicionar áreas */}
      <AreaListModal
        producerId={producerId}
        isOpen={abrirModalAreas}
        onClose={() => setAbrirModalAreas(false)}
        onConfirm={aoConfirmarAreas}
        excludeIds={excludeIds}
      />
    </main>
  );
}

export default function CadastrarSafraPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Carregando...</div>}>
      <CadastrarSafraContent />
    </Suspense>
  );
}
