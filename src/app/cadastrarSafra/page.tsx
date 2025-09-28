// app/cadastrarSafra/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import PageTitle from '@/components/PageTitle';
import { Button } from '@/components/ui/button';
import DateFieldModal from '@/components/ui/dateModal';
import AreaListModal from '@/components/ui/areasList/AreaList';
import SelecionarArea from '@/components/ui/selectAreas';
import SafraSteps from './components/SafraSteps';
import type { AreasEntity } from '@/service/areas';

export default function CadastrarSafraPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [etapa, setEtapa] = useState<'safra' | 'plantios'>('safra');

  const producerId = useMemo(() => {
    const q = search?.get('producerId');
    const n = q ? Number(q) : NaN;
    return Number.isFinite(n) ? n : 1; // TODO: integrar com auth/contexto
  }, [search]);

  const [nomeSafra, setNomeSafra] = useState('');
  const [inicio, setInicio] = useState<string>(''); // ISO YYYY-MM-DD
  const [fim, setFim] = useState<string>('');

  const [selecionadas, setSelecionadas] = useState<AreasEntity[]>([]);
  const [abrirModalAreas, setAbrirModalAreas] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const aoConfirmarAreas = (areasNovas: AreasEntity[]) => {
    setSelecionadas((prev) => {
      const map = new Map<number, AreasEntity>();
      [...prev, ...areasNovas].forEach((a) => map.set(a.id, a));
      return [...map.values()];
    });
  };

  const podeSalvar = nomeSafra.trim().length > 0 && !!inicio && !!fim && selecionadas.length > 0;

  const onSalvar = async () => {
    if (!podeSalvar) return;
    try {
      setSalvando(true);
            setEtapa('plantios');

      // TODO: integrar com API de criação de safra
      console.log('[Criar Safra] ->', {
        producerId,
        nome: nomeSafra.trim(),
        dataInicio: inicio,
        dataFim: fim,
        areas: selecionadas.map((a) => a.id),
      });
      // redirecionar ou avançar para próximo passo aqui
      // router.push('/cadastrarSafra/plantios');
      alert('Safra preparada para salvar (veja console). Integre com a API.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col px-4 pb-24 pt-2">
      {/* Botão voltar padrão */}
      <PageTitle title="Nova Safra" href="/gerenciamentoArea" variant="center" />

      <SafraSteps
        active={etapa}
        onChange={setEtapa}
        connectorWidthClass="w-10 sm:w-16"
        offsetXClass="translate-x-1 sm:translate-x-2"  
        className="mb-3"
        title="Adicionar plantio"
      />

      {/* Datas (compacto no mobile) */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="origin-top-left scale-[0.92] sm:scale-100">
          <DateFieldModal
            label="Data Início *"
            value={inicio}
            onChange={(v) => {
              setInicio(v);
              if (fim && v && v > fim) setFim('');
            }}
            required
            max={fim || undefined}
          />
        </div>
        <div className="origin-top-left scale-[0.92] sm:scale-100">
          <DateFieldModal
            label="Data Final *"
            value={fim}
            onChange={setFim}
            required
            min={inicio || undefined}
          />
        </div>
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

      {/* Barra de ações (padrão de botões) */}
      <div className="mt-6 hidden gap-3 sm:flex">
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
          onClick={onSalvar}
          disabled={!podeSalvar || salvando}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60"
        >
          {salvando ? 'Salvando…' : 'Próximo'}
        </Button>
      </div>

      {/* Footer fixo no mobile */}
      <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 border-t bg-white px-4 py-3">
        <div className="flex gap-3">
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
            onClick={onSalvar}
            disabled={!podeSalvar || salvando}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60"
          >
            {salvando ? 'Salvando…' : 'Próximo'}
          </Button>
        </div>
      </div>

      {/* Modal de adicionar áreas */}
      <AreaListModal
        producerId={producerId}
        isOpen={abrirModalAreas}
        onClose={() => setAbrirModalAreas(false)}
        onConfirm={aoConfirmarAreas}
      />
    </main>
  );
}
