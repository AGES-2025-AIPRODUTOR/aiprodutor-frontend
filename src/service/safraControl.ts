import { api } from '@/lib/api';
import { handleAxiosError, ResponseApi } from '@/lib/response';

export interface SafraEntity {
  safraId: number;
  safraName: string;
  safraInitialDate: string;
  safraEndDate: string;
}

export interface SafraControlEntity {
  generalInfo: {
    name: string;
    area_count: number;
    total_area: number;
    cultivar: string;
    expected_yield: number;
    harvest_end_date: string;
    harvest_start_date: string;
    linked_plantings: [PlantingControlEntity];
  };
}

export interface PlantingControlEntity {
  estimated_harvest_date: string;
  expected_yield: number;
  planting_area: string;
  planting_date: string;
  planting_name: string;
}

export const getAllSafras = async (producerId: number): Promise<ResponseApi<SafraEntity[]>> => {
  try {
    const response = await api.get<SafraEntity[]>(`/api/v1/harvests/${producerId}/andamento`);

    return {
      isSuccess: true,
      response: response.data,
    };
  } catch (error) {
    console.error(error);
    return handleAxiosError(error);
  }
};

export const getSafraById = async (safraId: number): Promise<ResponseApi<SafraControlEntity>> => {
  try {
    const response = await api.get<SafraControlEntity>(`/api/v1/harvests/${safraId}/panel`);
    return {
      isSuccess: true,
      response: response.data,
    };
  } catch (error) {
    console.error('Erro ao buscar safra');
    return handleAxiosError(error);
  }
};

export const deleteSafra = async (safraId: number): Promise<ResponseApi<void>> => {
  try {
    await api.delete(`/api/v1/harvests/${safraId}`);
    return {
      isSuccess: true,
    };
  } catch (error) {
    console.error('Erro ao excluir safra');
    return handleAxiosError(error);
  }
};
