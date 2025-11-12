'use client';

import { useEffect, useState } from 'react';

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

// Daods mockados para testar a funcionalidaede dos compoentens (antes de receber as infos do Backend)
const mockKpi: KPI = {
  areaHa: 195,
  culturasAtivas: 4,
  producaoEstimadaaKg: 469,
  eficienciaKgHa: 2.4,
};
const mockMensal: PontoMensal[] = [
  { mes: 'Jul', kg: 900 },
  { mes: 'Ago', kg: 1200 },
  { mes: 'Set', kg: 1000 },
  { mes: 'Out', kg: 1500 },
  { mes: 'Nov', kg: 1800 },
  { mes: 'Dez', kg: 2100 },
];
const mockPorCultura: TotalCultura[] = [
  { cultura: 'Milho', kg: 200 },
  { cultura: 'Batata', kg: 70 },
  { cultura: 'Soja', kg: 150 },
  { cultura: 'Feijão', kg: 90 },
];
const mockArea: PontoArea[] = [
  { mes: 'Jan', hectares: 120 },
  { mes: 'Fev', hectares: 135 },
  { mes: 'Mar', hectares: 150 },
  { mes: 'Abr', hectares: 165 },
  { mes: 'Mai', hectares: 180 },
  { mes: 'Jun', hectares: 200 },
];
const mockDistribuicao: FatiaCultura[] = [
  { cultura: 'Milho', porcentagem: 44 },
  { cultura: 'Batata', porcentagem: 23 },
  { cultura: 'Soja', porcentagem: 18 },
  { cultura: 'Feijão', porcentagem: 15 },
];

export default function Relatorios() {
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [mensal, setMensal] = useState<PontoMensal[] | null>(null);
  const [porCultura, setPorCultura] = useState<TotalCultura[] | null>(null);
  const [area, setArea] = useState<PontoArea[] | null>(null);
  const [distribuicao, setDistribuicao] = useState<FatiaCultura[] | null>(null);

  useEffect(() => {
    setKpi(mockKpi);
    setMensal(mockMensal);
    setPorCultura(mockPorCultura);
    setArea(mockArea);
    setDistribuicao(mockDistribuicao);
  }, []);

  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CartaoKPI titulo="Área Total Plantada" valor={kpi?.areaHa ?? '--'} unidade="ha" />
        <CartaoKPI titulo="Culturas Ativas" valor={kpi?.culturasAtivas ?? '--'} />
        <CartaoKPI
          titulo="Produção Estimada"
          valor={kpi?.producaoEstimadaaKg ?? '--'}
          unidade="kg"
        />
        <CartaoKPI titulo="Eficiência Média" valor={kpi?.eficienciaKgHa ?? '--'} unidade="kg/ha" />
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
