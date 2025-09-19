import { api } from '@/lib/api';
import { handleAxiosError, ResponseApi } from '@/lib/response';

export interface HarvestsEntity {
  producerId: number;
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  status: string;
  cycle: string;
  createdAt: string;
  updatedAt: string;
}