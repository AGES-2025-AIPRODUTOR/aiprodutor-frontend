'use client';

export type CartaoKPIProps = {
  titulo: string;
  valor: number | string;
  unidade?: string;
};

export default function CartaoKPI({ titulo, valor, unidade }: CartaoKPIProps) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-gray-500 text-sm font-medium">{titulo}</h3>
      <p className="text-2xl font-bold text-gray-800 mt-1">
        {valor} {unidade && <span className="text-base text-gray-500">{unidade}</span>}
      </p>
    </div>
  );
}
