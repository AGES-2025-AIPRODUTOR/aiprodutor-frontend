'use client';

export type PontoMensal = { mes: string; kg: number };
export type BarraProducaoMensalProps = { dados: PontoMensal[] };

export default function BarraProducaoMensal({ dados }: BarraProducaoMensalProps) {
  const w = 560, h = 260, pad = 32;
  const max = Math.max(1, ...dados.map(d => d.kg));
  const bw = (w - pad * 2) / Math.max(1, dados.length);
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-gray-600 font-semibold mb-2">Produção Estimada Mensal</h3>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-64">
        <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="#e5e7eb" />
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#e5e7eb" />
        {dados.map((d, i) => {
          const x = pad + i * bw + bw * 0.15;
          const bh = ((h - pad * 2) * d.kg) / max;
          const y = h - pad - bh;
          return (
            <g key={i}>
              <rect x={x} y={y} width={bw * 0.7} height={bh} rx="6" fill="#16a34a" />
              <text x={x + bw * 0.35} y={h - pad + 16} fontSize="12" textAnchor="middle" fill="#6b7280">
                {d.mes}
              </text>
            </g>
          );
        })}
        {[0, 0.5, 1].map((t, i) => {
          const y = h - pad - (h - pad * 2) * t;
          const valor = Math.round(max * t);
          return (
            <g key={i}>
              <line x1={pad - 4} y1={y} x2={w - pad} y2={y} stroke="#f3f4f6" />
              <text x={pad - 8} y={y + 4} fontSize="11" textAnchor="end" fill="#9ca3af">
                {valor}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
