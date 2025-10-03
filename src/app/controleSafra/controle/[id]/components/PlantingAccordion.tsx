'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { formatDate } from '@/lib/utils';
import type { PlantioEntity } from '@/service/safras';
import { Calendar1, CalendarCheck, Sprout, Truck } from 'lucide-react';

type Props = { planting: PlantioEntity };

export default function PlantingAccordion({ planting }: Props) {
  const tableIconProps = { strokeWidth: 1.5, size: 20 };

  const qty =
    planting.quantityPlanted == null
      ? '—'
      : typeof planting.quantityPlanted === 'number'
      ? planting.quantityPlanted.toLocaleString('pt-BR')
      : String(planting.quantityPlanted);

  return (
    <Accordion type="multiple">
      <AccordionItem
        value={`plantio-${planting.id}`}
        className="shadow-md mx-4 px-1 rounded-lg border-2 border-neutral-200/50"
      >
        <AccordionTrigger className="mx-2">
          <div className="text-xl items-center text-gray-500 flex w-full gap-2">
            <Sprout className="text-black" size={28} />
            {planting.name ?? `Plantio ${planting.id}`}
          </div>
        </AccordionTrigger>

        <AccordionContent className="mx-2">
          <table className="w-full">
            <tbody>
              <tr className="border-b">
                <td className="text-gray-500 flex gap-1 py-1.5">
                  <Truck {...tableIconProps} /> Quantidade Plantada
                </td>
                <td>{qty}</td>
              </tr>

              <tr className="border-b">
                <td className="text-gray-500 flex gap-1 py-1.5">
                  <Calendar1 {...tableIconProps} /> Data Inicial do Plantio
                </td>
                <td>{formatDate(planting.plantingDate ?? '')}</td>
              </tr>

              <tr>
                <td className="text-gray-500 flex gap-1 py-1.5">
                  <CalendarCheck {...tableIconProps} /> Data de Colheita Estimada
                </td>
                <td>{formatDate(planting.expectedHarvestDate ?? '')}</td>
              </tr>
            </tbody>
          </table>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
