'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageTitle from '../../components/PageTitle';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAgriculturalProducerContext } from '@/context/AgriculturalProducerContext';
import { getSafrasByProducer, deleteSafra, type SafraListItem } from '@/service/safras';

import { SafraCard } from './components/SafraCard';
import { SafraCardSkeleton } from './components/SafraCardSkeleton';
import { EmptyState } from './components/EmptyState';
import { ErrorState } from './components/ErrorState';
import { toast } from 'sonner';

export default function ControleSafra() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: producer } = useAgriculturalProducerContext();

  // garante que nunca iremos chamar a API com id=0
  const producerId = useMemo(() => (producer?.id && producer.id > 0 ? producer.id : 0), [producer]);

  const {
    data: safrasList,
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['safras', producerId],
    queryFn: async () => {
      const res = await getSafrasByProducer(producerId);
      if (!res.isSuccess) throw new Error(res.errorMessage || 'Erro ao buscar safras');
      return res.response as SafraListItem[];
    },
    enabled: !!producerId && producerId > 0,
  });

  const handleDeleteSafra = async (safraId: number) => {
    if (!confirm('Deseja realmente excluir/desativar esta safra?')) return;
    const { isSuccess, errorMessage } = await deleteSafra(safraId);
    if (isSuccess) {
      queryClient.invalidateQueries({ queryKey: ['safras', producerId] });
    } else {
      toast.error(errorMessage || 'Falha ao excluir a safra.');
    }
  };

  const handleEditSafra = (safraId: number) => {
    router.push(`/cadastrarSafra/safraEditar?safraId=${safraId}`);
  };

  const handleViewControl = (safraId: number) => {
    router.push(`/controleSafra/controle/${safraId}`);
  };

  return (
    <main className="flex-1 h-[calc(100vh-60px)] mx-auto flex flex-col bg-gray-50">
      <PageTitle title="Controle De Safra" href="/" variant="center" />

      <div className="flex justify-center w-full py-4 border-b mb-3 bg-white">
        <Link href="/cadastrarSafra/safraCadastro">
          <Button
            variant="outline"
            className="border-green-700 text-green-700 py-7 px-4 bg-white hover:bg-green-50"
          >
            <Plus className="mr-2 h-5 w-5" />
            Adicionar Nova Safra
          </Button>
        </Link>
      </div>

      <div className="flex flex-col flex-1 gap-3 pb-4 px-3 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <SafraCardSkeleton key={i} />)
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !safrasList || safrasList.length === 0 ? (
          <EmptyState />
        ) : (
          safrasList.map((safra: SafraListItem) => (
            <SafraCard
              key={safra.id}
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
