'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import PageTitle from '@/components/PageTitle';
import { Button } from '@/components/ui/button';
import DateFieldModal from '@/components/ui/dateModal';
import SelecionarArea from '@/components/ui/selectAreas';
import SafraSteps from '@/app/cadastrarSafra/components/SafraSteps';
import { useSafraWizard } from '@/context/SafraWizardContext';
import type { AreasEntity } from '@/service/areas';
import { Input } from '@/components/ui/input';

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

export default function PlantiosPage() {
  const router = useRouter();
  const { draft, addPlantio, removePlantio } = useSafraWizard();

  // 1) hooks SEMPRE no topo (ordem estável)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // form do plantio corrente
  const [inicio, setInicio] = useState<string>('');
  const [fim, setFim] = useState<string>('');
  const [produtoNome, setProdutoNome] = useState('');
  const [qtdTxt, setQtdTxt] = useState(''); // controlado pelo Input custom
  const [selecionadas, setSelecionadas] = useState<AreasEntity[]>([]);
  const [abrirModalAreas, setAbrirModalAreas] = useState(false);

  // dados permitidos (podem ser [] se ainda não houver draft)
  const allowedAreas = draft?.areas ?? [];
  const allowedAreasIds = useMemo(() => new Set(allowedAreas.map((a) => a.id)), [allowedAreas]);

  const invalid = !draft?.nome || !draft?.inicio || !draft?.fim || allowedAreas.length === 0;

  // 2) redireciona só em efeito, nunca no render
  useEffect(() => {
    if (!mounted) return;
    if (invalid) router.replace('/cadastrarSafra');
  }, [mounted, invalid, router]);

  // 3) depois de TODOS os hooks, pode fazer o early-return
  if (!mounted || invalid) {
    return null; // skeleton opcional
  }

  const onAddAreas = (novas: AreasEntity[]) => {
    const filtradas = novas.filter((a) => allowedAreasIds.has(a.id));
    setSelecionadas((prev) => {
      const map = new Map<number, AreasEntity>();
      [...prev, ...filtradas].forEach((a) => map.set(a.id, a));
      return [...map.values()];
    });
  };

  const podeAdicionar =
    !!inicio &&
    !!fim &&
    produtoNome.trim().length > 0 &&
    parseKg(qtdTxt) !== null &&
    selecionadas.length > 0;

  const handleAdicionarOutro = () => {
    if (!podeAdicionar) return;
    addPlantio({
      id: crypto.randomUUID(),
      inicio,
      fim,
      produtoNome: produtoNome.trim(),
 quantidadePlantadaKg: parseKg(qtdTxt),
       areaIds: selecionadas.map((a) => a.id),
    });
    setInicio('');
    setFim('');
    setProdutoNome('');
    setQtdTxt('');
    setSelecionadas([]);
  };

  const handleFinalizar = () => {
    if (podeAdicionar) handleAdicionarOutro();

    const payload = {
      safra: {
        nome: draft!.nome,
        dataInicio: draft!.inicio,
        dataFim: draft!.fim,
        areaIds: allowedAreas.map((a) => a.id),
      },
      plantios: draft!.plantios.map((p) => ({
        dataInicio: p.inicio,
        dataFim: p.fim,
        produto: p.produtoNome,
  quantidadePlantadaKg: p.quantidadePlantadaKg,
          areaIds: p.areaIds,
      })),
    };

    console.log('[Payload Final]', payload);
    alert('Payload final montado (veja o console). Troque pelo POST da sua API.');
    // router.push('/alguma/rota');
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col px-4 pb-24 pt-2">
      <PageTitle title="Adicionar plantio" href="/cadastrarSafra" variant="center" />
      <SafraSteps active="plantios" safraDone title="Adicionar plantio" className="mb-3" />

      {/* Datas */}
       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <DateFieldModal
        label="Data Início"
        value={inicio}
        onChange={(v) => {
          setInicio(v);
          if (fim && v && v > fim) setFim(''); // mantém coerência
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

      {/* Produto */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Nome do Produto do Plantio 
        </label>
        <input
          type="text"
          value={produtoNome}
          onChange={(e) => setProdutoNome(e.target.value)}
          placeholder="Ex.: 1º plantio de laranja"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Quantidade */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Quantidade Plantada 
        </label>
        <Input unit="kg" value={qtdTxt} onChange={(e) => setQtdTxt(e.target.value)} />
      </div>

      {/* Áreas (somente as da safra) */}
      <div className="mb-2">
        <label className="mb-1 block text-sm font-medium text-gray-700">Áreas</label>
        <p className="mb-1 text-xs text-gray-500">
          * Só é possível selecionar áreas já incluídas na safra.
        </p>
        <SelecionarArea
          areas={selecionadas}
          onChange={setSelecionadas}
          onAddClick={() => setAbrirModalAreas(true)}
        />
      </div>

      {abrirModalAreas && (
        <PickAreasModal
          allowed={allowedAreas}
          already={selecionadas}
          onClose={() => setAbrirModalAreas(false)}
          onConfirm={(picked) => {
            onAddAreas(picked);
            setAbrirModalAreas(false);
          }}
        />
      )}

      {/* Ações */}
      <div className="mt-4">
        <Button
          type="button"
          onClick={handleAdicionarOutro}
          disabled={!podeAdicionar}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60"
        >
          Adicionar outro plantio
        </Button>
      </div>

      <div className="mt-6 flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/cadastrarSafra')}
          className="flex-1 border-green-700 text-green-700"
        >
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={handleFinalizar}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          Finalizar
        </Button>
      </div>

      {/* Debug list (opcional) */}
      {draft!.plantios.length > 0 && (
        <div className="mt-6 rounded-md border p-3 text-sm text-gray-600">
          <h4 className="mb-2 font-medium">Plantios adicionados</h4>
          <ul className="space-y-2">
            {draft!.plantios.map((p) => (
              <li key={p.id} className="flex items-center justify-between">
                <span>
                  {p.produtoNome} — {p.inicio} → {p.fim} — {p.quantidadePlantadaKg ?? '—'} kg — Áreas:{' '}
                  {p.areaIds.join(', ')}
                </span>
                <Button variant="outline" size="sm" onClick={() => removePlantio(p.id)}>
                  Remover
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}

/** Modal local para escolher áreas permitidas (subset da safra) */
function PickAreasModal({
  allowed,
  already,
  onConfirm,
  onClose,
}: {
  allowed: AreasEntity[];
  already: AreasEntity[];
  onConfirm: (areas: AreasEntity[]) => void;
  onClose: () => void;
}) {
  const [ids, setIds] = useState<Set<number>>(new Set(already.map((a) => a.id)));

  const toggle = (id: number) =>
    setIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
        <h3 className="text-lg font-semibold">Selecione áreas da safra</h3>
        <div className="mt-3 max-h-[50vh] space-y-2 overflow-y-auto">
          {allowed.map((a) => (
            <label key={a.id} className="flex items-center gap-2 rounded border p-2">
              <input
                type="checkbox"
                checked={ids.has(a.id)}
                onChange={() => toggle(a.id)}
                className="h-4 w-4 accent-green-600"
              />
              <span className="truncate">{a.name}</span>
            </label>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => onConfirm(allowed.filter((a) => ids.has(a.id)))}
          >
            Concluir
          </Button>
        </div>
      </div>
    </div>
  );
}
