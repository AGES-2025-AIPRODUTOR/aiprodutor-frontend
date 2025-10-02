import { api } from '@/lib/api';
import { handleAxiosError, ResponseApi } from '@/lib/response';

export type StatusType = 'Finalizada' | 'Ativa' | 'Pausada';

export interface Area {
  id: number;
  name: string;
}

export interface Planting {
  id: number;
  initialDate: string;
  estimatedEndDate: string | null;
  qtyEstimated: string;
  areaName: string[];
}

export interface HarvestHistoryItem {
  safraId: number;
  safraName: string;
  safraInitialDate: string;
  safraEndDate: string | null;
  areas: Area[];
  status: StatusType;
  planting: Planting[];
}

export interface HarvestHistoryFilters {
  status?: StatusType;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
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
          ...(filters?.startDate && { startDate: filters.startDate }),
          ...(filters?.endDate && { endDate: filters.endDate }),
        } 
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
    const response = await api.get<HarvestHistoryItem>(
      `/api/v1/harvests/${producerId}/historico/${safraId}`
    );

    return {
      isSuccess: true,
      response: response.data,
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
    'Finalizada': 'Concluído',
    'Ativa': 'Em Andamento',
    'Pausada': 'Desativado',
  };
  
  return statusMap[status] || status;
}

export function mapDisplayToStatus(displayStatus: string): StatusType | undefined {
  const statusMap: Record<string, StatusType> = {
    'Concluído': 'Finalizada',
    'Em Andamento': 'Ativa',
    'Desativado': 'Pausada',
  };
  
  return statusMap[displayStatus];
}

