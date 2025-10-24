import { api } from '@/lib/api';
import { handleAxiosError, ResponseApi } from '@/lib/response';

export type AgriculturalProducerEntity = {
  id?: number;
  name: string;
  document: string;
  phone: string;
  email: string;
  zipCode: string;
  city: string;
  street: string;
  number: string;
  complement?: string;
};

interface ProducerResponse {
  id: number;
  name: string;
  document: string;
  phone: string;
  email: string;
  zipCode: string;
  city: string;
  street: string;
  number: string;
  complement: string | null;
  createdAt: string;
  updatedAt: string;
}

export const createAgriculturalProducer = async (
  data: AgriculturalProducerEntity,
  setData: (data: AgriculturalProducerEntity) => void
): Promise<ResponseApi<ProducerResponse>> => {
  try {
    const response = await api.post<ProducerResponse>('/api/v1/producers', {
      ...data,
    });

    setData({
      id: response.data.id,
      name: response.data.name,
      document: response.data.document,
      phone: response.data.phone,
      email: response.data.email,
      zipCode: response.data.zipCode,
      city: response.data.city,
      street: response.data.street,
      number: response.data.number,
      complement: response.data.complement ?? '',
    });

    return {
      response: response.data,
      isSuccess: true,
    };
  } catch (error) {
    return handleAxiosError(error);
  }
};
