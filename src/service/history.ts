import { api } from '@/lib/api';
import { handleAxiosError, ResponseApi } from '@/lib/response';

export type StatusType = 'Finalizada' | 'Ativa' | 'Pausada';

export interface Area {
  id: number;
  name: string;
}

export interface Planting {
  id: number;
  name: string;
  initialDate: string;
  estimatedEndDate: string | null;
  qtyEstimated: string;
  areaName: string[];
}

// Alias para compatibilidade
export type PlantingItem = Planting;

export interface HarvestHistoryItem {
  safraId: number;
  safraName: string;
  safraInitialDate: string;
  safraEndDate: string | null;
  areas: Area[];
  status: StatusType;
  planting: Planting[];
}

// Alias para compatibilidade
export type HistoryEntity = HarvestHistoryItem;

export interface HarvestHistoryFilters {
  status?: string;
  safraName?: string;
  safraInitialDate?: string;
  safraEndDate?: string;
  safraId?: number;
}

export const getAllHistory = async (
  producerId: number,
  filters?: HarvestHistoryFilters
): Promise<ResponseApi<HarvestHistoryItem[]>> => {
  try {
    const response = await api.get<HarvestHistoryItem[]>(
      `/api/v1/harvests/${producerId}/historico`,
      {
        params: {
          ...(filters?.status && { status: filters.status }),
          ...(filters?.safraName && { safraName: filters.safraName }),
          ...(filters?.safraInitialDate && { safraInitialDate: filters.safraInitialDate }),
          ...(filters?.safraEndDate && { safraEndDate: filters.safraEndDate }),
          ...(filters?.safraId && { safraId: filters.safraId }),
        },
      }
    );

    return {
      isSuccess: true,
      response: response.data,
    };
  } catch (error) {
    console.error('Erro ao buscar histórico de safras:', error);
    return handleAxiosError(error);
  }
};

export const getHarvestDetail = async (
  producerId: number,
  safraId: number
): Promise<ResponseApi<HarvestHistoryItem>> => {
  try {
    // Primeira tentativa: usando a rota de histórico com filtro por ID específico
    try {
      const response = await api.get<HarvestHistoryItem[]>(
        `/api/v1/harvests/${producerId}/historico`,
        {
          params: {
            safraId: safraId,
          },
        }
      );

      const safraData = Array.isArray(response.data) ? response.data[0] : response.data;

      if (safraData) {
        return {
          isSuccess: true,
          response: safraData,
        };
      }
    } catch {
      console.log('Filtro por safraId não suportado, buscando todos os dados...');
    }

    // Segunda tentativa: buscar todos os dados e filtrar localmente
    const response = await api.get<HarvestHistoryItem[]>(
      `/api/v1/harvests/${producerId}/historico`
    );

    const allSafras = Array.isArray(response.data) ? response.data : [];
    const safraData = allSafras.find((safra) => safra.safraId === safraId);

    if (!safraData) {
      throw new Error('Safra não encontrada');
    }

    return {
      isSuccess: true,
      response: safraData,
    };
  } catch (error) {
    console.error('Erro ao buscar detalhes da safra:', error);
    return handleAxiosError(error);
  }
};

export function formatDateToBrazilian(isoDate: string | null): string {
  if (!isoDate) return 'Não definida';

  const date = new Date(isoDate);
  return date.toLocaleDateString('pt-BR');
}

export function mapStatusToDisplay(status: StatusType): string {
  const statusMap: Record<StatusType, string> = {
    Finalizada: 'Concluído',
    Ativa: 'Em Andamento',
    Pausada: 'Desativado',
  };

  return statusMap[status] || status;
}

export function mapDisplayToStatus(displayStatus: string): StatusType | undefined {
  const statusMap: Record<string, StatusType> = {
    Concluído: 'Finalizada',
    'Em Andamento': 'Ativa',
    Desativado: 'Pausada',
  };

  return statusMap[displayStatus];
}
