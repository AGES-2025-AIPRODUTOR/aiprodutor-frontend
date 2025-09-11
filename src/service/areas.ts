import { api } from '@/lib/api';
import { handleAxiosError, ResponseApi } from '@/lib/response';

export interface AreasEntity {
  producerId: number;
  soilTypeId?: number;
  id: number;
  irrigationTypeId?: number;
  isActive: boolean;
  name: string;
  polygon: {
    type: string;
    coordinates: number[][][];
  };
  createdAt: string;
  updatedAt: string;
}

export interface SoilTypesEntity {
  id: number;
  name: string;
  description: string;
}

export interface IrrigationTypeEntity {
  id: number;
  name: string;
  description: string;
}

export type AreaCreate = Omit<AreasEntity, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> & {
  polygon: {
    type: 'Polygon';
    coordinates: number[][][];
  };
};

export interface AreaUpdate {
  name: string;
  soilTypeId: number;
  irrigationTypeId: number;
  isActive: boolean;
}

export const postArea = async (payload: AreaCreate): Promise<ResponseApi<AreasEntity>> => {
  try {
    const response = await api.post<AreasEntity>('/api/v1/areas', payload);
    return {
      isSuccess: true,
      response: response.data,
    };
  } catch (error) {
    console.error('Erro ao criar área');
    return handleAxiosError(error);
  }
};

export const getAllAreas = async (producerId: number): Promise<ResponseApi<AreasEntity[]>> => {
  try {
    const response = await api.get<AreasEntity[]>(`/api/v1/areas/produtor/${producerId}`);
    return {
      isSuccess: true,
      response: response.data,
    };
  } catch (error) {
    console.error('Erro ao buscar áreas');
    return handleAxiosError(error);
  }
};

export const getAllSoilTypes = async (): Promise<ResponseApi<SoilTypesEntity[]>> => {
  try {
    const response = await api.get<SoilTypesEntity[]>('/api/v1/soil-types');
    return {
      isSuccess: true,
      response: response.data,
    };
  } catch (error) {
    console.error('Error fetching soil types');
    return handleAxiosError(error);
  }
};

export const getAllIrrigationTypes = async (): Promise<ResponseApi<IrrigationTypeEntity[]>> => {
  try {
    const response = await api.get<IrrigationTypeEntity[]>('/api/v1/irrigation-types');
    return {
      isSuccess: true,
      response: response.data,
    };
  } catch (error) {
    console.error('Error fetching irrigation types');
    return handleAxiosError(error);
  }
};

export const getSoilTypeById = async (soilId: number): Promise<ResponseApi<SoilTypesEntity>> => {
  try {
    const response = await api.get<SoilTypesEntity>(`/api/v1/soil-types/${soilId}`);
    return {
      isSuccess: true,
      response: response.data,
    };
  } catch (error) {
    console.error('Erro ao buscar Solos');
    return handleAxiosError(error);
  }
};

export const getIrrigationTypeById = async (
  irrigationId: number
): Promise<ResponseApi<IrrigationTypeEntity>> => {
  try {
    const response = await api.get<IrrigationTypeEntity>(
      `/api/v1/irrigation-types/${irrigationId}`
    );
    return {
      isSuccess: true,
      response: response.data,
    };
  } catch (error) {
    console.error('Erro ao buscar Irrigações');
    return handleAxiosError(error);
  }
};

export const getAreaById = async (areaId: number): Promise<ResponseApi<AreasEntity>> => {
  try {
    const response = await api.get<AreasEntity>(`/api/v1/areas/${areaId}`);
    return {
      isSuccess: true,
      response: response.data,
    };
  } catch (error) {
    console.error('Erro ao buscar áreas');
    return handleAxiosError(error);
  }
};

export const deleteArea = async (areaId: number): Promise<ResponseApi<void>> => {
  try {
    await api.patch(`/api/v1/areas/${areaId}/status`, { isActive: false });
    return {
      isSuccess: true,
    };
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const editArea = async (
  areaId: number,
  payload: AreaUpdate
): Promise<ResponseApi<AreasEntity>> => {
  try {
    const response = await api.patch<AreasEntity>(`/api/v1/areas/${areaId}`, payload);
    return {
      isSuccess: true,
      response: response.data,
    };
  } catch (error) {
    console.error('Erro ao editar área');
    return handleAxiosError(error);
  }
};
