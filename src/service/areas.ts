import { api } from '@/lib/api';
import { handleAxiosError, ResponseApi } from '@/lib/response';

export interface AreasEntity {
  // Trabalhar na entidade de resposta e colocar no retorno da promise
}

export const getAllAreas = async (produtorId: Number): Promise<ResponseApi<AreasEntity[]>> => {
  try {
    const response = await api.get<AreasEntity[]>(`/api/v1/produtores/${produtorId}/areas`);
    return {
      isSuccess: true,
      response: response.data,
    };
  } catch (error) {
    console.error('Erro ao buscar áreas');
    return handleAxiosError(error);
  }
};

export const getArea = async (areaId: Number): Promise<ResponseApi<AreasEntity>> => {
  try {
    const response = await api.get<AreasEntity[]>(`/api/v1/areas/${areaId}`);
    return {
      isSuccess: true,
      response: response.data,
    };
  } catch (error) {
    console.error('Erro ao buscar áreas');
    return handleAxiosError(error);
  }
};

export const deleteArea = async (areaId: Number): Promise<ResponseApi<void>> => {
  try {
    (await api.patch(`/api/v1/areas/${areaId}/status`), { ativo: false });
    return {
      isSuccess: true,
    };
  } catch (error) {
    return handleAxiosError(error);
  }
};
