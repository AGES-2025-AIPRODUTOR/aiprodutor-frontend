'use client';

export type PontoArea = { mes: string; hectares: number };
export type LinhaAreaAoLongoDoTempoProps = { dados: PontoArea[] };

export default function LinhaAreaAoLongoDoTempo({ dados }: LinhaAreaAoLongoDoTempoProps) {
  const w = 560, h = 260, pad = 32;
  const max = Math.max(1, ...dados.map(d => d.hectares));
  const min = Math.min(...dados.map(d => d.hectares), 0);
  const range = Math.max(1, max - min);
  const stepX = (w - pad * 2) / Math.max(1, dados.length - 1);

  const points = dados.map((d, i) => {
    const x = pad + i * stepX;
    const y = h - pad - ((d.hectares - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-gray-600 font-semibold mb-2">Área Plantada ao Longo do Tempo</h3>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-64">
        {[0, 0.5, 1].map((t, i) => {
          const y = h - pad - (h - pad * 2) * t;
          const valor = Math.round((min + range * t));
          return (
            <g key={i}>
              <line x1={pad} y1={y} x2={w - pad} y2={y} stroke="#f3f4f6" />
              <text x={pad - 8} y={y + 4} fontSize="11" textAnchor="end" fill="#9ca3af">
                {valor}
              </text>
            </g>
          );
        })}
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#e5e7eb" />
        {dados.map((d, i) => {
          const x = pad + i * stepX;
          return (
            <text key={i} x={x} y={h - pad + 16} fontSize="12" textAnchor="middle" fill="#6b7280">
              {d.mes}
            </text>
          );
        })}
        <polyline points={points} fill="none" stroke="#22c55e" strokeWidth="2.5" />
        {dados.map((d, i) => {
          const x = pad + i * stepX;
          const y = h - pad - ((d.hectares - min) / range) * (h - pad * 2);
          return <circle key={i} cx={x} cy={y} r="3.5" fill="#22c55e" />;
        })}
      </svg>
    </div>
  );
}
