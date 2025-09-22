import { api } from '@/lib/api';
import { handleAxiosError, ResponseApi } from '@/lib/response';

export interface SafraEntity {
  safraId: number;
  safraName: string;
  safraInitialDate: string;
  safraEndDate: string;
}

export interface SafraControlEntity {
  producerId: number;
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  status: string;
  cycle: string;
  createdAt: string;
  updatedAt: string;
}

export const getAllSafras = async (producerId: number): Promise<ResponseApi<SafraEntity[]>> => {
  try {
    const response = await api.get<SafraEntity[]>(`/api/v1/safras/${producerId}/andamento`);

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
    const response = await api.get<SafraControlEntity>(`GET /api/v1/safras/${safraId}/painel`);
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
    await api.delete(`/api/v1/safras/${safraId}`);
    return {
      isSuccess: true,
    };
  } catch (error) {
    console.error('Erro ao excluir safra');
    return handleAxiosError(error);
  }
};
