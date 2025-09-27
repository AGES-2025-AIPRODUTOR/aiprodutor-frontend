'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { formatDate } from '@/lib/utils';
import { PlantingControlEntity } from '@/service/safraControl';
import { Calendar1, CalendarCheck, MapPinned, Sprout, Truck } from 'lucide-react';

export default function PlantingAccordion(props: { planting: PlantingControlEntity }) {
  const { planting } = props;
  const tableIconProps = {
    strokeWidth: 1.5,
    size: 20,
  };

  return (
    <Accordion type="multiple">
      <AccordionItem
        value="item-1"
        className="shadow-md mx-4 px-1 rounded-lg border-2 border-neutral-200/50"
      >
        <AccordionTrigger className="mx-2">
          <div className="text-xl items-center text-gray-500 flex w-full gap-2">
            <Sprout className="text-black" size={28} /> Plantio 1
          </div>
        </AccordionTrigger>
        <AccordionContent className="mx-2">
          <table className="w-full">
            <tbody>
              <tr className="border-b">
                <td className="text-gray-500 flex gap-1 py-1.5">
                  <MapPinned {...tableIconProps} />
                  Área do Plantio
                </td>
                <td>{planting.planting_area}</td>
              </tr>
              <tr className="border-b">
                <td className="text-gray-500 flex gap-1 py-1.5">
                  <Truck {...tableIconProps} /> Produtividade Esperada
                </td>
                <td>{planting.expected_yield}</td>
              </tr>
              <tr className="border-b">
                <td className="text-gray-500 flex gap-1 py-1.5">
                  <Calendar1 {...tableIconProps} /> Data Inicial do Plantio
                </td>
                <td>{formatDate(planting.planting_date)}</td>
              </tr>
              <tr>
                <td className="text-gray-500 flex gap-1 py-1.5">
                  <CalendarCheck {...tableIconProps} /> Data de Colheita Estimada
                </td>
                <td>{formatDate(planting.estimated_harvest_date)}</td>
              </tr>
            </tbody>
          </table>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
