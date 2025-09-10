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
import { Trash2 } from 'lucide-react';

export function DeleteAreaConfirmDialog(props: {
  handleDeleteArea: (areaId: number) => void;
  areaId: number;
  buttonClassName?: string;
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
}) {
  const { handleDeleteArea, areaId, buttonSize } = props;

  const defaultClassName =
    buttonSize === 'sm'
      ? 'w-full bg-white hover:bg-gray-50 border-green-700 py-5 text-green-700 mb-3'
      : 'w-full border-green-700 text-green-700 py-5 px-4 basis-1';

  const buttonClassName = props.buttonClassName || defaultClassName;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={buttonClassName} variant="outline" size={buttonSize}>
          <Trash2 className="mb-[2px]" />
          Excluir
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-lg max-w-80">
        <DialogHeader>
          <DialogTitle className="text-gray-600">
            Você tem certeza que deseja excluir a área?
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <div className="flex flex-row gap-2 w-full">
              <Button className="w-full border-red-700 text-red-900" size={'lg'} variant="outline">
                Não
              </Button>
              <Button
                className="w-full border-green-700 text-green-700"
                size={'lg'}
                variant="outline"
                onClick={() => {
                  handleDeleteArea(areaId);
                }}
              >
                Sim
              </Button>
            </div>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
