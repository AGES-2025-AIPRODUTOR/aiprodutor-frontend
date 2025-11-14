/* eslint-disable @typescript-eslint/no-explicit-any */
// app/cadastrarSafra/safraEditar/page.tsx
'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import PageTitle from '@/components/PageTitle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DateFieldModal from '@/components/ui/dateModal';
import SelecionarArea from '@/app/cadastrarSafra/components/selectAreas';
import AreaListModal from '@/app/cadastrarSafra/components/areasList/AreaList';
import { ConfirmDialog } from '@/components/ui/confirmDialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

import type { AreasEntity } from '@/service/areas';
import { getSafraById, updateSafra, deactivatePlantio, type PlantioEntity } from '@/service/safras';
import { toast } from 'sonner';

function EditarSafraContent() {
  const router = useRouter();

  // ⚠️ Rota com query string: /cadastrarSafra/safraEditar?safraId=1
  const search = useSearchParams();
  const safraId = useMemo(() => {
    const q = search.get('safraId');
    const n = q ? Number(q) : NaN;
    return Number.isFinite(n) ? n : 1; // fallback (apenas p/ dev local)
  }, [search]);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [status, setStatus] = useState<'in_progress' | 'completed' | 'cancelled'>('in_progress');

  // estados do formulário
  const [nome, setNome] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [areas, setAreas] = useState<AreasEntity[]>([]);
  const [plantios, setPlantios] = useState<PlantioEntity[]>([]);
  const [abrirAreas, setAbrirAreas] = useState(false);

  // estado de confirmação
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [plantioSelecionado, setPlantioSelecionado] = useState<number | null>(null);

  // carrega safra
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
      setInicio(response.inicio);
      setFim(response.fim);
      setAreas(response.areas || []);
      setPlantios(response.plantios || []);
      if ((response as any).status) {
        const st = (response as any).status as 'in_progress' | 'completed' | 'cancelled';
        setStatus(st);
      }
      setLoading(false);
    });
    return () => {
      cancel = true;
    };
  }, [safraId]);

  const podeSalvar = !!nome.trim() && !!inicio && !!fim;

  const onSalvar = async () => {
    if (!podeSalvar) return;

    const body = {
      name: nome.trim(),
      startDate: inicio,
      endDate: fim,
      status,
    };

    const { isSuccess, errorMessage } = await updateSafra(safraId, body as any);
    if (isSuccess) {
      router.push(`/controleSafra`);
    } else {
      toast.error(errorMessage || 'Falha ao salvar');
    }
  };

  const onConfirmAreas = (novas: AreasEntity[]) => {
    setAreas((prev) => {
      const map = new Map<number, AreasEntity>();
      [...prev, ...novas].forEach((a) => map.set(a.id, a));
      return [...map.values()];
    });
  };

  const handleDesativarClick = (plantioId: number) => {
    setPlantioSelecionado(plantioId);
    setConfirmOpen(true);
  };

  const confirmarDesativacao = async () => {
    if (!plantioSelecionado) return;
    const { isSuccess, errorMessage } = await deactivatePlantio(plantioSelecionado);
    if (isSuccess) {
      setPlantios((prev) => prev.filter((p) => p.id !== plantioSelecionado));
      toast.success('Plantio desativado com sucesso.');
    } else {
      toast.error(errorMessage || 'Erro ao desativar.');
    }
    setPlantioSelecionado(null);
    setConfirmOpen(false);
  };

  if (loading) return <main className="p-6">Carregando…</main>;
  if (erro) return <main className="p-6 text-red-600">{erro}</main>;

  return (
    <main className="mx-auto flex w-full max-w-md flex-col px-4 pb-24 pt-2">
      <PageTitle title="Editar Safra" href="/cadastrarSafra" variant="center" />

      {/* Datas */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 mt-2">
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
        <Input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex.: Safra de Laranja 25/26"
        />
      </div>
      {/* Status */}
      <div className="mb-5">
        <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in_progress">Em andamento</SelectItem>
            <SelectItem value="completed">Concluída</SelectItem>
            <SelectItem value="cancelled">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Áreas */}
      <div className="mb-2">
        <SelecionarArea areas={areas} onChange={setAreas} onAddClick={() => setAbrirAreas(true)} />
      </div>

      {/* Linha divisória */}
      <hr className="my-4" />

      {/* Plantios existentes */}
      <div className="space-y-2">
        {plantios.map((p, idx) => (
          <div key={p.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
            <span className="text-sm truncate max-w-[55%]" title={p.name?.trim() || ` ${idx + 1}`}>
              Plantio: {p.name?.trim() ? p.name : ` ${idx + 1}`}
            </span>
            <div className="flex gap-2">
              <Link href={`/cadastrarSafra/plantiosEditar?safraId=${safraId}&plantioId=${p.id}`}>
                <Button variant="outline" size="sm">
                  Editar
                </Button>
              </Link>
              <Button variant="destructive" size="sm" onClick={() => handleDesativarClick(p.id)}>
                Desativar
              </Button>
            </div>
          </div>
        ))}
        {plantios.length === 0 && (
          <p className="text-sm text-gray-500">Nenhum plantio cadastrado.</p>
        )}
      </div>

      {/* Modal de confirmação */}
      <ConfirmDialog
        isOpen={confirmOpen}
        description="Deseja realmente desativar este plantio?"
        onConfirm={confirmarDesativacao}
        onCancel={() => {
          setConfirmOpen(false);
          setPlantioSelecionado(null);
        }}
      />

      {/* Ações */}
      <div className="mt-6">
        <Button className="w-full" onClick={onSalvar} disabled={!podeSalvar}>
          Salvar
        </Button>
      </div>

      {/* Modal de áreas */}
      <AreaListModal
        producerId={1}
        isOpen={abrirAreas}
        onClose={() => setAbrirAreas(false)}
        onConfirm={onConfirmAreas}
      />
    </main>
  );
}

export default function EditarSafraPage() {
  return (
    <Suspense
      fallback={<div className="flex items-center justify-center min-h-screen">Carregando...</div>}
    >
      <EditarSafraContent />
    </Suspense>
  );
}
