import { api } from '@/lib/api';
import { ResponseApi, handleAxiosError } from '@/lib/response';

export type Product = {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function getProducts(): Promise<ResponseApi<Product[]>> {
  try {
    const { data } = await api.get('/api/v1/products');
    // Swagger já retorna [{ id, name, ... }]
    return { isSuccess: true, response: data as Product[] };
  } catch (error) {
    return handleAxiosError(error);
  }
}
