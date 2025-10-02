'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllProducers, type ProducerAPI } from '@/service/producers';
import { useAgriculturalProducerContext } from '@/context/AgriculturalProducerContext';
import type { AgriculturalProducerEntity } from '@/service/cadastro';

type Props = { className?: string };

// normaliza o payload da API (null -> '')
const toContext = (p: ProducerAPI): AgriculturalProducerEntity => ({
  id: p.id,
  name: p.name ?? '',
  document: p.document ?? '',
  phone: p.phone ?? '',
  email: p.email ?? '',
  zipCode: p.zipCode ?? '',
  city: p.city ?? '',
  street: p.street ?? '',
  number: p.number ?? '',
  complement: p.complement ?? '', // 👈 aqui sanamos o null
});

export default function ProducerSwitcher({ className }: Props) {
  const { data: current, setData } = useAgriculturalProducerContext();

  const { data, isLoading } = useQuery({
    queryKey: ['producers'],
    queryFn: getAllProducers,
    staleTime: 60_000,
  });

  const producers: AgriculturalProducerEntity[] =
    data?.isSuccess ? data.response.map(toContext) : [];

  // se ainda não houve seleção, seta o primeiro da lista
  React.useEffect(() => {
    if (!isLoading && producers.length && (!current?.id || current.id === 0)) {
      setData(producers[0]);
    }
  }, [isLoading, producers, current?.id, setData]);

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    const p = producers.find((x) => x.id === id);
    if (p) setData(p);
  };

  return (
    <div className={className}>
      <label className="sr-only">Produtor ativo</label>
      <select
        value={current?.id ?? ''}
        onChange={onChange}
        className="h-8 rounded-md border border-gray-300 bg-white px-2 text-sm"
        disabled={isLoading || producers.length === 0}
        title="Selecionar produtor ativo"
      >
        {(!current?.id || current.id === 0) && <option value="">Selecione…</option>}
        {producers.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} (#{p.id})
          </option>
        ))}
      </select>
    </div>
  );
}
