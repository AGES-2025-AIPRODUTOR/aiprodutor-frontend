// app/cadastrarSafra/safraEditar/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import PageTitle from '@/components/PageTitle';
import { Button } from '@/components/ui/button';
import DateFieldModal from '@/components/ui/dateModal';
import SelecionarArea from '@/components/ui/selectAreas';
import AreaListModal from '@/components/ui/areasList/AreaList';

import type { AreasEntity } from '@/service/areas';

/**
 * IMPORTANTE (MOCK):
 * Por enquanto este import aponta para um "service" que usa base em memória (mock).
 * Para DESFAZER O MOCK mais tarde:
 * 1) Abra src/service/safras.ts e substitua as implementações de getSafraById/updateSafra/...
 *    pelas chamadas reais (api.get/api.patch).
 *    – OU –
 * 2) Crie src/service/safras.api.ts com as chamadas reais e troque este import para:
 *    import { getSafraById, updateSafra, deactivatePlantio, type SafraEntity } from '@/service/safras.api';
 */
import { getSafraById, updateSafra, deactivatePlantio, type SafraEntity } from '@/service/safras';

export default function EditarSafraPage() {
  const router = useRouter();

  // ⚠️ Rota fixa + query string: /cadastrarSafra/safraEditar?safraId=1
  const search = useSearchParams();
  const safraId = useMemo(() => {
    const q = search.get('safraId'); // nome do parâmetro na URL
    const n = q ? Number(q) : NaN;
    return Number.isFinite(n) ? n : 1; // fallback para 1 (mock). Remova o fallback quando estiver 100%
  }, [search]);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // estado do formulário
  const [nome, setNome] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [areas, setAreas] = useState<AreasEntity[]>([]);
  const [plantios, setPlantios] = useState<SafraEntity['plantios']>([]);
  const [abrirAreas, setAbrirAreas] = useState(false);

  // carrega safra (mock ou real – depende do service importado acima)
  useEffect(() => {
    let cancel = false;
    setLoading(true);
    getSafraById(safraId).then(({ isSuccess, response, errorMessage }) => {
      if (cancel) return;
      if (!isSuccess || !response) {
        setErro(errorMessage || 'Erro ao carregar safra');
        setLoading(false);
        return;
      }
      setNome(response.nome);
      setInicio(response.inicio.slice(0, 10));
      setFim(response.fim.slice(0, 10));
      setAreas(response.areas || []);
      setPlantios(response.plantios || []);
      setLoading(false);
    });
    return () => { cancel = true; };
  }, [safraId]);

  const podeSalvar = nome.trim() && inicio && fim;

  const onSalvar = async () => {
    if (!podeSalvar) return;
    const body = {
      nome: nome.trim(),
      inicio,
      fim,
      areaIds: areas.map((a) => a.id),
    };

    /**
     * MOCK: updateSafra apenas atualiza o "_db" em memória.
     * PARA API REAL: mantendo a mesma assinatura, basta trocar
     * a implementação no service (ver comentário no topo).
     */
    const { isSuccess, errorMessage } = await updateSafra(safraId, body);
    if (isSuccess) router.back();
    else alert(errorMessage || 'Falha ao salvar');
  };

  const onConfirmAreas = (novas: AreasEntity[]) => {
    setAreas((prev) => {
      const map = new Map<number, AreasEntity>();
      [...prev, ...novas].forEach((a) => map.set(a.id, a));
      return [...map.values()];
    });
  };

  const onDesativarPlantio = async (plantioId: number) => {
    const ok = confirm('Deseja desativar este plantio?');
    if (!ok) return;

    /**
     * MOCK: apenas remove do array em memória.
     * PARA API REAL: trocar a implementação no service.
     */
    const { isSuccess, errorMessage } = await deactivatePlantio(plantioId);
    if (isSuccess) setPlantios((prev) => prev.filter((p) => p.id !== plantioId));
    else alert(errorMessage || 'Erro ao desativar');
  };

  if (loading) return <main className="p-6">Carregando…</main>;
  if (erro) return <main className="p-6 text-red-600">{erro}</main>;

  return (
    <main className="mx-auto flex w-full max-w-md flex-col px-4 pb-24 pt-2">
      <PageTitle title="Editar Safra" href="/gerenciamentoArea" variant="center" />

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
          label="Data Final"
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
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex.: Safra de Laranja 25/26"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Áreas */}
      <div className="mb-2">
        <div className="mb-1 flex items-end justify-between">
          <label className="block text-sm font-medium text-gray-700">Áreas</label>

        </div>
        <SelecionarArea areas={areas} onChange={setAreas} onAddClick={() => setAbrirAreas(true)} />
      </div>

      {/* Linha divisória */}
      <hr className="my-4" />

      {/* Plantios existentes */}
      <div className="space-y-2">
        {plantios.map((p, idx) => (
          <div key={p.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
            <span className="text-sm">Plantio {idx + 1}</span>
            <div className="flex gap-2">
              {/* Rota atual do projeto para editar plantio (fixa + query) */}
              <Link href={`/cadastrarSafra/plantiosEditar?safraId=${safraId}&plantioId=${p.id}`}>
                <Button variant="outline" size="sm">Editar</Button>
              </Link>
              <Button variant="destructive" size="sm" onClick={() => onDesativarPlantio(p.id)}>
                Desativar
              </Button>
            </div>
          </div>
        ))}
        {plantios.length === 0 && <p className="text-sm text-gray-500">Nenhum plantio cadastrado.</p>}
      </div>

      {/* Ações */}
      <div className="mt-6">
        <Button
          className="w-full bg-green-600 hover:bg-green-700"
          onClick={onSalvar}
          disabled={!podeSalvar}
        >
          Salvar
        </Button>
      </div>

      {/* Modal áreas */}
      <AreaListModal
        /**
         * MOCK: pode deixar 0 aqui para testes locais.
         * PARA API REAL: substitua por producerId real vindo de contexto/autenticação.
         */
        producerId={0}
        isOpen={abrirAreas}
        onClose={() => setAbrirAreas(false)}
        onConfirm={onConfirmAreas}
      />
    </main>
  );
}
