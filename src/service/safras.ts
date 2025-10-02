/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from '@/lib/api';
import { handleAxiosError, ResponseApi } from '@/lib/response';
import type { AreasEntity } from '@/service/areas';

/* =============================================================================
  TIPAGENS DO BACKEND (Swagger) – "Harvests"
============================================================================= */

export type HarvestAreaApi = {
  id: number;
  name: string;
  // ...demais campos existem no backend, mas não são críticos para as telas
};

export type HarvestPlantingApi = {
  id: number;
  name: string;
  plantingDate: string;        // ISO string
  plantingEndDate: string | null;
  expectedHarvestDate: string; // ISO string
  quantityPlanted: number;     // quantidade PLANTADA
  quantityHarvested: number | null;
  expectedYield: number | null;
  areas: HarvestAreaApi[];
  productId: number;
  varietyId: number;
  product?: { id: number; name: string };
  variety?: { id: number; name: string; productId: number };
};

export type HarvestApi = {
  id: number;
  name: string;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  status: string | null;
  producerId: number;
  areas: HarvestAreaApi[];
  plantings: HarvestPlantingApi[];
  createdAt: string;
  updatedAt: string;
  expectedYield?: number | null;
};

/* =============================================================================
  TIPAGENS DA UI (mantendo compat com páginas já feitas)
============================================================================= */

// Usado em /cadastrarSafra/safraEditar e plantiosEditar
export type PlantioEntity = {
  id: number;
  safraId: number;                 // preenchemos com o id da safra
  inicio: string;                  // YYYY-MM-DD (plantingDate)
  fim: string;                     // YYYY-MM-DD (expectedHarvestDate)
  produtoNome: string;             // nome amigável se vier de product/variety
  quantidadePlantadaKg: number | null;
  areaIds: number[];
};

// Detalhe da Safra
export type SafraDetail = {
  id: number;
  nome: string;
  inicio: string;                  // YYYY-MM-DD
  fim: string;                     // YYYY-MM-DD
  areas: AreasEntity[];
  plantios: PlantioEntity[];
};

// Lista de Safras (para o card da tela "Controle De Safra")
export type SafraListItem = {
  safraId: number;
  name: string;
  startDate: string;               // YYYY-MM-DD
  endDate: string;                 // YYYY-MM-DD
  status?: string | null;
  producerId: number;
  areasCount: number;
  plantingsCount: number;
};

/* =============================================================================
  HELPERS
============================================================================= */

const toDateOnly = (iso?: string | null) =>
  iso ? new Date(iso).toISOString().slice(0, 10) : '';

function mapAnyHarvestToListItem(h: any): SafraListItem {
  const id          = h.safraId ?? h.id;
  const name        = h.safraName ?? h.name;
  const start       = h.safraInitialDate ?? h.startDate;
  const end         = h.safraEndDate ?? h.endDate;
  const producerId  = h.producerId ?? h.producer?.id;
  const areasCount  = (h.areas?.length ?? 0);
  const plantCount  = (h.plantings?.length ?? 0);

  return {
    safraId: id,
    name,
    startDate: toDateOnly(start),
    endDate: toDateOnly(end),
    status: h.status ?? null,
    producerId,
    areasCount,
    plantingsCount: plantCount,
  };
}

/** Converte área do backend para algo compatível com AreasEntity das suas UIs */
function mapAreaApiToAreaEntity(a: HarvestAreaApi): AreasEntity {
  return {
    id: a.id,
    name: a.name,
    producerId: 0,                 // backend não retorna aqui; não é usado nessas telas
    isActive: true,
    soilTypeId: undefined,
    irrigationTypeId: undefined,
    polygon: { type: 'Polygon', coordinates: [[]] }, // placeholder
    createdAt: '',
    updatedAt: '',
    areaM2: 0,

  };
}

function mapPlantingApiToPlantioEntity(p: HarvestPlantingApi, safraId: number): PlantioEntity {
  const produtoBase = p.product?.name ?? 'Produto';
  const variedade    = p.variety?.name ? ` ${p.variety.name}` : '';
  const produtoNome  = p.name || `${produtoBase}${variedade}`;

  return {
    id: p.id,
    safraId,
    inicio: toDateOnly(p.plantingDate),
    fim: toDateOnly(p.expectedHarvestDate),
    produtoNome,
    quantidadePlantadaKg: p.quantityPlanted ?? null,
    areaIds: (p.areas || []).map((a) => a.id),
  };
}

function mapHarvestApiToDetail(h: HarvestApi): SafraDetail {
  return {
    id: h.id,
    nome: h.name,
    inicio: toDateOnly(h.startDate),
    fim: toDateOnly(h.endDate),
    areas: (h.areas || []).map(mapAreaApiToAreaEntity),
    plantios: (h.plantings || []).map((p) => mapPlantingApiToPlantioEntity(p, h.id)),
  };
}

function mapHarvestApiToListItem(h: HarvestApi): SafraListItem {
  return {
    safraId: h.id,
    name: h.name,
    startDate: toDateOnly(h.startDate),
    endDate: toDateOnly(h.endDate),
    status: h.status ?? null,
    producerId: h.producerId,
    areasCount: h.areas?.length ?? 0,
    plantingsCount: h.plantings?.length ?? 0,
  };
}

/* =============================================================================
  PAYLOADS (POST/PATCH)
============================================================================= */

export type CreatePlantingPayload = {
  name: string;
  plantingDate: string;            // YYYY-MM-DD
  expectedHarvestDate: string;     // YYYY-MM-DD
  quantityPlanted: number;
  productId: number;
  varietyId: number;
  areaIds: number[];
  plantingEndDate?: string | null; // opcional
};

export type CreateHarvestPayload = {
  name: string;
  producerId: number;
  areaIds: number[];
  plantings: CreatePlantingPayload[];
};

// usado pela tela de edição de safra que manda nome/inicio/fim/areaIds
export type UpdateHarvestPayload = {
  name: string;
  startDate: string;               // YYYY-MM-DD
  endDate: string;                 // YYYY-MM-DD
  areaIds: number[];
};

/* =============================================================================
  SERVICES (CRUD)
============================================================================= */
type HarvestInProgressApi = {
  safraId: number;                  // id da safra
  safraName: string;                // nome da safra
  safraInitialDate: string;         // ISO
  safraEndDate: string;             // ISO
  status?: string | null;
  producerId: number;
  areas?: unknown[];                // pode vir omitido
  plantings?: unknown[];            // pode vir omitido
  // às vezes o backend muda o DTO; deixamos flexível
};
/** Lista as safras em andamento de um produtor (Swagger: GET /api/v1/harvests/{producerId}/in-progress) */
export async function getAllSafras(
  producerId: number
): Promise<ResponseApi<SafraListItem[]>> {
  try {
    const { data } = await api.get<HarvestInProgressApi[]>(
      `/api/v1/harvests/${producerId}/in-progress`
    );
    return { isSuccess: true, response: data.map(mapAnyHarvestToListItem) };
  } catch (error) {
    return handleAxiosError(error);
  }
}

/** Busca detalhe de uma safra (Swagger: GET /api/v1/harvests/{id}) */
export async function getSafraById(id: number): Promise<ResponseApi<SafraDetail>> {
  try {
    const { data } = await api.get<HarvestApi>(`/api/v1/harvests/${id}`);
    return { isSuccess: true, response: mapHarvestApiToDetail(data) };
  } catch (error) {
    return handleAxiosError(error);
  }
}

/** Cria uma nova safra (Swagger: POST /api/v1/harvests) */
export async function createSafra(payload: CreateHarvestPayload): Promise<ResponseApi<SafraDetail>> {
  try {
    // converte datas YYYY-MM-DD → ISO se o backend requer (normalmente aceita YYYY-MM-DD)
    const body = {
      name: payload.name,
      producerId: payload.producerId,
      areaIds: payload.areaIds,
      plantings: payload.plantings.map((p) => ({
        name: p.name,
        plantingDate: p.plantingDate,
        expectedHarvestDate: p.expectedHarvestDate,
        quantityPlanted: p.quantityPlanted,
        productId: p.productId,
        varietyId: p.varietyId,
        areaIds: p.areaIds,
        plantingEndDate: p.plantingEndDate ?? null,
      })),
    };
    const { data } = await api.post<HarvestApi>(`/api/v1/harvests`, body);
    return { isSuccess: true, response: mapHarvestApiToDetail(data) };
  } catch (error) {
    return handleAxiosError(error);
  }
}

/** Atualiza uma safra (Swagger: PATCH /api/v1/harvests/{id}) */
export async function updateSafra(id: number, payload: UpdateHarvestPayload): Promise<ResponseApi<SafraDetail>> {
  try {
    const body = {
      name: payload.name,
      startDate: payload.startDate,
      endDate: payload.endDate,
      areaIds: payload.areaIds,
    };
    const { data } = await api.patch<HarvestApi>(`/api/v1/harvests/${id}`, body);
    return { isSuccess: true, response: mapHarvestApiToDetail(data) };
  } catch (error) {
    return handleAxiosError(error);
  }
}

/** Remove uma safra (Swagger: DELETE /api/v1/harvests/{id}) */
export async function deleteSafra(id: number): Promise<ResponseApi<void>> {
  try {
    await api.delete(`/api/v1/harvests/${id}`);
    return { isSuccess: true };
  } catch (error) {
    return handleAxiosError(error);
  }
}

/* =============================================================================
  (Opcional) Utilidades que suas telas já usam/esperam
============================================================================= */

/** Encontra um plantio dentro de uma safra (usado no editarPlantio enquanto não há endpoint próprio) */
export async function getPlantioById(plantioId: number): Promise<ResponseApi<PlantioEntity>> {
  try {
    // Estratégia: procurar em todas as safras ativas do produtor não é barato;
    // então é melhor que quem chama saiba a safra. Aqui é uma implementação de conveniência.
    // Se existir endpoint /plantings/{id}, troque aqui.
    const { data } = await api.get<HarvestApi[]>(`/api/v1/harvests`); // fallback amplo
    const safra = data.find((h) => (h.plantings || []).some((p) => p.id === plantioId));
    if (!safra) return { isSuccess: false, errorMessage: 'Plantio não encontrado' };
    const p = (safra.plantings || []).find((x) => x.id === plantioId)!;
    return { isSuccess: true, response: mapPlantingApiToPlantioEntity(p, safra.id) };
  } catch (error) {
    return handleAxiosError(error);
  }
}

/** Atualiza um plantio – se o backend tiver um endpoint próprio, use-o aqui */
export type PlantioUpdate = {
  inicio: string;   // YYYY-MM-DD
  fim: string;      // YYYY-MM-DD
  produtoNome: string;
  quantidadePlantadaKg: number | null;
  areaIds: number[];
};

export async function updatePlantio(plantioId: number, body: PlantioUpdate): Promise<ResponseApi<PlantioEntity>> {
  try {
    // Se existir PATCH /api/v1/plantings/{id}, troque para ele.
    // Aqui mostramos uma forma comum: PATCH no recurso de plantio (exemplo).
    const payload = {
      name: body.produtoNome,
      plantingDate: body.inicio,
      expectedHarvestDate: body.fim,
      quantityPlanted: body.quantidadePlantadaKg,
      areaIds: body.areaIds,
    };
    const { data } = await api.patch<HarvestPlantingApi>(`/api/v1/plantings/${plantioId}`, payload);
    // Se seu backend ainda não tem esse endpoint, você pode manter o mock dessa função
    // temporariamente e remover quando o endpoint estiver pronto.
    // return handleAxiosError(new Error('Endpoint /plantings/{id} não implementado no backend'));
    return { isSuccess: true, response: mapPlantingApiToPlantioEntity(data, /* safraId */ 0) };
  } catch (error) {
    return handleAxiosError(error);
  }
}

/** Desativa/Remove um plantio – ajuste para o endpoint real */
export async function deactivatePlantio(plantioId: number): Promise<ResponseApi<void>> {
  try {
    await api.delete(`/api/v1/plantings/${plantioId}`);
    return { isSuccess: true };
  } catch (error) {
    return handleAxiosError(error);
  }
}
