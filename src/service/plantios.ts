/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from '@/lib/api';
import { AxiosError } from 'axios';

/** ---- Tipos utilitários p/ resposta ---- */
export interface ResponseApi<T> {
  isSuccess: boolean;
  errorMessage?: string;
  response?: T;
}
export function handleAxiosError(error: unknown): ResponseApi<never> {
  if (error instanceof AxiosError) {
    const msg =
      (error.response?.data as any)?.message ??
      (error.response?.data as any)?.error ??
      error.message;
    return { isSuccess: false, errorMessage: msg };
  }
  return { isSuccess: false, errorMessage: 'Por favor, tente novamente mais tarde.' };
}

/** Converte "YYYY-MM-DD" -> "YYYY-MM-DDT00:00:00Z" (se já vier ISO, devolve como está) */
function toIsoZ(d?: string | null): string | null | undefined {
  if (d == null) return d; // mantém null/undefined
  // já é ISO com T?
  if (/\dT\d/.test(d)) return d;
  // espera "YYYY-MM-DD"
  return `${d}T00:00:00Z`;
}

/* ===================== DTOs ===================== */

/** Como o back devolve um Plantio (ajuste se necessário) */
export type PlantioDTO = {
  id: number;
  name: string;
  plantingDate: string;                // ISO
  plantingEndDate?: string | null;     // ISO | null
  expectedHarvestDate?: string | null; // ISO | null
  quantityPlanted?: number | null;
  quantityHarvested?: number | null;
  expectedYield?: number | null;
  harvestId: number;
  productId?: number | null;
  /** >>> alinhado ao Swagger */
  areaIds?: number[];                  // pode vir no GET
};

/** Corpo aceito no PATCH /api/v1/plantings/{id} */
export type PlantioUpdate = {
  /** obrigatórios segundo o contrato novo */
  name: string;
  plantingDate: string;                 // "YYYY-MM-DD" ou ISO
  harvestId: number;

  /** opcionais (envie se tiver) */
  plantingEndDate?: string | null;      // "YYYY-MM-DD" ou ISO
  expectedHarvestDate?: string | null;  // "YYYY-MM-DD" ou ISO
  quantityPlanted?: number | null;
  quantityHarvested?: number | null;
  productId?: number | null;
  expectedYield?: number | null;

  /** >>> alinhado ao Swagger */
  areaIds?: number[];                   // enviar quando informado
};

/* ===================== API calls ===================== */

/** GET /api/v1/plantings/{id} */
export async function getPlantioById(id: number): Promise<ResponseApi<PlantioDTO>> {
  try {
    const { data } = await api.get(`/api/v1/plantings/${id}`);
    return { isSuccess: true, response: data as PlantioDTO };
  } catch (e) {
    return handleAxiosError(e);
  }
}

/** PATCH /api/v1/plantings/{id} */
export async function updatePlantio(
  id: number,
  payload: PlantioUpdate
): Promise<ResponseApi<void>> {
  try {
    const body = {
      name: payload.name,
      plantingDate: toIsoZ(payload.plantingDate),
      plantingEndDate: toIsoZ(payload.plantingEndDate ?? null),
      expectedHarvestDate: toIsoZ(payload.expectedHarvestDate ?? null),
      quantityPlanted: payload.quantityPlanted ?? null,
      quantityHarvested: payload.quantityHarvested ?? null,
      harvestId: payload.harvestId,
      productId: payload.productId ?? null,
      expectedYield: payload.expectedYield ?? null,
      /** >>> novo: enviar se vier */
      areaIds: payload.areaIds ?? undefined,
    };
    await api.patch(`/api/v1/plantings/${id}`, body);
    return { isSuccess: true };
  } catch (e) {
    return handleAxiosError(e);
  }
}

/** aliases (se você usa os nomes “em português” em outros lugares) */
export const getPlantingById = getPlantioById;
export const updatePlanting = updatePlantio;
export type PlantingUpdate = PlantioUpdate;
