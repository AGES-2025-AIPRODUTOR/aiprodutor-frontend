'use client';

export type TotalCultura = { cultura: string; kg: number };
export type BarraProducaoPorCulturaProps = { dados: TotalCultura[] };

export default function BarraProducaoPorCultura({ dados }: BarraProducaoPorCulturaProps) {
  const w = 560, h = 260, pad = 32;
  const max = Math.max(1, ...dados.map(d => d.kg));
  const rowH = (h - pad * 2) / Math.max(1, dados.length);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-gray-600 font-semibold mb-2">Produção Estimada por Cultura</h3>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-64">
        <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="#e5e7eb" />
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#e5e7eb" />
        {dados.map((d, i) => {
          const y = pad + i * rowH + rowH * 0.15;
          const bw = ((w - pad * 2) * d.kg) / max;
          return (
            <g key={i}>
              <rect x={pad} y={y} width={bw} height={rowH * 0.7} rx="6" fill="#facc15" />
              <text x={pad - 8} y={y + rowH * 0.45} fontSize="12" textAnchor="end" fill="#6b7280">
                {d.cultura}
              </text>
              <text x={pad + bw + 8} y={y + rowH * 0.45} fontSize="11" fill="#9ca3af">
                {d.kg} kg
              </text>
            </g>
          );
        })}
        {[0, 0.5, 1].map((t, i) => {
          const x = pad + (w - pad * 2) * t;
          const valor = Math.round(max * t);
          return (
            <g key={i}>
              <line x1={x} y1={pad} x2={x} y2={h - pad} stroke="#f3f4f6" />
              <text x={x} y={h - pad + 16} fontSize="11" textAnchor="middle" fill="#9ca3af">
                {valor}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
