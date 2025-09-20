'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import PageTitle from '../../components/PageTitle';
import { Plus } from 'lucide-react';
import { useAgriculturalProducerContext } from '@/context/AgriculturalProducerContext';
import { getAllSafras, SafraEntity } from '@/service/safraControl';
import { SafraCard } from './components/SafraCard';
import { SafraCardSkeleton } from './components/SafraCardSkeleton';
import { EmptyState } from './components/EmptyState';
import { ErrorState } from './components/ErrorState';

export default function ControleSafra() {
  const [safrasList, setSafrasList] = useState<SafraEntity[]>([]);
  const { data } = useAgriculturalProducerContext();

  const {
    data: response,
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['safras', data?.id],
    queryFn: async () => {
      const result = await getAllSafras(data?.id ?? 1);
      if (!result.isSuccess) {
        throw new Error(result.errorMessage || 'Erro ao buscar safras');
      }
      return result;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const handleDeleteSafra = (safraId: number) => {
    console.log('Excluir safra:', safraId);
    // TODO: Implementar exclusão da safra
  };

  const handleEditSafra = (safraId: number) => {
    console.log('Editar safra:', safraId);
    // TODO: Implementar navegação para página de edição
  };

  const handleViewControl = (safraId: number) => {
    console.log('Ver controle da safra:', safraId);
    // TODO: Implementar navegação para página de controle
  };

  useEffect(() => {
    if (response?.response) {
      setSafrasList(response.response);
    }
  }, [response]);

  return (
    <main className="flex-1 h-[calc(100vh-60px)] mx-auto flex flex-col bg-gray-50">
      <PageTitle title="Controle De Safra" href="/" variant="center" />

      <div className="flex justify-center w-full py-4 border-b mb-3 bg-white">
        <Link href="/cadastrarSafra">
          <Button variant="outline" className="border-green-700 text-green-700 py-7 px-4 bg-white hover:bg-green-50">
            <Plus className="mr-2 h-5 w-5" />
            Adicionar Nova Safra
          </Button>
        </Link>
      </div>

      <div className="flex flex-col flex-1 gap-3 pb-4 px-3 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => <SafraCardSkeleton key={index} />)
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : safrasList.length === 0 ? (
          <EmptyState />
        ) : (
          safrasList.map((safra) => (
            <SafraCard
              key={safra.safraId}
              safra={safra}
              onEdit={handleEditSafra}
              onDelete={handleDeleteSafra}
              onViewControl={handleViewControl}
            />
          ))
        )}
      </div>
    </main>
  );
}
