'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import PageTitle from '@/components/PageTitle';
import { getSafraById, SafraControlEntity } from '@/service/safraControl';
import { SafraControlPanelSkeleton } from './skeleton';
import GeneralInfoTable from './components/GeneralInfoTable';
import { PlantingsEmptyState } from './components/EmptyState';
import PlantingAccordion from './components/PlantingAccordion';

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const [safra, setSafra] = useState<SafraControlEntity>();

  const {
    data: response,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ['safras', id],
    queryFn: () => getSafraById(Number(id) || 0),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (!isError && response?.response) {
      setSafra(response.response);
    }
  }, [response, isError]);

  if (isLoading) return <SafraControlPanelSkeleton />;

  return (
    <main>
      <PageTitle title="Painel de Controle" variant="no-border-center" href="/controleSafra" />

      {safra?.generalInfo?.name && (
        <h1 className="text-center text-xl text-green-700 font-bold">{safra.generalInfo.name}</h1>
      )}

      <h1 className="text-center text-lg text-gray-600 pt-4">Informações Gerais</h1>

      <div className="w-full px-4 mt-4 text-sm">
        {safra?.generalInfo && <GeneralInfoTable safra={safra} />}
      </div>

      <div className="py-4">
        <hr className="border-1 border-gray-300 mx-4" />
        <hr className="border-1 border-gray-300 mx-4" />
      </div>

      <PlantingsEmptyState
        show={
          Array.isArray(safra?.generalInfo?.linked_plantings) &&
          safra.generalInfo.linked_plantings.length < 1
        }
      />

      <div className="py-2 flex flex-col gap-2">
        {safra?.generalInfo?.linked_plantings?.map((planting, index) => (
          <PlantingAccordion planting={planting} key={index} />
        ))}
      </div>
    </main>
  );
}
