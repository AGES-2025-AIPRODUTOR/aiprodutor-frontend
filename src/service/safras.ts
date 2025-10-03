/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from '@/lib/api';
import { ResponseApi, handleAxiosError } from '@/lib/response';
import type { AreasEntity } from '@/service/areas';

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

// ====================================================================
// GET: safras em andamento por produtor
// ====================================================================
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

// ====================================================================
// POST: criar safra
// ====================================================================
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

// ====================================================================
// DELETE: remover safra
// ====================================================================
export async function deleteSafra(id: number): Promise<ResponseApi<null>> {
  try {
    await api.delete(`/api/v1/harvests/${id}`);
    return { isSuccess: true, response: null };
  } catch (error) {
    return handleAxiosError(error);
  }
}

// ====================================================================
// EDIT / VIEW: suporte ao fluxo de edição
// ====================================================================

// Plantio resumido exibido dentro da safra (editar safra)
export type PlantioEntity = {
  id: number;
  name?: string | null;
  plantingDate?: string | null;          // ISO
  expectedHarvestDate?: string | null;   // ISO
  quantityPlanted?: number | null;
  productId?: number | null;
  varietyId?: number | null;
  // pode vir mais coisa do back, mantemos o essencial
};

// Safra detalhada usada na tela de edição
export type SafraDetalhe = {
  id: number;
  nome: string;
  inicio: string;          // "YYYY-MM-DD"
  fim: string;             // "YYYY-MM-DD"
  areas: AreasEntity[];
  plantios: PlantioEntity[];
};

// GET /api/v1/harvests/{id}
export async function getSafraById(id: number): Promise<ResponseApi<SafraDetalhe>> {
  try {
    const { data } = await api.get(`/api/v1/harvests/${id}`);

    // Adaptador: normaliza os campos para o front
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
        varietyId: p.varietyId,
      })) as PlantioEntity[],
    };

    return { isSuccess: true, response: detalhe };
  } catch (error) {
    return handleAxiosError(error);
  }
}

// PATCH /api/v1/harvests/{id}
export async function updateSafra(
  id: number,
  payload: {
    name: string;
    startDate: string;        // "YYYY-MM-DD"
    endDate: string;          // "YYYY-MM-DD"
    areaIds: number[];
  }
): Promise<ResponseApi<void>> {
  try {
    const body = {
      name: payload.name,
      startDate: toYmd(payload.startDate),
      endDate: toYmd(payload.endDate),
      areaIds: payload.areaIds,
    };
    await api.patch(`/api/v1/harvests/${id}`, body);
    return { isSuccess: true };
  } catch (error) {
    return handleAxiosError(error);
  }
}

// DELETE /api/v1/plantings/{id}  (desativar/remover plantio)
// Se seu back usa PATCH para desativar, troque por PATCH + { isActive:false } aqui.
export async function deactivatePlantio(plantioId: number): Promise<ResponseApi<void>> {
  try {
    await api.delete(`/api/v1/plantings/${plantioId}`);
    return { isSuccess: true };
  } catch (error) {
    return handleAxiosError(error);
  }
}
