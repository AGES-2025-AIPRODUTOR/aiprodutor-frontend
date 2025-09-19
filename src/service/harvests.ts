import { api } from '@/lib/api';
import { handleAxiosError, ResponseApi } from '@/lib/response';

export interface HarvestsEntity {
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


export const getAllHarvests = async (producerId: number): Promise<ResponseApi<HarvestsEntity[]>> => {
  try {
    const response = await api.get<HarvestsEntity[]>(`/api/v1/safras/{id}/painel/produtor/${producerId}`);

    return {
      isSuccess: true,
      response: response.data,
    };
  } catch (error) {
    console.error('Erro ao buscar safras');
    return handleAxiosError(error);
  }
};