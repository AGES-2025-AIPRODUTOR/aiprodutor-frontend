'use client';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Calendar, MapPin, Sprout, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge, StatusType } from '../../components/statusBadge';
import { PlantingCard } from './components/plantingCard';
import { getPlantingBySafraId } from '@/service/history';
import { useQuery } from '@tanstack/react-query';
import { ErrorMessage, SafraDetailSkeleton } from '@/components/SafraStates';

// Mock data - remover depois da integração com a api
const getSafraById = (id: string) => {
  const safras = [
    {
      id: 1,
      nome: 'Safra de Soja',
      status: 'Concluído' as StatusType,
      dataColheita: '10/08/2025',
      dataPlantio: '01/03/2025',
      quantidadePlantada: '500kg',
      tamanho: 'Grande',
      nomeArea: 'Area 1',
      descricao: 'Safra de soja da temporada 2025, cultivada na área principal da propriedade.',
      variedade: 'Soja BRS 123',
      produtividade: '3.2 ton/ha',
      investimento: 'R$ 15.000,00',
      receita: 'R$ 28.500,00',
      lucro: 'R$ 13.500,00',
    },
    {
      id: 2,
      nome: 'Safra de Milho',
      status: 'Em Andamento' as StatusType,
      dataPlantio: '05/03/2025',
      dataColheita: '12/09/2025',
      quantidadePlantada: '200kg',
      tamanho: 'Médio',
      nomeArea: 'Area 2',
      descricao: 'Safra de milho em desenvolvimento, com previsão de colheita para setembro.',
      variedade: 'Milho Híbrido AG 9030',
      produtividade: 'Em desenvolvimento',
      investimento: 'R$ 8.000,00',
      receita: 'Previsto: R$ 18.000,00',
      lucro: 'Previsto: R$ 10.000,00',
    },
    {
      id: 3,
      nome: 'Safra de Arroz',
      status: 'Desativado' as StatusType,
      dataPlantio: '15/02/2025',
      dataColheita: '20/07/2025',
      quantidadePlantada: '300kg',
      tamanho: 'Médio',
      nomeArea: 'Area 3',
      descricao: 'Safra de arroz interrompida devido a problemas climáticos.',
      variedade: 'Arroz IRGA 424',
      produtividade: 'Não concluído',
      investimento: 'R$ 12.000,00',
      receita: 'R$ 0,00',
      lucro: 'R$ -12.000,00',
    },
  ];

  return safras.find((safra) => safra.id === parseInt(id));
};

const SafraDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { isError, isLoading } = useQuery({
    queryKey: ['historyPlanting', id],
    queryFn: () => {
      return getPlantingBySafraId(parseInt(id) ?? 1);
    },
  });

  const safra = getSafraById(id);

  if (isLoading) {
    return <SafraDetailSkeleton />;
  }

  if (isError) {
    return <ErrorMessage />;
  }

  if (!safra) {
    return (
      <div className="text-center py-8 ">
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

  // Mock plantio data para os plantios
  const plantiosData = [
    {
      id: 1,
      name: 'Soja com Trigo',
      initialDate: safra.dataPlantio,
      finalDate: safra.dataColheita,
      expectedQuantity: safra.quantidadePlantada,
      area: safra.nomeArea,
    },
    {
      id: 2,
      name: 'Plantio Teste - Milho',
      initialDate: '15/03/2025',
      finalDate: '20/08/2025',
      expectedQuantity: '300kg',
      area: 'Área Sul',
    },
  ];

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
            <h1 className="text-xl font-bold text-gray-900">{safra.nome}</h1>
          </div>
          <StatusBadge status={safra.status} />
        </div>

        <div className="flex items-center gap-6 mb-3 text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar size={20} />
            <span style={{ fontSize: '14px' }}>
              {safra.dataPlantio} - {safra.dataColheita}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={20} />
            <span style={{ fontSize: '14px' }}>{safra.nomeArea}</span>
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
              console.log('Navigate to map for area:', safra.nomeArea);
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
          {plantiosData.map((plantio) => (
            <PlantingCard key={plantio.id} planting={plantio} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SafraDetailPage;
