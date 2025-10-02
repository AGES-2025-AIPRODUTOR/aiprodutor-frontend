'use client';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Calendar, MapPin, Sprout, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '../../components/statusBadge';
import { PlantingCard } from './components/plantingCard';
import { getHarvestDetail } from '@/service/history';
import { useQuery } from '@tanstack/react-query';
import { ErrorMessage, SafraDetailSkeleton } from '@/components/SafraStates';
import { useAgriculturalProducerContext } from '@/context/AgriculturalProducerContext';
import { formatDateToBrazilian, mapStatusToDisplay } from '@/service/history';

const SafraDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { data: producerData } = useAgriculturalProducerContext();
  
  const safraId = params?.safraId || params?.id;
  const safraIdNumber = safraId ? Number(safraId) : null;

  const {
    data: response,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ['harvestDetail', producerData.id, safraIdNumber],
    queryFn: () => {
      if (!safraIdNumber) throw new Error('Safra ID is required');
      return getHarvestDetail(producerData.id ?? 1, safraIdNumber);
    },
    enabled: !!producerData.id && !!safraIdNumber,
  });

  if (isLoading) {
    return <SafraDetailSkeleton />;
  }

  if (isError || !response?.isSuccess) {
    return <ErrorMessage />;
  }

  const safra = response.response;

  if (!safra) {
    return (
      <div className="text-center py-8">
        <div className="flex flex-col items-center gap-3">
          <div className="text-gray-600">
            <p className="font-medium">A safra solicitada não foi encontrada.</p>
            <p className="text-sm text-gray-500 mt-1">Verifique se o ID está correto</p>
          </div>
          <Button
            variant="outline"
            className="mt-4 border-green-600 text-green-600 hover:bg-green-50"
            onClick={() => router.push('/historicoSafra')}
          >
            Voltar para Histórico de Safras
          </Button>
        </div>
      </div>
    );
  }

  const plantiosData = safra.planting.map((planting) => ({
    id: planting.id,
    name: `Plantio #${planting.id}`,
    initialDate: formatDateToBrazilian(planting.initialDate),
    finalDate: formatDateToBrazilian(planting.estimatedEndDate),
    expectedQuantity: planting.qtyEstimated,
    area: planting.areaName.join(', '),
  }));

  const dataInicio = formatDateToBrazilian(safra.safraInitialDate);
  const dataFim = formatDateToBrazilian(safra.safraEndDate);
  const areaNames = safra.areas.map(area => area.name).join(', ');
  const statusDisplay = mapStatusToDisplay(safra.status);

  return (
    <div className="min-h-screen bg-white px-2">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <ChevronLeft
              size={23}
              className="cursor-pointer"
              onClick={() => router.push('/historicoSafra')}
            />
            <h1 className="text-xl font-bold text-gray-900">{safra.safraName}</h1>
          </div>
          <StatusBadge status={statusDisplay} />
        </div>

        <div className="flex items-center gap-6 mb-3 text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar size={20} />
            <span style={{ fontSize: '14px' }}>
              {dataInicio} - {dataFim}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={20} />
            <span style={{ fontSize: '14px' }}>{areaNames}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-gray-700">
          <div className="flex items-center gap-2">
            <Sprout size={20} className="text-green-600" />
            <span style={{ fontSize: '16px', fontWeight: '600' }}>
              Plantios ({plantiosData.length})
            </span>
          </div>

          <Button
            className="px-3 py-2 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            style={{ backgroundColor: '#38A068', fontSize: '12px' }}
            onClick={() => {
              console.log('Navigate to map for areas:', areaNames);
              // Implementar navegação para o mapa
            }}
          >
            <Map size={16} />
            Ver no Mapa
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900" style={{ fontSize: '16px' }}>
            Plantios desta Safra
          </h3>
          {plantiosData.length > 0 ? (
            plantiosData.map((plantio) => (
              <PlantingCard key={plantio.id} planting={plantio} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum plantio cadastrado para esta safra</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SafraDetailPage;