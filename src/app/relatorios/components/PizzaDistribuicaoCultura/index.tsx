'use client';

export type FatiaCultura = { cultura: string; porcentagem: number };
export type PizzaDistribuicaoCulturaProps = { dados: FatiaCultura[] };

function arcoPath(cx: number, cy: number, r: number, inicio: number, fim: number) {
  const x1 = cx + r * Math.cos(inicio);
  const y1 = cy + r * Math.sin(inicio);
  const x2 = cx + r * Math.cos(fim);
  const y2 = cy + r * Math.sin(fim);
  const grandeArco = fim - inicio > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${grandeArco} 1 ${x2} ${y2} Z`;
}

const CORES = ['#facc15', '#16a34a', '#ef4444', '#3b82f6', '#a855f7', '#fb923c'];

export default function PizzaDistribuicaoCultura({ dados }: PizzaDistribuicaoCulturaProps) {
  const w = 560, h = 260;
  const cx = w / 2, cy = h / 2, r = 90;

  let ang = -Math.PI / 2;
  const total = Math.max(1, dados.reduce((s, d) => s + d.porcentagem, 0));

  const setores = dados.map((d, i) => {
    const fra = d.porcentagem / total;
    const inicio = ang;
    const fim = ang + fra * Math.PI * 2;
    ang = fim;
    return { path: arcoPath(cx, cy, r, inicio, fim), cor: CORES[i % CORES.length], label: d.cultura, pct: d.porcentagem, mid: (inicio + fim) / 2 };
  });

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-gray-600 font-semibold mb-2">Distribuição de Culturas</h3>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-64">
        {setores.map((s, i) => <path key={i} d={s.path} fill={s.cor} />)}
        {setores.map((s, i) => {
          const rx = cx + (r + 18) * Math.cos(s.mid);
          const ry = cy + (r + 18) * Math.sin(s.mid);
          return (
            <text key={i} x={rx} y={ry} fontSize="12" textAnchor="middle" fill="#374151">
              {s.label} ({s.pct}%)
            </text>
          );
        })}
      </svg>
    </div>
  );
}
