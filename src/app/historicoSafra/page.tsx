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
import { Filter, X } from 'lucide-react';
import PageTitle from '@/components/PageTitle';
import Dropdown from '../gerenciamentoArea/cadastroArea/dropdown';
import {
  getAllHistory,
  HarvestHistoryFilters,
  mapStatusToDisplay,
  HarvestHistoryItem,
} from '@/service/history';
import { useQuery } from '@tanstack/react-query';
import { useAgriculturalProducerContext } from '@/context/AgriculturalProducerContext';
import { HistoricoSafraCard } from './components/historyCard';
import { LoadingSkeleton, ErrorMessage, EmptyState } from '@/components/SafraStates';

type HarvestHistoryDisplayItem = Omit<HarvestHistoryItem, 'status'> & {
  status: string;
};

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
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
  const [safraInitialDate, setSafraInitialDate] = useState<string>('');
  const [safraEndDate, setSafraEndDate] = useState<string>('');
  const [appliedFilters, setAppliedFilters] = useState<HarvestHistoryFilters>({});

  const { data } = useAgriculturalProducerContext();
  const debouncedSearchValue = useDebounce(searchValue, 500);

  const handleDetailsClick = (safraId: number) => {
    router.push(`/historicoSafra/safra/${safraId}`);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (appliedFilters.status) count++;
    if (appliedFilters.safraInitialDate) count++;
    if (appliedFilters.safraEndDate) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  const getActiveFiltersDisplay = () => {
    const filters = [];
    if (appliedFilters.status) {
      const statusMap: Record<string, string> = {
        completed: 'Concluído',
        in_progress: 'Em Andamento',
        cancelled: 'Desativado',
      };
      filters.push({
        label: 'Status',
        value: statusMap[appliedFilters.status] || appliedFilters.status,
      });
    }
    if (appliedFilters.safraInitialDate) {
      filters.push({
        label: 'Data Início',
        value: new Date(appliedFilters.safraInitialDate).toLocaleDateString('pt-BR'),
      });
    }
    if (appliedFilters.safraEndDate) {
      filters.push({
        label: 'Data Fim',
        value: new Date(appliedFilters.safraEndDate).toLocaleDateString('pt-BR'),
      });
    }
    return filters;
  };

  const activeFilters = getActiveFiltersDisplay();

  const {
    data: response,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ['history', data.id, appliedFilters, debouncedSearchValue],
    queryFn: () => {
      const filters = {
        ...appliedFilters,
        ...(debouncedSearchValue.trim() && { safraName: debouncedSearchValue.trim() }),
      };
      return getAllHistory(data.id ?? 1, filters);
    },
    enabled: !!data.id,
  });

  return (
    <div className="min-h-full bg-white p-2">
      <PageTitle title="Histórico de Safra" href="/" variant="center" />

      {/* Campo de busca e botão de filtros */}
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
              className="px-3 py-2 text-white font-medium rounded-lg flex items-center gap-2 relative"
              style={{ fontSize: '11px' }}
            >
              <Filter size={16} />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>

          <SheetContent side="bottom" className="h-[50vh] pb-24 rounded-t-3xl relative">
            <SheetHeader className="pb-6">
              <SheetTitle>Filtros</SheetTitle>
              <SheetDescription>Configure os filtros para refinar sua pesquisa</SheetDescription>
            </SheetHeader>

            <div className="space-y-6 overflow-y-auto pb-28">
              {/* STATUS */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Dropdown
                  options={['Todos', 'Concluído', 'Em Andamento', 'Desativado']}
                  value={statusFilter}
                  onChange={setStatusFilter}
                />
              </div>

              {/* DATA INICIAL */}
              <div className="space-y-2">
                <Label htmlFor="safra-initial-date">Data Inicial da Safra</Label>
                <Input
                  id="safra-initial-date"
                  type="date"
                  value={safraInitialDate}
                  onChange={(e) => setSafraInitialDate(e.target.value)}
                  max={safraEndDate || undefined}
                  className="text-gray-400"
                />
              </div>

              {/* DATA FINAL */}
              <div className="space-y-2">
                <Label htmlFor="safra-end-date">Data Final da Safra</Label>
                <Input
                  id="safra-end-date"
                  type="date"
                  value={safraEndDate}
                  onChange={(e) => setSafraEndDate(e.target.value)}
                  min={safraInitialDate || undefined}
                  className="text-gray-400"
                />
              </div>
            </div>

            {/* BOTÕES FIXOS */}
            <div className="flex gap-2 fixed md:static bottom-0 left-0 w-full bg-white p-4 md:p-0 border-t md:border-0 border-gray-200">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setStatusFilter({ selected: '', open: false });
                  setSafraInitialDate('');
                  setSafraEndDate('');
                  setAppliedFilters({});
                }}
              >
                Limpar
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  const filters: HarvestHistoryFilters = {};

                  if (statusFilter.selected && statusFilter.selected !== 'Todos') {
                    const statusMap: Record<string, string> = {
                      Concluído: 'completed',
                      'Em Andamento': 'in_progress',
                      Desativado: 'cancelled',
                    };
                    filters.status = statusMap[statusFilter.selected];
                  }

                  if (safraInitialDate) filters.safraInitialDate = safraInitialDate;
                  if (safraEndDate) filters.safraEndDate = safraEndDate;

                  setAppliedFilters(filters);
                  setIsSheetOpen(false);
                }}
              >
                Aplicar
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* FILTROS APLICADOS */}
      {activeFilters.length > 0 && (
        <div className="px-2 pb-3">
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <div
                key={index}
                className="bg-green-50 border border-green-200 rounded-full px-3 py-1 flex items-center gap-2"
              >
                <span className="text-green-700 text-xs font-medium">
                  {filter.label}: {filter.value}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (filter.label === 'Status') {
                      setStatusFilter({ selected: '', open: false });
                      const newFilters = { ...appliedFilters };
                      delete newFilters.status;
                      setAppliedFilters(newFilters);
                    } else if (filter.label === 'Data Início') {
                      setSafraInitialDate('');
                      const newFilters = { ...appliedFilters };
                      delete newFilters.safraInitialDate;
                      setAppliedFilters(newFilters);
                    } else if (filter.label === 'Data Fim') {
                      setSafraEndDate('');
                      const newFilters = { ...appliedFilters };
                      delete newFilters.safraEndDate;
                      setAppliedFilters(newFilters);
                    }
                  }}
                  className="w-4 h-4 p-0 text-green-600 hover:text-green-800 hover:bg-green-200 rounded-full"
                >
                  <X size={10} />
                </Button>
              </div>
            ))}
            {activeFilters.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter({ selected: '', open: false });
                  setSafraInitialDate('');
                  setSafraEndDate('');
                  setAppliedFilters({});
                }}
                className="rounded-full text-xs"
              >
                Limpar todos
              </Button>
            )}
          </div>
        </div>
      )}

      {/* LISTAGEM */}
      <div className="px-2 space-y-3">
        {isLoading ? (
          <LoadingSkeleton count={3} />
        ) : isError ? (
          <ErrorMessage />
        ) : response?.isSuccess && response.response ? (
          response.response.length === 0 ? (
            <EmptyState variant="filter" />
          ) : (
            response.response.map((item) => (
              <HistoricoSafraCard
                key={item.safraId}
                safra={
                  {
                    ...item,
                    status: mapStatusToDisplay(item.status),
                  } as HarvestHistoryDisplayItem
                }
                onDetailsClick={handleDetailsClick}
              />
            ))
          )
        ) : (
          <EmptyState variant="filter" />
        )}
      </div>
    </div>
  );
};

export default Page;
