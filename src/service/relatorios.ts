import { api } from '@/lib/api';

export type KPI = {
  areaHa: number;
  culturasAtivas: number;
  producaoEstimadaaKg: number;
  eficienciaKgHa: number;
};
export type PontoMensal = { month: string; value: number };
export type TotalCultura = { culture: string; value: number };
export type PontoArea = { date: string; value: number };
export type FatiaCultura = { label: string; value: number };

export async function getKpis(): Promise<KPI> {
  const { data } = await api.get('/api/v1/reports/kpis');
  return data;
}

export async function getProducaoMensal(params: {
  start: string;
  end: string;
  culture?: string | string[];
  farmId?: string;
  page?: number;
  perPage?: number;
}): Promise<PontoMensal[]> {
  const { data } = await api.get('/api/v1/reports/production/monthly', { params });
  return data.totals as PontoMensal[];
}

export async function getProducaoPorCultura(params: {
  start: string;
  end: string;
  top?: number;
  farmId?: string;
}): Promise<TotalCultura[]> {
  const { data } = await api.get('/api/v1/reports/production/by-culture', { params });
  return data.data as TotalCultura[];
}

export async function getAreaTimeSeries(params: {
  start: string;
  end: string;
  interval?: 'day' | 'month' | 'quarter';
  farmId?: string;
}): Promise<PontoArea[]> {
  const { data } = await api.get('/api/v1/reports/area/time-series', { params });
  return data.series as PontoArea[];
}

export async function getDistribuicaoCultura(params: { date?: string }) {
  const { data } = await api.get('/api/v1/reports/crops/distribution', { params });
  return data;
}
