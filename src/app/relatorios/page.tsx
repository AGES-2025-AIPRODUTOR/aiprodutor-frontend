/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useAgriculturalProducerContext } from '@/context/AgriculturalProducerContext';

// SERVICES (os corrigidos que batem com o Swagger)
import {
  getKpis,
  getProducaoMensal,
  getProducaoPorCulturaTop4,
  getAreaPlantedMonthly,
  getDistribuicaoCultura,
} from '@/service/relatorios';

type KPI = {
  areaHa: number;
  culturasAtivas: number;
  producaoEstimadaaKg: number;
  eficienciaKgHa: number;
};
type PontoMensal = { mes: string; kg: number };
type TotalCultura = { cultura: string; kg: number };
type PontoArea = { mes: string; hectares: number };
type FatiaCultura = { cultura: string; porcentagem: number };

import CartaoKPI from './components/CartaoKPI';
import BarraProducaoMensal from './components/BarraProducaoMensal';
import BarraProducaoPorCultura from './components/BarraProducaoPorCultura';
import LinhaAreaAoLongoDoTempo from './components/LinhaAreaAoLongoDoTempo';
import PizzaDistribuicaoCultura from './components/PizzaDistribuicaoCultura';

// ==== utils de formatação ====
const PT_BR_ABBR = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const monthAbbrFromYyyyMm = (yyyyMm: string) => {
  const m = Number(yyyyMm.split('-')[1] || '1');
  return PT_BR_ABBR[(m-1+12)%12] || '—';
};
const normalizaMesSwagger = (mesRaw: string) => {
  // entra "out/2025" ou "out" etc. -> "Out"
  const m = (mesRaw || '').split('/')[0].trim().toLowerCase();
  const idx = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'].indexOf(m);
  return idx >= 0 ? PT_BR_ABBR[idx] : (m.slice(0,1).toUpperCase()+m.slice(1,3));
};

export default function Relatorios() {
  const { data: producer } = useAgriculturalProducerContext();
  const producerId = producer?.id ?? 1;

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [kpi, setKpi] = useState<KPI | null>(null);
  const [mensal, setMensal] = useState<PontoMensal[] | null>(null);
  const [porCultura, setPorCultura] = useState<TotalCultura[] | null>(null);
  const [area, setArea] = useState<PontoArea[] | null>(null);
  const [distribuicao, setDistribuicao] = useState<FatiaCultura[] | null>(null);

  useEffect(() => {
    let cancel = false;

    (async () => {
      try {
        setLoading(true);
        setErro(null);

        const [kpiRes, prodMensalRes, porCulturaRes, areaRes, distRes] = await Promise.all([
          getKpis(producerId),
          getProducaoMensal(producerId),
          getProducaoPorCulturaTop4(producerId),
          getAreaPlantedMonthly(producerId),
          getDistribuicaoCultura(producerId),
        ]);

        if (cancel) return;

        // KPI já vem no formato certo
        setKpi(kpiRes);

        // Produção mensal: [{ month: "out/2025", value }]
        const mensalNorm: PontoMensal[] = prodMensalRes.map((p: { month: string; value: any; }) => ({
          mes: normalizaMesSwagger(p.month),
          kg: Number(p.value ?? 0),
        }));
        setMensal(mensalNorm);

        // Por cultura: [{ culture, value }]
        const culturaNorm: TotalCultura[] = porCulturaRes.map((c: { culture: any; value: any; }) => ({
          cultura: c.culture,
          kg: Number(c.value ?? 0),
        }));
        setPorCultura(culturaNorm);

        // Área mensal: [{ date: "YYYY-MM", value }]
        const areaNorm: PontoArea[] = areaRes.map((a: { date: string; value: any; }) => ({
          mes: monthAbbrFromYyyyMm(a.date),
          hectares: Number(a.value ?? 0),
        }));
        setArea(areaNorm);

        // Distribuição: [{ label, value }]
        const distNorm: FatiaCultura[] = distRes.map((d: { label: any; value: any; }) => ({
          cultura: d.label,
          porcentagem: Number(d.value ?? 0),
        }));
        setDistribuicao(distNorm);
      } catch (e: any) {
        console.error(e);
        if (!cancel) setErro(e?.message || 'Falha ao carregar relatórios.');
      } finally {
        if (!cancel) setLoading(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [producerId]);

  return (
    <div className="p-4 space-y-6">
      {erro && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 opacity-100">
        <CartaoKPI titulo="Área Total Plantada" valor={kpi?.areaHa ?? (loading ? '...' : '--')} unidade="ha" />
        <CartaoKPI titulo="Culturas Ativas" valor={kpi?.culturasAtivas ?? (loading ? '...' : '--')} />
        <CartaoKPI
          titulo="Produção Estimada"
          valor={kpi?.producaoEstimadaaKg ?? (loading ? '...' : '--')}
          unidade="kg"
        />
        <CartaoKPI titulo="Eficiência Média" valor={kpi?.eficienciaKgHa ?? (loading ? '...' : '--')} unidade="kg/ha" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarraProducaoMensal dados={mensal ?? []} />
        <BarraProducaoPorCultura dados={porCultura ?? []} />
        <LinhaAreaAoLongoDoTempo dados={area ?? []} />
        <PizzaDistribuicaoCultura dados={distribuicao ?? []} />
      </div>
    </div>
  );
}
