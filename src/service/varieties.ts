import { api } from '@/lib/api';
import { ResponseApi, handleAxiosError } from '@/lib/response';

export type Variety = {
  id: number;
  name: string;
  productId: number;
};

export async function getVarieties(): Promise<ResponseApi<Variety[]>> {
  try {
    const { data } = await api.get('/api/v1/varieties');
    return { isSuccess: true, response: data as Variety[] };
  } catch (error) {
    return handleAxiosError(error);
  }
}

// (opcional) caso queira pedir por produto direto
export async function getVarietiesByProduct(productId: number): Promise<ResponseApi<Variety[]>> {
  try {
    const { data } = await api.get(`/api/v1/varieties/produto/${productId}`);
    return { isSuccess: true, response: data as Variety[] };
  } catch (error) {
    return handleAxiosError(error);
  }
}
