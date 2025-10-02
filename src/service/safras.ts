/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from '@/lib/api';
import { ResponseApi, handleAxiosError } from '@/lib/response';

// === Tipos usados na listagem ===
export interface SafraListItem {
  id: number;
  name: string;
  startDate?: string; // ISO
  endDate?: string;   // ISO
  status: string;
  producerId: number;
}

// === Tipos do create ===
export type CreatePlantingDTO = {
  name: string;
  plantingDate: string;          // "YYYY-MM-DD"
  expectedHarvestDate?: string;  // "YYYY-MM-DD"
  quantityPlanted: number;
  productId?: number;
  varietyId?: number;
  areaIds: number[];
};

export type CreateSafraDTO = {
  name: string;
  producerId: number;
  areaIds: number[];
  startDate: string;   // "YYYY-MM-DD"
  endDate?: string;    // "YYYY-MM-DD"
  status?: string;     // default "Ativa"
  plantings?: CreatePlantingDTO[];
};

// util: garante "YYYY-MM-DD" mesmo se vier ISO
const toYmd = (v?: string) => (v ? v.slice(0, 10) : undefined);

// === GET: safras em andamento por produtor ===
export async function getSafrasByProducer(
  producerId: number
): Promise<ResponseApi<SafraListItem[]>> {
  try {
    const { data } = await api.get(`/api/v1/harvests/${producerId}/in-progress`);
    const items: SafraListItem[] = data.map((s: any) => ({
      id: s.id,
      name: s.name,
      startDate: s.startDate,
      endDate: s.endDate,
      status: s.status,
      producerId: s.producerId ?? s.producer?.id,
    }));
    return { isSuccess: true, response: items };
  } catch (error) {
    return handleAxiosError(error);
  }
}

// === POST: criar safra ===
export async function createSafra(payload: CreateSafraDTO): Promise<ResponseApi<any>> {
  try {
    const body = {
      name: payload.name,
      producerId: payload.producerId,
      areaIds: payload.areaIds,
      startDate: toYmd(payload.startDate),
      endDate: toYmd(payload.endDate),
      status: payload.status ?? 'Ativa',
      plantings: (payload.plantings ?? []).map((p) => ({
        name: p.name,
        plantingDate: toYmd(p.plantingDate),
        expectedHarvestDate: toYmd(p.expectedHarvestDate),
        quantityPlanted: p.quantityPlanted,
        productId: p.productId,
        varietyId: p.varietyId,
        areaIds: p.areaIds,
      })),
    };

    const { data } = await api.post('/api/v1/harvests', body);
    return { isSuccess: true, response: data };
  } catch (error) {
    return handleAxiosError(error);
  }
}

// === DELETE: remover safra ===
export async function deleteSafra(id: number): Promise<ResponseApi<null>> {
  try {
    await api.delete(`/api/v1/harvests/${id}`);
    return { isSuccess: true, response: null };
  } catch (error) {
    return handleAxiosError(error);
  }
}
