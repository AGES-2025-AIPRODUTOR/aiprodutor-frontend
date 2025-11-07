/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from '@/lib/api';
import { ResponseApi, handleAxiosError } from '@/lib/response';
import type { AreasEntity } from '@/service/areas';

// ===== Listagem =====
export interface SafraListItem {
  id: number;
  name: string;
  startDate?: string;
  endDate?: string;
  status: string;
  producerId: number;
}

// util: se quiser garantir "YYYY-MM-DD"
const toYmd = (v?: string) => (v ? v.slice(0, 10) : undefined);

// ===== GET por produtor =====
export async function getSafrasByProducer(
  producerId: number
): Promise<ResponseApi<SafraListItem[]>> {
  try {
    const { data } = await api.get(`/api/v1/harvests/${producerId}/in-progress`);
    const items: SafraListItem[] = (data || []).map((s: any) => ({
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

// tipos do create
export type CreatePlantingDTO = {
  name: string;
  plantingDate: string;
  expectedHarvestDate?: string;
  quantityPlanted: number;
  productId?: number;
  areaIds: number[];
};

export type CreateSafraDTO = {
  name: string;
  producerId: number;
  startDate: string;
  endDate?: string;
  status?: 'in_progress' | 'completed' | 'cancelled';
  plantings: CreatePlantingDTO[];
};

// POST: criar safra
export async function createSafra(payload: CreateSafraDTO): Promise<ResponseApi<any>> {
  try {
    const { data } = await api.post('/api/v1/harvests', {
      name: payload.name,
      producerId: payload.producerId,
      startDate: payload.startDate,
      endDate: payload.endDate,
      status: payload.status ?? 'in_progress',
      plantings: payload.plantings.map((p) => ({
        name: p.name,
        plantingDate: p.plantingDate,
        expectedHarvestDate: p.expectedHarvestDate,
        quantityPlanted: p.quantityPlanted,
        productId: p.productId,
        areaIds: p.areaIds, // conforme combinamos com o back
      })),
    });
    return { isSuccess: true, response: data };
  } catch (error) {
    return handleAxiosError(error); // retorna ResponseApi<any>
  }
}

// ===== demais (inalterados) =====
export type PlantioEntity = {
  id: number;
  name?: string | null;
  plantingDate?: string | null;
  expectedHarvestDate?: string | null;
  quantityPlanted?: number | null;
  productId?: number | null;
};

export type SafraDetalhe = {
  id: number;
  nome: string;
  inicio: string;
  fim: string;
  areas: AreasEntity[];
  plantios: PlantioEntity[];
};

export async function getSafraById(id: number): Promise<ResponseApi<SafraDetalhe>> {
  try {
    const { data } = await api.get(`/api/v1/harvests/${id}`);
    const detalhe: SafraDetalhe = {
      id: data.id,
      nome: data.name ?? data.nome ?? '',
      inicio: (data.startDate ?? data.harvestInitialDate ?? '').slice(0, 10),
      fim: (data.endDate ?? data.harvestEndDate ?? '').slice(0, 10),
      areas: (data.areas ?? []).map((a: any) => ({
        id: a.id,
        name: a.name,
        areaM2: a.areaM2,
        color: a.color,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        producerId: a.producerId,
        soilTypeId: a.soilTypeId,
        irrigationTypeId: a.irrigationTypeId,
        isActive: a.isActive,
        polygon: a.polygon,
      })) as AreasEntity[],
      plantios: (data.plantings ?? []).map((p: any) => ({
        id: p.id,
        name: p.name,
        plantingDate: p.plantingDate,
        expectedHarvestDate: p.expectedHarvestDate,
        quantityPlanted: p.quantityPlanted,
        productId: p.productId,
      })) as PlantioEntity[],
    };
    return { isSuccess: true, response: detalhe };
  } catch (error) {
    return handleAxiosError(error);
  }
}

// antes: updateSafra(id, { name, startDate, endDate, areaIds })
export async function updateSafra(
  id: number,
  payload: { name: string; startDate: string; endDate: string }
): Promise<ResponseApi<void>> {
  try {
    const body = {
      name: payload.name,
      startDate: payload.startDate,
      endDate: payload.endDate,
    };
    await api.patch(`/api/v1/harvests/${id}`, body);
    return { isSuccess: true };
  } catch (error) {
    return handleAxiosError(error);
  }
}

export async function deleteSafra(id: number): Promise<ResponseApi<null>> {
  try {
    await api.delete(`/api/v1/harvests/${id}`);
    return { isSuccess: true, response: null };
  } catch (error) {
    return handleAxiosError(error);
  }
}

export async function deactivatePlantio(plantioId: number): Promise<ResponseApi<void>> {
  try {
    await api.delete(`/api/v1/plantings/${plantioId}`);
    return { isSuccess: true };
  } catch (error) {
    return handleAxiosError(error);
  }
}
