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
import Dropdown from '../gerenciamentoArea/cadastroArea/dropdown';
import { getAllHistory, HistoryEntity, HistoryFilters } from '@/service/history';
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
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [appliedFilters, setAppliedFilters] = useState<HistoryFilters>({});

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
  });

  const historico: HistoryEntity[] = [
    {
      id: 1,
      nome: 'Safra de Soja',
      status: 'Concluído',
      dataColheita: '10/08/2025',
      dataPlantio: '01/03/2025',
      quantidadePlantada: '500kg',
      tamanho: 'Grande',
      nomeArea: 'Area 1',
    },
    {
      id: 2,
      nome: 'Safra de Milho',
      status: 'Em Andamento',
      dataPlantio: '05/03/2025',
      dataColheita: '12/09/2025',
      quantidadePlantada: '200kg',
      tamanho: 'Médio',
      nomeArea: 'Area 2',
    },
    {
      id: 3,
      nome: 'Safra de Arroz',
      status: 'Desativado',
      dataPlantio: '15/02/2025',
      dataColheita: '20/07/2025',
      quantidadePlantada: '300kg',
      tamanho: 'Médio',
      nomeArea: 'Area 3',
    },
    {
      id: 4,
      nome: 'Safra de Arroz',
      status: 'Desativado',
      dataPlantio: '15/02/2025',
      dataColheita: '20/07/2025',
      quantidadePlantada: '300kg',
      tamanho: 'Médio',
      nomeArea: 'Area 3',
    },
    {
      id: 5,
      nome: 'Safra de Arroz',
      status: 'Desativado',
      dataPlantio: '15/02/2025',
      dataColheita: '20/07/2025',
      quantidadePlantada: '300kg',
      tamanho: 'Médio',
      nomeArea: 'Area 3',
    },
    {
      id: 6,
      nome: 'Safra de Arroz',
      status: 'Desativado',
      dataPlantio: '15/02/2025',
      dataColheita: '20/07/2025',
      quantidadePlantada: '300kg',
      tamanho: 'Médio',
      nomeArea: 'Area 3',
    },
    {
      id: 7,
      nome: 'Safra de Arroz',
      status: 'Desativado',
      dataPlantio: '15/02/2025',
      dataColheita: '20/07/2025',
      quantidadePlantada: '300kg',
      tamanho: 'Médio',
      nomeArea: 'Area 3',
    },
    {
      id: 8,
      nome: 'Safra de Arroz',
      status: 'Desativado',
      dataPlantio: '15/02/2025',
      dataColheita: '20/07/2025',
      quantidadePlantada: '300kg',
      tamanho: 'Médio',
      nomeArea: 'Area 3',
    },
    {
      id: 9,
      nome: 'Safra de Arroz',
      status: 'Desativado',
      dataPlantio: '15/02/2025',
      dataColheita: '20/07/2025',
      quantidadePlantada: '300kg',
      tamanho: 'Médio',
      nomeArea: 'Area 3',
    },
  ];

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

              <div className="flex gap-2 ">
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
                    // rever como o backend espera o periodo
                    const filters: HistoryFilters = {};

                    if (statusFilter.selected && statusFilter.selected !== 'Todos') {
                      filters.status = statusFilter.selected as StatusType;
                    }

                    if (startDate && endDate) {
                      filters.period = `${startDate}_${endDate}`;
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
            const filteredResponse = response.response.filter((item) =>
              debouncedSearchValue
                ? item.nome.toLowerCase().includes(debouncedSearchValue.toLowerCase())
                : true
            );

            if (filteredResponse.length === 0 && debouncedSearchValue) {
              return <EmptyState variant="search" />;
            }

            if (filteredResponse.length === 0) {
              return <EmptyState variant="filter" />;
            }

            return filteredResponse.map((item) => (
              <HistoricoSafraCard
                key={item.id}
                id={item.id}
                name={item.nome}
                plantingDate={item.dataPlantio}
                harvestDate={item.dataColheita}
                status={item.status}
                areaName={item.nomeArea}
                onDetailsClick={handleDetailsClick}
              />
            ));
          })()
        ) : (
          // Remover isso aqui na integração com o backend
          (() => {
            const filteredHistorico = historico.filter((item) =>
              debouncedSearchValue
                ? item.nome.toLowerCase().includes(debouncedSearchValue.toLowerCase())
                : true
            );

            if (filteredHistorico.length === 0 && debouncedSearchValue) {
              return (
                <div className="text-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                      <Filter className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="text-gray-500">
                      <p className="font-medium">Nenhuma safra encontrada com esse nome</p>
                      <p className="text-sm mt-1">Tente pesquisar por outro nome</p>
                    </div>
                  </div>
                </div>
              );
            }

            return filteredHistorico.map((item) => (
              <HistoricoSafraCard
                key={item.id}
                id={item.id}
                name={item.nome}
                plantingDate={item.dataPlantio}
                harvestDate={item.dataColheita}
                status={item.status}
                areaName={item.nomeArea}
                onDetailsClick={handleDetailsClick}
              />
            ));
          })()
        )}
      </div>
    </div>
  );
};

export default Page;
