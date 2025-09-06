'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Pencil } from 'lucide-react';
import { DeleteAreaConfirmDialog } from './DeleteAreaConfirmDialog';
import Link from 'next/link';

export default function AreaCard(props: {
  soilType: string;
  irrigationType: string;
  size: string;
  handleDeleteArea: (areaId: Number) => void;
  areaId: Number;
}) {
  const { soilType, irrigationType, size, handleDeleteArea, areaId } = props;

  return (
    <div className="flex flex-col gap-2 mx-3 p-4 border rounded-lg shadow-md text-gray-600 text-sm font-light">
      <div className="px-3">
        <h1 className="font-bold text-lg">Área Azul</h1>
        <p>Tipo de solo: {soilType}</p>
        <p>Tipo de irrigação: {irrigationType}</p>
        <p>Tamanho: {size}</p>
      </div>
      <div className="grid grid-flow-col grid-cols-2 w-full gap-2">
        <DeleteAreaConfirmDialog handleDeleteArea={handleDeleteArea} areaId={areaId} />
        <Link href={'/gerenciamentoArea/editarArea'} className="w-full">
          <Button
            className="w-full border-green-700 text-green-700 py-5 px-4 basis-1"
            variant="outline"
          >
            <Pencil />
            Editar
          </Button>
        </Link>
      </div>
    </div>
  );
}
