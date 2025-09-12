'use client';
import { useQuery } from '@tanstack/react-query';
import AreaCard from './components/AreaCard';
import {
  AreasEntity,
  deleteArea,
  getAllAreas,
  getIrrigationTypeById,
  getSoilTypeById,
} from '@/service/areas';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import PageTitle from '../../components/PageTitle';
import { Plus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TooltipArrow } from '@radix-ui/react-tooltip';
import { useAgriculturalProducerContext } from '@/context/AgriculturalProducerContext';

export default function GerenciamentoArea() {
  const [areasList, setAreasList] = useState<AreasEntity[]>([]);
  const [soilTypes, setSoilTypes] = useState<{ [key: number]: string }>({});
  const [irrigationTypes, setIrrigationTypes] = useState<{ [key: number]: string }>({});
  const { data } = useAgriculturalProducerContext();

  const {
    data: response,
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['areas'],
    queryFn: () => getAllAreas(data?.id ?? 1),
  });

  const handleDeleteArea = async (areaId: number) => {
    const { isSuccess, errorMessage } = await deleteArea(areaId);
    if (isSuccess) {
      toast.success('Área Excluída com Sucesso.');
      refetch();
    } else {
      toast.error(errorMessage);
    }
  };

  const fetchSoilTypes = async (areas: AreasEntity[]) => {
    const soilTypesMap: { [key: number]: string } = {};

    for (const area of areas) {
      if (area.soilTypeId && !soilTypesMap[area.soilTypeId]) {
        try {
          const { isSuccess, response } = await getSoilTypeById(area.soilTypeId);

          if (isSuccess && response) {
            soilTypesMap[area.soilTypeId] = response.name || 'Tipo não definido';
          }
        } catch (error) {
          console.error(`Erro ao buscar tipo de solo ${area.soilTypeId}:`, error);
          soilTypesMap[area.soilTypeId] = 'Erro ao carregar';
        }
      }
    }
    setSoilTypes(soilTypesMap);
  };

  const fetchIrrigationType = async (areas: AreasEntity[]) => {
    const soilTypesMap: { [key: number]: string } = {};

    for (const area of areas) {
      if (area.irrigationTypeId && !soilTypesMap[area.irrigationTypeId]) {
        try {
          const { isSuccess, response } = await getIrrigationTypeById(area.irrigationTypeId);

          if (isSuccess && response) {
            soilTypesMap[area.irrigationTypeId] = response.name || 'Tipo não definido';
          }
        } catch (error) {
          console.error(`Erro ao buscar tipo de irrigação ${area.irrigationTypeId}:`, error);
          soilTypesMap[area.irrigationTypeId] = 'Erro ao carregar';
        }
      }
    }
    setIrrigationTypes(soilTypesMap);
  };

  useEffect(() => {
    if (response?.response) {
      setAreasList(response.response);
      fetchSoilTypes(response.response);
      fetchIrrigationType(response.response);
    }
  }, [response]);

  const AreaCardSkeleton = () => (
    <div className="flex flex-col gap-2 mx-3 p-4 border rounded-lg shadow-md">
      <div className="px-3">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-1" />
        <Skeleton className="h-4 w-2/3 mb-1" />
        <Skeleton className="h-4 w-1/3 mb-1" />
      </div>
      <div className="grid grid-flow-col grid-cols-2 w-full gap-2 mt-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );

  return (
    <main className="sm:max-w-7xl flex-1 h-[calc(100%-50px)] mx-auto flex flex-col">
      <PageTitle title={'Áreas Cadastradas'} href="/" variant={'center'} />

      {/* Ação: Adicionar Nova Área (com tooltip + navegação) */}
      <div className="flex justify-center w-full py-4 border-b mb-3">
        <TooltipProvider>
          <Tooltip open={areasList.length === 0 && !isLoading && !isError}>
            <TooltipTrigger asChild>
              <Link href="/gerenciamentoArea/desenharArea">
                <Button variant="outline" className="border-green-700 text-green-700 py-7 px-4">
                  <Plus className="mr-2 h-5 w-5" />
                  Adicionar Nova Área
                </Button>
              </Link>
            </TooltipTrigger>

            {areasList.length === 0 && !isLoading && !isError && (
              <TooltipContent
                side="bottom"
                align="center"
                sideOffset={8}
                className="bg-green-500 text-white border-none shadow-lg rounded-md px-4 py-8 max-w-[90vw]"
              >
                <TooltipArrow className="fill-green-800" />
                <p className="relative text-center text-sm z-10 break-words max-w-[90vw]">
                  Você ainda não possui nenhuma área cadastrada, clique em{' '}
                  <strong>Adicionar Nova Área</strong>
                </p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Lista de áreas (dinâmica) */}
      <div className="flex flex-col h-[calc(100%-50px)] gap-3 pb-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => <AreaCardSkeleton key={index} />)
          : areasList.map((area) => (
              <AreaCard
                key={area.id}
                areaName={area.name}
                soilType={area.soilTypeId ? soilTypes[area.soilTypeId] : 'Não definido'}
                irrigationType={
                  area.irrigationTypeId ? irrigationTypes[area.irrigationTypeId] : 'Não definido'
                }
                size="1 ha (10000m²)"
                handleDeleteArea={handleDeleteArea}
                areaId={area.id}
                soilTypeId={area.soilTypeId}
                irrigationTypeId={area.irrigationTypeId}
              />
            ))}
      </div>

      {/* Rodapé fixo: Visualizar no Mapa (apenas quando há áreas) */}
      {areasList.length > 0 && !isError && (
        <div className="sticky bottom-0 w-full px-6 py-5 bg-white border drop-shadow-2xl mt-auto">
          <Link href={'/gerenciamentoArea/editarArea/mapa'}>
            <Button
              className="w-full border-green-500 hover:bg-green-500 bg-green-500 active:bg-green-900 focus:bg-green-900 py-7"
              size={'lg'}
            >
              Visualizar no Mapa
            </Button>
          </Link>
        </div>
      )}
    </main>
  );
}
