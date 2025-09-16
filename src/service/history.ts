import { StatusType } from '@/app/historicoSafra/components/statusBadge';
import { api } from '@/lib/api';
import { handleAxiosError, ResponseApi } from '@/lib/response';

// revisar nomes dos campos com o backend, os nomes do backend devem ser em inglês
export interface HistoryEntity {
  id: number;
  nome: string;
  dataPlantio: string;
  dataColheita: string;
  quantidadePlantada: string;
  tamanho: string;
  status: StatusType;
  nomeArea: string;
}

export interface HistoryFilters {
  status?: StatusType;
  period?: string;
}
// revisar nomes dos campos com o backend
export interface PlantingEntity {
  safraId: number;
  safraName: string;
  areaId: number;
  safraInitialDate: string;
  safraEndDate: string;
  areaName: string;
  status: StatusType;
  planting: {
    id: number;
    initialDate: string;
    estimatedEndDate: string;
    qtyEstimated: string;
    areaName: string[];
  }[];
}

export const getAllHistory = async (
  producerId: number,
  filters?: HistoryFilters
): Promise<ResponseApi<HistoryEntity[]>> => {
  try {
    const response = await api.get<HistoryEntity[]>(
      `/api/v1/safras/historico/produtor/${producerId}`,
      // alinhar com o backend os nomes dos filtros e a chamada com o backend
      { params: { ...filters } }
    );

    return {
      isSuccess: true,
      response: response.data,
    };
  } catch (error) {
    console.error('Erro ao buscar histórico de safras');
    return handleAxiosError(error);
  }
};

export const getPlantingBySafraId = async (
  plantinId: number
): Promise<ResponseApi<PlantingEntity>> => {
  try {
    // alinhar com o backend a url e os parametros
    const response = await api.get<PlantingEntity>(
      `/api/v1/safras/historico/produtor/${plantinId}`
    );

    return {
      isSuccess: true,
      response: response.data,
    };
  } catch (error) {
    console.error('Erro ao buscar plantio por safra');
    return handleAxiosError(error);
  }
};
