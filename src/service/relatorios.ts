/* eslint-disable @typescript-eslint/no-explicit-any */
// src/service/reports.ts
import { api } from '@/lib/api';

/** ==== Tipos do app (normalizados) ==== */
export type KPI = {
  areaHa: number;                // totalAreainhectares -> areaHa
  culturasAtivas: number;        // uniqueProductsCount
  producaoEstimadaaKg: number;   // expectedYield        (mantive teu nome/typo)
  eficienciaKgHa: number;        // averageEfficiency
};
export type PontoMensal = { month: string; value: number };          // ex.: "out/2025"
export type TotalCultura = { culture: string; value: number };       // ex.: "Soja", 2000
export type PontoArea = { date: string; value: number };             // ex.: "2024-10"
export type FatiaCultura = { label: string; value: number };         // ex.: label=cropName, value=areaPercentage

/** ==== Utils ==== */
const monthStrToNumber = (m: string): number => {
  const s = m.trim().toLowerCase();
  const map: Record<string, number> = {
    jan:1, janeiro:1,
    fev:2, fevereiro:2,
    mar:3, março:3, marco:3,
    abr:4, abril:4,
    mai:5, maio:5,
    jun:6, junho:6,
    jul:7, julho:7,
    ago:8, agosto:8,
    set:9, setembro:9,
    out:10, outubro:10,
    nov:11, novembro:11,
    dez:12, dezembro:12,
  };
  return map[s] ?? 1;
};
const pad2 = (n: number) => String(n).padStart(2, '0');

/** 
 * GET /api/v1/producers/{id}/reports/general-view
 * Exemplo Swagger:
 * { "totalAreainhectares":2000, "uniqueProductsCount":3, "expectedYield":4123, "averageEfficiency":4.5 }
 */
export async function getKpis(producerId: number): Promise<KPI> {
  const { data } = await api.get(`/api/v1/producers/${producerId}/reports/general-view`);
  return {
    areaHa: Number(data?.totalAreaHectares ?? data?.totalAreainhectares ?? 0),
    culturasAtivas: Number(data?.uniqueProductsCount ?? 0),
    producaoEstimadaaKg: Number(data?.expectedYield ?? 0),
    eficienciaKgHa: Number(data?.averageEfficiency ?? 0),
  };
}

/**
 * GET /api/v1/harvests/charts/production-by-crop/{producerId}
 * Exemplo Swagger: [{ "cultura":"Milho", "producaoEstimadakg":2000 }]
 */
export async function getProducaoPorCulturaTop4(producerId: number): Promise<TotalCultura[]> {
  const { data } = await api.get(`/api/v1/harvests/charts/production-by-crop/${producerId}`);
  const arr = Array.isArray(data) ? data : [];
  return arr.map((it: any) => ({
    culture: String(it?.cultura ?? ''),
    value: Number(it?.producaoEstimadaKg ?? it?.producaoEstimadakg ?? 0),
  }));
}

/**
 * GET /api/v1/harvests/charts/monthly-production/{producerId}
 * Exemplo Swagger: [{ "mes":"out", "ano":2025, "producaoEstimadakg":1600 }]
 */
export async function getProducaoMensal(producerId: number): Promise<PontoMensal[]> {
  const { data } = await api.get(`/api/v1/harvests/charts/monthly-production/${producerId}`);
  const arr = Array.isArray(data) ? data : [];
  return arr.map((it: any) => ({
    month: `${String(it?.mes ?? '').toString()}/${it?.ano ?? ''}`.toLowerCase(), // ex.: "out/2025"
    value: Number(it?.producaoEstimadaKg ?? it?.producaoEstimadakg ?? 0),
  }));
}

/**
 * GET /api/v1/producers/{id}/reports/planted-area-monthly
 * Exemplo Swagger: [{ "mes":"Outubro", "ano":2024, "areaPlantadaHa":11 }]
 */
export async function getAreaPlantedMonthly(producerId: number): Promise<PontoArea[]> {
  const { data } = await api.get(`/api/v1/producers/${producerId}/reports/planted-area-monthly`);
  const arr = Array.isArray(data) ? data : [];
  return arr.map((it: any) => {
    const y = Number(it?.ano ?? 0);
    const m = monthStrToNumber(String(it?.mes ?? ''));
    return {
      date: `${y}-${pad2(m)}`,                         // normaliza para "YYYY-MM"
      value: Number(it?.areaPlantadaHa ?? 0),
    };
  });
}

/**
 * GET /api/v1/producers/{id}/reports/crops-distribution
 * Exemplo Swagger: [{ "cropName":"Soja", "areaPercentage":35.5 }]
 */
export async function getDistribuicaoCultura(producerId: number): Promise<FatiaCultura[]> {
  const { data } = await api.get(`/api/v1/producers/${producerId}/reports/crops-distribution`);
  const arr = Array.isArray(data) ? data : [];
  return arr.map((it: any) => ({
    label: String(it?.cropName ?? ''),
    value: Number(it?.areaPercentage ?? 0),
  }));
}
