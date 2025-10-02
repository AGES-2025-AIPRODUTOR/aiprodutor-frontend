'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Filter } from 'lucide-react';
import PageTitle from '@/components/PageTitle';
import Dropdown from '../gerenciamentoArea/CadastroArea/dropdown';
import { 
  getAllHistory, 
  HarvestHistoryFilters,
  formatDateToBrazilian,
  mapStatusToDisplay,
  mapDisplayToStatus, 
  StatusType
} from '@/service/history';
import { useQuery } from '@tanstack/react-query';
import { useAgriculturalProducerContext } from '@/context/AgriculturalProducerContext';
import { HistoricoSafraCard } from './components/historyCard';
import { LoadingSkeleton, ErrorMessage, EmptyState } from '@/components/SafraStates';

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const Page = () => {
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<{ selected: string; open: boolean }>({
    selected: '',
    open: false,
  });
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [appliedFilters, setAppliedFilters] = useState<HarvestHistoryFilters>({});

  const { data } = useAgriculturalProducerContext();

  const debouncedSearchValue = useDebounce(searchValue, 500);

  const handleDetailsClick = (safraId: number) => {
    router.push(`/historicoSafra/safra/${safraId}`);
  };

  const {
    data: response,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ['history', data.id, appliedFilters],
    queryFn: () => {
      return getAllHistory(data.id ?? 1, appliedFilters);
    },
    enabled: !!data.id, 
  });

  return (
    <div className="min-h-screen bg-white p-2">
      <PageTitle title="Histórico de Safra" href="/" variant="center" />

      <div className="px-2 py-3 flex items-center gap-2">
        <Input
          placeholder="Pesquisar por nome da safra"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="flex-1"
          style={{ fontSize: '14px' }}
        />

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              className="px-3 py-2 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
              style={{ backgroundColor: '#38A068', fontSize: '11px' }}
            >
              <Filter size={16} />
              Filtros
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[50vh] pb-24 rounded-t-3xl">
            <SheetHeader className="pb-6">
              <SheetTitle>Filtros</SheetTitle>
              <SheetDescription>Configure os filtros para refinar sua pesquisa</SheetDescription>
            </SheetHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Dropdown
                  options={['Todos', 'Concluído', 'Em Andamento', 'Desativado']}
                  value={statusFilter}
                  onChange={setStatusFilter}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="start-date">Data de Início</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate || undefined}
                  className="text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">Data de Fim</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || undefined}
                  className="text-gray-400"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setStatusFilter({ selected: '', open: false });
                    setStartDate('');
                    setEndDate('');
                    setAppliedFilters({});
                  }}
                >
                  Limpar
                </Button>
                <Button
                  className="flex-1"
                  style={{ backgroundColor: '#38A068' }}
                  onClick={() => {
                    const filters: HarvestHistoryFilters = {};

                    // Map frontend status to backend status
                    if (statusFilter.selected && statusFilter.selected !== 'Todos') {
                      const statusMap: Record<string, StatusType> = {
                        'Concluído': 'Finalizada',
                        'Em Andamento': 'Ativa',
                        'Desativado': 'Pausada',
                      };
                      filters.status = statusMap[statusFilter.selected];
                    }

                    if (startDate) {
                      filters.startDate = startDate;
                    }

                    if (endDate) {
                      filters.endDate = endDate;
                    }

                    setAppliedFilters(filters);
                    setIsSheetOpen(false);
                  }}
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="px-2 space-y-3">
        {isLoading ? (
          <LoadingSkeleton count={3} />
        ) : isError ? (
          <ErrorMessage />
        ) : response?.isSuccess && response.response ? (
          (() => {
            // (frontend filtering)
            const filteredResponse = response.response.filter((item) =>
              debouncedSearchValue
                ? item.safraName.toLowerCase().includes(debouncedSearchValue.toLowerCase())
                : true
            );

            if (filteredResponse.length === 0 && debouncedSearchValue) {
              return <EmptyState variant="search" />;
            }

            if (filteredResponse.length === 0) {
              return <EmptyState variant="filter" />;
            }

            return filteredResponse.map((item) => {
              const statusDisplay = mapStatusToDisplay(item.status);
              return (
                <HistoricoSafraCard
                  key={item.safraId}
                  id={item.safraId}
                  name={item.safraName}
                  plantingDate={formatDateToBrazilian(item.safraInitialDate)}
                  harvestDate={formatDateToBrazilian(item.safraEndDate)}
                  status={statusDisplay as any} 
                  areaName={item.areas.map(area => area.name).join(', ')}
                  onDetailsClick={handleDetailsClick}
                />
              );
            });
          })()
        ) : (
          <EmptyState variant="filter" />
        )}
      </div>
    </div>
  );
};

export default Page;