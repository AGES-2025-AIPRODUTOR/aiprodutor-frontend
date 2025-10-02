/* eslint-disable react/jsx-no-undef */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import PageTitle from '@/components/PageTitle';
import { Button } from '@/components/ui/button';
import DateFieldModal from '@/components/ui/dateModal';
import SelecionarArea from '@/components/ui/selectAreas';
import SafraSteps from '@/app/cadastrarSafra/components/SafraSteps';
import { useSafraWizard } from '@/context/SafraWizardContext';
import { useAgriculturalProducerContext } from '@/context/AgriculturalProducerContext';
import type { AreasEntity } from '@/service/areas';
import { Input } from '@/components/ui/input';
import { createSafra } from '@/service/safras';

// NEW: services de produto/variedade
import { getProducts, type Product } from '@/service/products';
import { getVarietiesByProduct, type Variety } from '@/service/varieties';
import PickAreasModal from '../components/PickAreasModal';

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
  // 1) Hooks de navegação/contexts
  const router = useRouter();
  const { draft, addPlantio, removePlantio } = useSafraWizard();
  const { data: producer } = useAgriculturalProducerContext();
  const producerId = producer?.id ?? 1;

  // 2) Hooks básicos da tela
  const [mounted, setMounted] = useState(false);
  const [salvando, setSalvando] = useState(false);
  useEffect(() => setMounted(true), []);

  // 3) Form do plantio
  const [inicio, setInicio] = useState<string>('');
  const [fim, setFim] = useState<string>('');
  const [qtdTxt, setQtdTxt] = useState('');
  const [selecionadas, setSelecionadas] = useState<AreasEntity[]>([]);
  const [abrirModalAreas, setAbrirModalAreas] = useState(false);

  // 4) Produto/Variedade (HOOKS AQUI, ANTES DE QUALQUER RETURN)
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const [productId, setProductId] = useState<number | ''>('');
  const [varietyId, setVarietyId] = useState<number | ''>('');

  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [varietiesLoading, setVarietiesLoading] = useState(false);
  const [varietiesError, setVarietiesError] = useState<string | null>(null);

  // 5) Derivados
  const allowedAreas = draft?.areas ?? [];
  const allowedAreasIds = useMemo(() => new Set(allowedAreas.map((a) => a.id)), [allowedAreas]);
  const invalid = !draft?.nome || !draft?.inicio || !draft?.fim || allowedAreas.length === 0;

  // 6) Efeitos (pode ter early return DENTRO do useEffect, isso é ok)
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

  // 7) Só AGORA o guard:
  if (!mounted || invalid) return null;

  const podeAdicionar =
    !!inicio &&
    !!fim &&
    productId !== '' &&
    varietyId !== '' &&
    parseKg(qtdTxt) !== null &&
    selecionadas.length > 0;

  const handleAdicionarOutro = () => {
    if (!podeAdicionar) return;
    addPlantio({
      id: crypto.randomUUID(),
      inicio,
      fim,
      productId: Number(productId),
      varietyId: Number(varietyId),
      quantidadePlantadaKg: parseKg(qtdTxt),
      areaIds: selecionadas.map((a) => a.id),
    });
    setInicio('');
    setFim('');
    setProductId(''); // NEW
    setVarietyId(''); // NEW
    setQtdTxt('');
    setSelecionadas([]);
  };

  const handleFinalizar = async () => {
    if (podeAdicionar) handleAdicionarOutro();

    try {
      setSalvando(true);

      const payload = {
        name: draft!.nome,
        startDate: draft!.inicio, // "YYYY-MM-DD"
        endDate: draft!.fim,
        producerId,
        areaIds: allowedAreas.map((a) => a.id),
        plantings: draft!.plantios.map((p) => ({
          name: 'Plantio',
          plantingDate: p.inicio,
          expectedHarvestDate: p.fim,
          quantityPlanted: p.quantidadePlantadaKg ?? 0,
          productId: p.productId,
          varietyId: p.varietyId,
          areaIds: p.areaIds,
        })),
      };

      const { isSuccess, errorMessage } = await createSafra(payload);
      setSalvando(false);

      if (isSuccess) {
        router.push('/controleSafra');
      } else {
        alert(errorMessage || 'Não foi possível salvar a safra.');
      }
    } catch (e) {
      setSalvando(false);
      alert('Erro inesperado ao salvar.');
    }
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

      {/* Produto e Variedade (IDs) */}
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

      {abrirModalAreas && (
        <PickAreasModal
          allowed={allowedAreas}
          already={selecionadas}
          isOpen={true}
          onClose={() => setAbrirModalAreas(false)}
          onConfirm={(picked) => {
            setSelecionadas((prev) => {
              const map = new Map<number, AreasEntity>();
              [...prev, ...picked].forEach((a) => map.set(a.id, a));
              return [...map.values()];
            });
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
            {draft!.plantios.map((p) => (
              <li key={p.id} className="flex items-center justify-between">
                <span>
                  Prod: {p.productId} — Var: {p.varietyId} — {p.inicio} → {p.fim} —{' '}
                  {p.quantidadePlantadaKg ?? '—'} kg — Áreas: {p.areaIds.join(', ')}
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

// (PickAreasModal permanece igual)
