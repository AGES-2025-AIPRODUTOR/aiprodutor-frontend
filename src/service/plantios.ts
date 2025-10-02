import { api } from '@/lib/api';
import { handleAxiosError, ResponseApi } from '@/lib/response';

/** Entities retornadas pelo GET da API */
export interface PlantingArea {
  id: number;
  name: string;
  areaM2?: string;
  color?: string;
  producerId: number;
  soilTypeId?: number;
  irrigationTypeId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductEntity {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface VarietyEntity {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  productId: number;
}

export interface PlantingEntity {
  id: number;
  harvestId: number;
  name: string;

  plantingDate: string;          // ISO: "YYYY-MM-DD" ou "YYYY-MM-DDTHH:mm:ssZ"
  plantingEndDate?: string | null;
  expectedHarvestDate?: string | null;

  quantityPlanted: number;
  quantityHarvested?: number | null;

  productId: number;
  varietyId: number;

  createdAt: string;
  updatedAt: string;

  // campos “expand” que a API pode enviar:
  areas?: PlantingArea[];
  product?: ProductEntity;
  variety?: VarietyEntity;
}

/** Payloads conforme Swagger */
export type PlantingCreate = {
  harvestId: number;
  /** Swagger mostra `areaId` singular no POST */
  areaId: number;
  name: string;
  productId: number;
  varietyId: number;
  plantingDate: string;            // "YYYY-MM-DD"
  plantingEndDate?: string | null; // opcional
  expectedHarvestDate?: string | null; // opcional
  quantityPlanted: number;
  quantityHarvested?: number | null;   // opcional
};

export type PlantingUpdate = Partial<
  Omit<PlantingCreate, 'harvestId'>
> & { areaId?: number };

/* -----------------------------
 * Calls
 * ----------------------------*/
const BASE = '/api/v1/plantings';

/** POST /api/v1/plantings */
export async function createPlanting(
  payload: PlantingCreate
): Promise<ResponseApi<PlantingEntity>> {
  try {
    const { data } = await api.post<PlantingEntity>(BASE, payload);
    return { isSuccess: true, response: data };
  } catch (err) {
    return handleAxiosError(err);
  }
}

/** GET /api/v1/plantings */
export async function getAllPlantings(): Promise<ResponseApi<PlantingEntity[]>> {
  try {
    const { data } = await api.get<PlantingEntity[]>(BASE);
    return { isSuccess: true, response: data };
  } catch (err) {
    return handleAxiosError(err);
  }
}

/** GET /api/v1/plantings/produto/{productId} */
export async function getPlantingsByProduct(
  productId: number
): Promise<ResponseApi<PlantingEntity[]>> {
  try {
    const { data } = await api.get<PlantingEntity[]>(
      `${BASE}/produto/${productId}`
    );
    return { isSuccess: true, response: data };
  } catch (err) {
    return handleAxiosError(err);
  }
}

/** GET /api/v1/plantings/{id} */
export async function getPlantingById(
  id: number
): Promise<ResponseApi<PlantingEntity>> {
  try {
    const { data } = await api.get<PlantingEntity>(`${BASE}/${id}`);
    return { isSuccess: true, response: data };
  } catch (err) {
    return handleAxiosError(err);
  }
}

/** PATCH /api/v1/plantings/{id} */
export async function updatePlanting(
  id: number,
  payload: PlantingUpdate
): Promise<ResponseApi<PlantingEntity>> {
  try {
    const { data } = await api.patch<PlantingEntity>(`${BASE}/${id}`, payload);
    return { isSuccess: true, response: data };
  } catch (err) {
    return handleAxiosError(err);
  }
}

/** DELETE /api/v1/plantings/{id} */
export async function deletePlanting(
  id: number
): Promise<ResponseApi<void>> {
  try {
    await api.delete(`${BASE}/${id}`);
    return { isSuccess: true };
  } catch (err) {
    return handleAxiosError(err);
  }
}

/* ------------------------------------
 * Compatibilidade com páginas existentes
 * (podes importar esses nomes se já estiverem no código)
 * ------------------------------------*/
export const getPlantioById = getPlantingById;
export const updatePlantio = updatePlanting;
export type PlantioEntity = PlantingEntity;
export type PlantioUpdate = PlantingUpdate;
export type PlantioCreate = PlantingCreate;
