import { api } from '@/lib/api';
import { handleAxiosError, ResponseApi } from '@/lib/response';

export type ProductorEntity = {
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

export const createProductor = async (data: ProductorEntity): Promise<ResponseApi<string>> => {
  try {
    const response = await api.post<string>('/api/v1/producers', {
      ...data,
    });
    return {
      response: response.data,
      isSuccess: true,
    };
  } catch (error) {
    return handleAxiosError(error);
  }
};
