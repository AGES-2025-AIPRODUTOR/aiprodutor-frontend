import { api } from '../lib/api'; 

// Tipos exatamente como o Swagger retorna
export type ProducerAPI = {
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
};

export async function getAllProducers() {
  try {
    const { data } = await api.get<ProducerAPI[]>('/api/v1/producers');
    return { isSuccess: true as const, response: data };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    const msg =
      err?.response?.data?.message ?? err?.message ?? 'Falha ao buscar produtores';
    return { isSuccess: false as const, errorMessage: msg };
  }
}
