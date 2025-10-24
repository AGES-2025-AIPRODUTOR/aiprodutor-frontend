'use client';

import { formatDate } from '@/lib/utils';
import type { SafraDetalhe } from '@/service/safras';
import { Calendar1, CalendarCheck, Map, MapPinned, Truck } from 'lucide-react';

export default function GeneralInfoTable({ safra }: { safra: SafraDetalhe }) {
  const { areas, plantios, inicio, fim } = safra;

  const areaCount = areas?.length ?? 0;

  // soma área em m² -> mostra em ha com 2 casas
  const totalAreaHa = (() => {
    const m2 = (areas ?? []).reduce((acc, a) => acc + (Number(a.areaM2) || 0), 0);
    const ha = m2 / 10_000;
    return Number.isFinite(ha) ? `${ha.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ha` : '—';
    // se preferir m², troque a linha acima
  })();

  // soma quantidade plantada (se existir)
  const totalQty = (() => {
    const sum = (plantios ?? []).reduce(
      (acc, p) => acc + (Number(p.quantityPlanted) || 0),
      0
    );
    return sum > 0 ? sum.toLocaleString('pt-BR') : '—';
  })();

  const tableIconProps = { strokeWidth: 1.5, size: 20 };

  return (
    <table className="w-full">
      <tbody>
        <tr className="border-b">
          <td className="text-gray-500 flex gap-1 py-1.5">
            <MapPinned {...tableIconProps} />
            Nº de Áreas
          </td>
          <td>{areaCount}</td>
        </tr>

        <tr className="border-b">
          <td className="text-gray-500 flex gap-1 py-1.5">
            <Map {...tableIconProps} /> Área Total
          </td>
          <td>{totalAreaHa}</td>
        </tr>

        <tr className="border-b">
          <td className="text-gray-500 flex gap-1 py-1.5">
            <Truck {...tableIconProps} /> Quantidade Plantada (total)
          </td>
          <td>{totalQty}</td>
        </tr>

        <tr className="border-b">
          <td className="text-gray-500 flex gap-1 py-1.5">
            <Calendar1 {...tableIconProps} /> Data Inicial da Safra
          </td>
          <td>{formatDate(inicio)}</td>
        </tr>

        <tr>
          <td className="text-gray-500 flex gap-1 py-1.5">
            <CalendarCheck {...tableIconProps} /> Data Final da Safra
          </td>
          <td>{formatDate(fim)}</td>
        </tr>
      </tbody>
    </table>
  );
}

export function GeneralInfoTableSkeleton() {
  return <div />;
}
