/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from '@/lib/api';
import { ResponseApi, handleAxiosError } from '@/lib/response';
import type { AreasEntity } from '@/service/areas';
import { getAllAreas } from '@/service/areas';

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
function normalizePolygon(a: any) {
  const poly = a?.polygon ?? a?.geometry ?? (typeof a?.polygonJson === 'string' ? JSON.parse(a.polygonJson) : null);
  if (poly?.type === 'MultiPolygon' && Array.isArray(poly.coordinates) && poly.coordinates.length > 0) {
    // Usa o primeiro polígono do multipolígono
    return { type: 'Polygon', coordinates: poly.coordinates[0] };
  }
  return poly ?? null;
}

export async function getSafraById(id: number): Promise<ResponseApi<SafraDetalhe>> {
  try {
    const { data } = await api.get(`/api/v1/harvests/${id}`);
    const detalhe: SafraDetalhe = {
      id: data.id,
      nome: data.name ?? data.nome ?? '',
      inicio: (data.startDate ?? data.harvestInitialDate ?? '').slice(0, 10),
      fim: (data.endDate ?? data.harvestEndDate ?? '').slice(0, 10),
      // Une áreas do topo (se existir) com áreas vindas de cada plantio
      areas: (() => {
        const topAreas: any[] = Array.isArray(data.areas) ? data.areas : [];

        const fromPlantings: any[] = Array.isArray(data.plantings)
          ? data.plantings.flatMap((p: any) => (Array.isArray(p.areas) ? p.areas : []))
          : [];

        // dedup por id (preferindo o objeto mais “completo” se houver)
        const map = new Map<number, any>();
        [...topAreas, ...fromPlantings].forEach((a: any) => {
          if (!a || typeof a.id !== 'number') return;
          const prev = map.get(a.id) || {};
          map.set(a.id, { ...prev, ...a });
        });

        return Array.from(map.values()).map((a: any) => ({
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
          polygon: a.polygon ?? null,
        })) as AreasEntity[];
      })(),

      plantios: (data.plantings ?? []).map((p: any) => ({
        id: p.id,
        name:
          typeof p.name === 'string' && p.name.trim().length > 0
            ? p.name.trim()
            : p.product?.name
              ? `Plantio de ${p.product.name}`
              : `Plantio #${p.id}`,

        plantingDate: p.plantingDate,
        expectedHarvestDate: p.expectedHarvestDate,

        quantityPlanted: p.quantityPlanted ?? null,
        productId: p.productId ?? p.product?.id ?? null,
      })) as PlantioEntity[],
    };
    return { isSuccess: true, response: detalhe };
  } catch (error) {
    return handleAxiosError(error);
  }
}

export async function updateSafra(
  id: number,
  payload: {
    name: string;
    startDate: string;
    endDate: string;
    status?: 'in_progress' | 'completed' | 'cancelled';
  }
): Promise<ResponseApi<void>> {
  try {
    const body = {
      name: payload.name,
      startDate: payload.startDate,
      endDate: payload.endDate,
      status: payload.status ?? 'in_progress',
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
