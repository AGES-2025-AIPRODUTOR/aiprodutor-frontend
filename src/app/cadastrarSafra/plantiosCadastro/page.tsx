/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-no-undef */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import PageTitle from '@/components/PageTitle';
import { Button } from '@/components/ui/button';
import DateFieldModal from '@/components/ui/dateModal';
import SelecionarArea from '@/app/cadastrarSafra/components/selectAreas';
import SafraSteps from '@/app/cadastrarSafra/components/SafraSteps';
import { useSafraWizard } from '@/context/SafraWizardContext';
import { useAgriculturalProducerContext } from '@/context/AgriculturalProducerContext';
import type { AreasEntity } from '@/service/areas';
import { Input } from '@/components/ui/input';
import { createSafra } from '@/service/safras';

// Produtos / Variedades
import { getProducts, type Product } from '@/service/products';
import { getVarietiesByProduct, type Variety } from '@/service/varieties';

// usa o mesmo modal da tela de safra
import AreaListModal from '../components/areasList/AreaList';

// modal de confirmação (shadcn)
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

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
  const queryClient = useQueryClient();
  const { draft, addPlantio, removePlantio, reset } = useSafraWizard();
  const { data: producer } = useAgriculturalProducerContext();
  const producerId = producer?.id ?? 1;

  const [mounted, setMounted] = useState(false);
  const [salvando, setSalvando] = useState(false);
  useEffect(() => setMounted(true), []);

  // Form do plantio atual
  const [plantioNome, setPlantioNome] = useState(''); // NEW: nome do plantio
  const [inicio, setInicio] = useState<string>('');
  const [fim, setFim] = useState<string>('');
  const [qtdTxt, setQtdTxt] = useState('');
  const [selecionadas, setSelecionadas] = useState<AreasEntity[]>([]);
  const [abrirModalAreas, setAbrirModalAreas] = useState(false);

  // Produtos / Variedades
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const [productId, setProductId] = useState<number | ''>('');
  const [varietyId, setVarietyId] = useState<number | ''>('');

  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [varietiesLoading, setVarietiesLoading] = useState(false);
  const [varietiesError, setVarietiesError] = useState<string | null>(null);

  // Subconjunto permitido = áreas da safra
  const allowedAreas = draft?.areas ?? [];
  const allowedIdsSet = useMemo(() => new Set(allowedAreas.map((a) => a.id)), [allowedAreas]);

  const invalid = !draft?.nome || !draft?.inicio || !draft?.fim || allowedAreas.length === 0;

  // lookup para nomes (sumário bonitinho)
  const productNameOf = (id?: number | '') =>
    id ? (products.find((p) => p.id === id)?.name ?? `#${id}`) : '—';
  const varietyNameOf = (id?: number | '') =>
    id ? (varieties.find((v) => v.id === id)?.name ?? `#${id}`) : '—';
  const areaNameMap = useMemo(
    () => new Map(allowedAreas.map((a) => [a.id, a.name] as const)),
    [allowedAreas]
  );
  // ====== CONFIRMAÇÃO ======
  const [showConfirm, setShowConfirm] = useState(false);
  const [plantingsPreview, setPlantingsPreview] = useState<
    {
      name: string;
      productId?: number;
      varietyId?: number;
      plantingDate: string;
      expectedHarvestDate?: string;
      quantityPlanted: number;
      areaIds: number[];
    }[]
  >([]);
  useEffect(() => {
    (async () => {
      const res = await getProducts();
      if (res.isSuccess) {
        setProducts(res.response || []);
        setProductsError(null);
      } else {
        setProductsError(res.errorMessage || 'Falha ao carregar produtos');
      }
      setProductsLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (productId === '' || productId == null) {
      setVarieties([]);
      setVarietyId('');
      return;
    }
    setVarietiesLoading(true);
    (async () => {
      const res = await getVarietiesByProduct(Number(productId));
      if (res.isSuccess) {
        setVarieties(res.response || []);
        setVarietiesError(null);
        setVarietyId('');
      } else {
        setVarietiesError(res.errorMessage || 'Falha ao carregar variedades');
        setVarieties([]);
        setVarietyId('');
      }
      setVarietiesLoading(false);
    })();
  }, [productId]);

  useEffect(() => {
    if (!mounted) return;
    if (invalid) router.replace('/cadastrarSafra');
  }, [mounted, invalid, router]);

  if (!mounted || invalid) return null;

  const podeAdicionar =
    !!plantioNome.trim() &&
    !!inicio &&
    !!fim &&
    productId !== '' &&
    varietyId !== '' &&
    parseKg(qtdTxt) !== null &&
    selecionadas.length > 0;

  const limparForm = () => {
    setPlantioNome('');
    setInicio('');
    setFim('');
    setProductId('');
    setVarietyId('');
    setQtdTxt('');
    setSelecionadas([]);
  };

  const handleAdicionarOutro = () => {
    if (!podeAdicionar) return;
    // NOTE: acrescentei "name" no draft – ver ajuste no SafraWizard abaixo
    addPlantio({
      id: crypto.randomUUID(),
      name: plantioNome.trim(), // NEW
      inicio,
      fim,
      productId: Number(productId),
      varietyId: Number(varietyId),
      quantidadePlantadaKg: parseKg(qtdTxt),
      areaIds: selecionadas.map((a) => a.id),
    } as any);
    limparForm();
  };

  const abrirConfirmacao = () => {
    // monta prévia incluindo o "pendente" (se válido)
    const pendenteValido =
      !!plantioNome.trim() &&
      !!inicio &&
      !!fim &&
      productId !== '' &&
      varietyId !== '' &&
      parseKg(qtdTxt) !== null &&
      selecionadas.length > 0;

    const mappedDraft = draft!.plantios.map((p: any) => ({
      name: p.name ?? 'Plantio', // fallback
      productId: p.productId,
      varietyId: p.varietyId,
      plantingDate: p.inicio,
      expectedHarvestDate: p.fim,
      quantityPlanted: p.quantidadePlantadaKg ?? 0,
      areaIds: p.areaIds,
    }));

    const pending = pendenteValido
      ? [
          {
            name: plantioNome.trim(),
            productId: Number(productId),
            varietyId: Number(varietyId),
            plantingDate: inicio,
            expectedHarvestDate: fim,
            quantityPlanted: parseKg(qtdTxt) ?? 0,
            areaIds: selecionadas.map((a) => a.id),
          },
        ]
      : [];

    const preview = [...mappedDraft, ...pending];
    setPlantingsPreview(preview);
    setShowConfirm(true);
  };

  const salvarAgora = async () => {
    try {
      setSalvando(true);

      const payload = {
        name: draft!.nome,
        startDate: draft!.inicio,
        endDate: draft!.fim,
        producerId,
        areaIds: allowedAreas.map((a) => a.id),
        plantings: plantingsPreview,
      };

      const { isSuccess, errorMessage } = await createSafra(payload);
      if (!isSuccess) {
        setSalvando(false);
        alert(errorMessage || 'Não foi possível salvar a safra.');
        return;
      }

      reset();
      queryClient.invalidateQueries({ queryKey: ['safras', producerId] });
      router.replace('/controleSafra');
    } catch {
      setSalvando(false);
      alert('Erro inesperado ao salvar.');
    }
  };

  // ====== FIM CONFIRMAÇÃO ======

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

      {/* Nome do Plantio */}
      <div className="mt-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">Nome do Plantio *</label>
        <input
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ex.: Plantio de Tomate - Talhão 1"
          value={plantioNome}
          onChange={(e) => setPlantioNome(e.target.value)}
        />
      </div>

      {/* Produto e Variedade */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Produto *</label>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            value={productId}
            onChange={(e) => setProductId(e.target.value ? Number(e.target.value) : '')}
            disabled={productsLoading}
          >
            <option value="">Selecione…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {productsError && <p className="mt-1 text-xs text-red-600">{productsError}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Variedade *</label>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            value={varietyId}
            onChange={(e) => setVarietyId(e.target.value ? Number(e.target.value) : '')}
            disabled={varietiesLoading || productId === ''}
          >
            <option value="">Selecione…</option>
            {varieties.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          {varietiesError && <p className="mt-1 text-xs text-red-600">{varietiesError}</p>}
        </div>
      </div>

      {/* Quantidade plantada */}
      <div className="mb-4 mt-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Quantidade Plantada *
        </label>
        <Input unit="kg" value={qtdTxt} onChange={(e) => setQtdTxt(e.target.value)} />
      </div>

      {/* Áreas */}
      <div className="mb-2">
        <label className="mb-1 block text-sm font-medium text-gray-700">Áreas *</label>
        <p className="mb-1 text-xs text-gray-500">
          * Só é possível selecionar áreas já incluídas na safra.
        </p>

        <SelecionarArea
          areas={selecionadas}
          onChange={setSelecionadas}
          onAddClick={() => setAbrirModalAreas(true)}
        />
      </div>

      {/* mesmo modal da safra — recebendo as áreas permitidas */}
      <AreaListModal
        isOpen={abrirModalAreas}
        onClose={() => setAbrirModalAreas(false)}
        areas={allowedAreas}
        excludeIds={selecionadas.map((a) => a.id)}
        onConfirm={(picked: AreasEntity[]) => {
          // subset + dedupe
          const filtradas = picked.filter((a) => allowedIdsSet.has(a.id));
          setSelecionadas((prev) => {
            const map = new Map<number, AreasEntity>();
            [...prev, ...filtradas].forEach((a) => map.set(a.id, a));
            return [...map.values()];
          });
          setAbrirModalAreas(false);
        }}
      />

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
          onClick={abrirConfirmacao}
          disabled={salvando}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60"
        >
          {salvando ? 'Salvando…' : 'Finalizar'}
        </Button>
      </div>

      {/* Debug list (opcional) */}
      {draft!.plantios.length > 0 && (
        <div className="mt-6 rounded-md border p-3 text-sm text-gray-600">
          <h4 className="mb-2 font-medium">Plantios adicionados</h4>
          <ul className="space-y-2">
            {draft!.plantios.map((p: any) => (
              <li key={p.id} className="flex items-center justify-between">
                <span>
                  <strong>{p.name ?? 'Plantio'}</strong> — Prod: {p.productId} — Var: {p.varietyId}{' '}
                  — {p.inicio} → {p.fim} — {p.quantidadePlantadaKg ?? '—'} kg — Áreas:{' '}
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

      {/* MODAL CONFIRMAÇÃO */}
      <Dialog open={showConfirm} onOpenChange={(o) => setShowConfirm(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar cadastro da safra</DialogTitle>
            <DialogDescription>
              Você está criando a safra <strong>{draft?.nome}</strong> ({draft?.inicio} →{' '}
              {draft?.fim}). Revise os plantios abaixo antes de confirmar.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[45vh] overflow-auto space-y-3 text-sm">
            {plantingsPreview.length === 0 && <p>Nenhum plantio informado.</p>}
            {plantingsPreview.map((p, i) => (
              <div key={i} className="rounded border p-2">
                <div className="font-medium">{p.name}</div>
                <div>Produto: {productNameOf(p.productId)}</div>
                <div>Variedade: {varietyNameOf(p.varietyId)}</div>
                <div>Data de início: {p.plantingDate?? '—'}</div>
                <div>Data Final: {p.expectedHarvestDate ?? '—'}</div>
                <div>Quantidade: {p.quantityPlanted?.toLocaleString('pt-BR')} kg</div>
                <div>
                  Áreas: {p.areaIds.map((id) => areaNameMap.get(id) ?? `#${id}`).join(', ')}
                </div>{' '}
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirm(false)} className="flex-1">
              Voltar
            </Button>
            <Button onClick={salvarAgora} className="flex-1 bg-green-600 hover:bg-green-700">
              Confirmar e salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
