/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-no-undef */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import PageTitle from '@/components/PageTitle';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DateFieldModal from '@/components/ui/dateModal';
import SelecionarArea from '@/app/cadastrarSafra/components/selectAreas';
import SafraSteps from '@/app/cadastrarSafra/components/SafraSteps';
import { useSafraWizard } from '@/context/SafraWizardContext';
import { useAgriculturalProducerContext } from '@/context/AgriculturalProducerContext';
import type { AreasEntity } from '@/service/areas';
import { Input } from '@/components/ui/input';
import { createSafra } from '@/service/safras';
import type { CreateSafraDTO, CreatePlantingDTO } from '@/service/safras';

// Produtos (sem variedade)
import { getProducts, type Product } from '@/service/products';

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

export default function PlantiosPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { draft, addPlantio, removePlantio, reset } = useSafraWizard();
  const { data: producer } = useAgriculturalProducerContext();
  const producerId = producer?.id ?? 1; // default = 1

  const [mounted, setMounted] = useState(false);
  const [salvando, setSalvando] = useState(false);
  useEffect(() => setMounted(true), []);

  // Form do plantio atual
  const [plantioNome, setPlantioNome] = useState(''); // nome do plantio
  const [inicio, setInicio] = useState<string>('');
  const [fim, setFim] = useState<string>('');
  const [qtdTxt, setQtdTxt] = useState(''); // quantidade plantada (kg)
  const [expectedTxt, setExpectedTxt] = useState(''); // produção esperada (kg) — novo
  const [selecionadas, setSelecionadas] = useState<AreasEntity[]>([]);
  const [abrirModalAreas, setAbrirModalAreas] = useState(false);

  // Produtos (sem variedade)
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const [productId, setProductId] = useState<number | ''>('');

  // Subconjunto permitido = áreas da safra
  const allowedAreas = draft?.areas ?? [];
  const allowedIdsSet = useMemo(() => new Set(allowedAreas.map((a) => a.id)), [allowedAreas]);

  const invalid = !draft?.nome || !draft?.inicio || !draft?.fim || allowedAreas.length === 0;

  // lookup para nomes (sumário bonitinho)
  const productNameOf = (id?: number | '') =>
    id ? (products.find((p) => p.id === id)?.name ?? `#${id}`) : '—';

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
      plantingDate: string;
      expectedHarvestDate?: string;
      quantityPlanted: number;
      expectedYield?: number | null; // novo no preview
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
    if (!mounted) return;
    if (invalid) router.replace('/cadastrarSafra');
  }, [mounted, invalid, router]);

  if (!mounted || invalid) return null;

  const podeAdicionar =
    !!plantioNome.trim() &&
    !!inicio &&
    !!fim &&
    productId !== '' &&
    parseKg(qtdTxt) !== null &&
    selecionadas.length > 0; // expectedYield NÃO é obrigatório

  const limparForm = () => {
    setPlantioNome('');
    setInicio('');
    setFim('');
    setProductId('');
    setQtdTxt('');
    setExpectedTxt(''); // limpa produção esperada
    setSelecionadas([]);
  };

  const handleAdicionarOutro = () => {
    if (!podeAdicionar) return;
    // NOTE: acrescentei "name" no draft – ver ajuste no SafraWizard abaixo
    addPlantio({
      id: crypto.randomUUID(),
      name: plantioNome.trim(),
      inicio,
      fim,
      productId: Number(productId),
      quantidadePlantadaKg: parseKg(qtdTxt),
      producaoEsperadaKg: parseKg(expectedTxt), // novo no draft
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
      parseKg(qtdTxt) !== null &&
      selecionadas.length > 0;

    const mappedDraft = draft!.plantios.map((p: any) => ({
      name: p.name ?? 'Plantio', // fallback
      productId: p.productId,
      plantingDate: p.inicio,
      expectedHarvestDate: p.fim,
      quantityPlanted: p.quantidadePlantadaKg ?? 0,
      expectedYield: p.producaoEsperadaKg ?? null, // novo vindo do draft
      areaIds: p.areaIds,
    }));

    const pending = pendenteValido
      ? [
          {
            name: plantioNome.trim(),
            productId: Number(productId),
            plantingDate: inicio,
            expectedHarvestDate: fim,
            quantityPlanted: parseKg(qtdTxt) ?? 0,
            expectedYield: parseKg(expectedTxt), // novo pendente
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

      const plantingsComArea: CreatePlantingDTO[] = plantingsPreview
        .map((p) => ({
          name: p.name,
          plantingDate: p.plantingDate,
          expectedHarvestDate: p.expectedHarvestDate,
          quantityPlanted: p.quantityPlanted,
          expectedYield: p.expectedYield ?? undefined, // novo no payload
          productId: p.productId,
          areaIds: (p.areaIds ?? [])
            .map((id: number | string) => Number(id))
            .filter((n) => Number.isFinite(n)),
        }))
        .filter((p) => p.areaIds.length > 0);

      const payload: CreateSafraDTO = {
        name: draft!.nome,
        startDate: draft!.inicio,
        endDate: draft!.fim,
        producerId,
        status: 'in_progress',
        plantings: plantingsComArea,
      };

      const { isSuccess, errorMessage } = await createSafra(payload);

      if (!isSuccess) {
        setSalvando(false);
        toast.error(errorMessage || 'Não foi possível salvar a safra.');
        return;
      }

      // --- SUCESSO: feche modal/limpe estados ANTES de navegar ---
      setShowConfirm(false); // fecha o Dialog
      reset(); // limpa o wizard
      await queryClient.invalidateQueries({ queryKey: ['safras', producerId] });

      // dá uma microfolga pro React aplicar o estado e então navega
      setTimeout(() => {
        // use replace para não voltar pro wizard
        try {
          router.replace('/'); // sua Home
        } catch {
          // fallback bruto se algo bloquear o router
          window.location.href = '/';
        }
      }, 0);
    } catch {
      toast.error('Erro inesperado ao salvar.');
    } finally {
      setSalvando(false);
    }
  };

  // ====== FIM CONFIRMAÇÃO ======

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col px-4 pb-24 pt-2">
      <PageTitle title="Adicionar Plantio" href="/cadastrarSafra" variant="center" />
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
        <Input
          placeholder="Ex.: Plantio de Tomate - Talhão 1"
          value={plantioNome}
          onChange={(e) => setPlantioNome(e.target.value)}
        />
      </div>

      {/* Produto (sem variedade) */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Produto *</label>
          <Select
            value={productId ? String(productId) : ''}
            onValueChange={(value) => setProductId(value ? Number(value) : '')}
            disabled={productsLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {productsError && <p className="mt-1 text-xs text-red-600">{productsError}</p>}
        </div>
      </div>

      {/* Quantidade plantada */}
      <div className="mb-4 mt-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Quantidade Plantada *
        </label>
        <Input unit="kg" value={qtdTxt} onChange={(e) => setQtdTxt(e.target.value)} />
      </div>

      {/* Produção esperada (novo — mesmo molde) */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Produção Esperada (opcional)
        </label>
        <Input
          unit="kg"
          placeholder="ex.: 1.200 kg"
          value={expectedTxt}
          onChange={(e) => setExpectedTxt(e.target.value)}
        />
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
          className="w-full"
        >
          Adicionar outro plantio
        </Button>
      </div>

      <div className="mt-6 flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/cadastrarSafra')}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button type="button" onClick={abrirConfirmacao} disabled={salvando} className="flex-1">
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
                  <strong>{p.name ?? 'Plantio'}</strong> — Prod: {p.productId}
                  {' — '}
                  {p.inicio} → {p.fim} — {p.quantidadePlantadaKg ?? '—'} kg
                  {' — Esperada: '}
                  {p.producaoEsperadaKg ?? '—'} kg — Áreas: {p.areaIds.join(', ')}
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
                <div>Data de início: {p.plantingDate ?? '—'}</div>
                <div>Data Final: {p.expectedHarvestDate ?? '—'}</div>
                <div>Quantidade: {p.quantityPlanted?.toLocaleString('pt-BR')} kg</div>
                <div>
                  Produção esperada:{' '}
                  {p.expectedYield != null ? `${p.expectedYield.toLocaleString('pt-BR')} kg` : '—'}
                </div>
                <div>
                  Áreas: {p.areaIds.map((id) => areaNameMap.get(id) ?? `#${id}`).join(', ')}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirm(false)} className="flex-1">
              Voltar
            </Button>
            <Button onClick={salvarAgora} className="flex-1">
              Confirmar e salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
