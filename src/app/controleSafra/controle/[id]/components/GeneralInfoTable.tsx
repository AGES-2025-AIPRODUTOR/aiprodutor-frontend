'use client';
import { formatDate } from '@/lib/utils';
import { PlantingControlEntity, SafraControlEntity } from '@/service/safraControl';
import { Calendar1, CalendarCheck, Leaf, Map, MapPinned, Truck } from 'lucide-react';

export default function GeneralInfoTable(props: { safra: SafraControlEntity }) {
  const { generalInfo } = props.safra;
  const tableIconProps = {
    strokeWidth: 1.5,
    size: 20,
  };

  return (
    <table className="w-full">
      <tbody>
        <tr className="border-b">
          <td className="text-gray-500 flex gap-1 py-1.5">
            <MapPinned {...tableIconProps} />
            Nº de Áreas
          </td>
          <td>{generalInfo.area_count}</td>
        </tr>
        <tr className="border-b">
          <td className="text-gray-500 flex gap-1 py-1.5">
            <Map {...tableIconProps} /> Área Total
          </td>
          <td>{generalInfo.total_area}</td>
        </tr>
        <tr className="border-b">
          <td className="text-gray-500 flex gap-1 py-1.5">
            <Truck {...tableIconProps} /> Produtividade Esperada
          </td>
          <td>{generalInfo.expected_yield}</td>
        </tr>
        <tr className="border-b">
          <td className="text-gray-500 flex gap-1 py-1.5">
            <Leaf {...tableIconProps} /> Cultivar
          </td>
          <td>{generalInfo.cultivar}</td>
        </tr>
        <tr className="border-b">
          <td className="text-gray-500 flex gap-1 py-1.5">
            <Calendar1 {...tableIconProps} /> Data Inicial da Safra
          </td>
          <td>{formatDate(generalInfo.harvest_start_date)}</td>
        </tr>
        <tr>
          <td className="text-gray-500 flex gap-1 py-1.5">
            <CalendarCheck {...tableIconProps} /> Data Final da Safra
          </td>
          <td>{formatDate(generalInfo.harvest_end_date)}</td>
        </tr>
      </tbody>
    </table>
  );
}

export function GeneralInfoTableSkeleton() {
  return <div></div>;
}
