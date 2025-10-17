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
  formatDateToBrazilian,
  mapStatusToDisplay,
} from '@/service/history';
import { useQuery } from '@tanstack/react-query';
import { useAgriculturalProducerContext } from '@/context/AgriculturalProducerContext';
import { HistoricoSafraCard } from './components/historyCard';
import { StatusType } from './components/statusBadge';
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
    // Não conta a busca como filtro
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  const getActiveFiltersDisplay = () => {
    const filters = [];
    if (appliedFilters.status) {
      const statusMap: Record<string, string> = {
        concluida: 'Concluído',
        ativa: 'Em Andamento',
        pausada: 'Desativado',
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
              className="px-3 py-2 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 relative"
              style={{ backgroundColor: '#38A068', fontSize: '11px' }}
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
          <SheetContent side="bottom" className="h-[50vh] pb-24 rounded-t-3xl">
            <SheetHeader className="pb-6">
              <SheetTitle>Filtros</SheetTitle>
              <SheetDescription>Configure os filtros para refinar sua pesquisa</SheetDescription>
            </SheetHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Dropdown
                  options={['Todos', 'Concluído', 'Em Andamento']}
                  value={statusFilter}
                  onChange={setStatusFilter}
                />
              </div>

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

              <div className="flex gap-2">
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
                  style={{ backgroundColor: '#38A068' }}
                  onClick={() => {
                    const filters: HarvestHistoryFilters = {};

                    // Map frontend status to backend status
                    if (statusFilter.selected && statusFilter.selected !== 'Todos') {
                      const statusMap: Record<string, string> = {
                        Concluído: 'concluida',
                        'Em Andamento': 'ativa',
                        Desativado: 'pausada',
                      };
                      filters.status = statusMap[statusFilter.selected];
                    }

                    if (safraInitialDate) {
                      filters.safraInitialDate = safraInitialDate;
                    }

                    if (safraEndDate) {
                      filters.safraEndDate = safraEndDate;
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

      {/* Área de filtros ativos */}
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
                <button
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
                  className="text-green-600 hover:text-green-800 w-4 h-4 flex items-center justify-center rounded-full hover:bg-green-200 transition-colors"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            {activeFilters.length > 1 && (
              <button
                onClick={() => {
                  setStatusFilter({ selected: '', open: false });
                  setSafraInitialDate('');
                  setSafraEndDate('');
                  setAppliedFilters({});
                }}
                className="bg-gray-100 border border-gray-300 rounded-full px-3 py-1 text-xs text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Limpar todos
              </button>
            )}
          </div>
        </div>
      )}

      <div className="px-2 space-y-3">
        {isLoading ? (
          <LoadingSkeleton count={3} />
        ) : isError ? (
          <ErrorMessage />
        ) : response?.isSuccess && response.response ? (
          (() => {
            if (response.response.length === 0) {
              return <EmptyState variant="filter" />;
            }

            return response.response.map((item) => {
              const statusDisplay = mapStatusToDisplay(item.status);
              return (
                <HistoricoSafraCard
                  key={item.safraId}
                  id={item.safraId}
                  name={item.safraName}
                  plantingDate={formatDateToBrazilian(item.safraInitialDate)}
                  harvestDate={formatDateToBrazilian(item.safraEndDate)}
                  status={statusDisplay as StatusType}
                  areaName={item.areas.map((area) => area.name).join(', ')}
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
