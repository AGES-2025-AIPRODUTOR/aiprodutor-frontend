/* eslint-disable @typescript-eslint/no-explicit-any */
// src/service/plantios.ts
import { api } from '@/lib/api';
import { AxiosError } from 'axios';

// Se já tem esses tipos/utils num arquivo compartilhado, pode reaproveitar.
export interface ResponseApi<T> {
  isSuccess: boolean;
  errorMessage?: string;
  response?: T;
}
export function handleAxiosError(error: unknown): ResponseApi<never> {
  if (error instanceof AxiosError) {
    const errorMessage = (error.response?.data as any)?.message;
    return { isSuccess: false, errorMessage };
  }
  return { isSuccess: false, errorMessage: 'Por favor, tente novamente mais tarde' };
}

/** DTO vindo do back (ajuste campos se necessário) */
export type PlantioDTO = {
  id: number;
  name: string;
  plantingDate: string; // ISO
  expectedHarvestDate: string | null; // ISO | null
  quantityPlanted: number | null;
  productId?: number | null;
  varietyId?: number | null;
  areas?: Array<{ id: number; name: string }>;
};

export type PlantioUpdate = {
  // obrigatórios / esperados no PATCH do seu back:
  harvestId: number; // <-- ADICIONE
  areaId: number;

  // campos editáveis
  name: string;
  plantingDate: string; // "YYYY-MM-DD"
  expectedHarvestDate: string | null;
  quantityPlanted: number;

  // campos que o back pode exigir mesmo sem mudar
  productId?: number | null; // <-- ADICIONE
  varietyId?: number | null; // <-- ADICIONE
  quantityHarvested?: number | null; // <-- ADICIONE
};

/** GET /api/v1/plantings/{id} */
export async function getPlantioById(id: number): Promise<ResponseApi<PlantioDTO>> {
  try {
    const { data } = await api.get(`/api/v1/plantings/${id}`);
    return { isSuccess: true, response: data as PlantioDTO };
  } catch (e) {
    return handleAxiosError(e);
  }
}

export async function updatePlantio(
  id: number,
  payload: PlantioUpdate
): Promise<ResponseApi<void>> {
  try {
    await api.patch(`/api/v1/plantings/${id}`, {
      // garanta o shape que o back espera
      harvestId: payload.harvestId,
      areaId: payload.areaId,
      name: payload.name,
      productId: payload.productId ?? null,
      varietyId: payload.varietyId ?? null,
      plantingDate: payload.plantingDate,
      expectedHarvestDate: payload.expectedHarvestDate,
      quantityPlanted: payload.quantityPlanted,
      quantityHarvested: payload.quantityHarvested ?? null,
    });
    return { isSuccess: true };
  } catch (e) {
    return handleAxiosError(e);
  }
}

// aliases se quiser manter o naming antigo no resto do app
export const getPlantingById = getPlantioById;
export const updatePlanting = updatePlantio;
export type PlantingUpdate = PlantioUpdate;
