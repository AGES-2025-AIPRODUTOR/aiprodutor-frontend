'use client';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { DeleteAreaConfirmDialog } from './DeleteAreaConfirmDialog';
import { deleteArea, editArea } from '@/service/areas';
import { toast } from 'sonner';
import { useSoilAndIrrigationTypes } from '../hooks/useSoilAndIrrigationTypes';
import { useRouter, usePathname } from 'next/navigation';

const formSchema = z.object({
  areaName: z.string().min(2, { message: 'Nome da área deve ter pelo menos 2 caracteres.' }),
  soilType: z.string().min(1, { message: 'Selecione o tipo de solo.' }),
  irrigationType: z.string().min(1, { message: 'Selecione o tipo de irrigação.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface EditAreaFormProps {
  areaId: number;
  areaName?: string;
  soilTypeName?: string;
  irrigationTypeName?: string;
  refetch?: () => void;
  onClose?: () => void;
}

export function EditAreaForm({
  areaId,
  areaName,
  soilTypeName,
  irrigationTypeName,
  refetch,
  onClose,
}: EditAreaFormProps) {
  const { soilTypes, irrigationTypes, loading } = useSoilAndIrrigationTypes();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      areaName: areaName || '',
      soilType: soilTypeName || '',
      irrigationType: irrigationTypeName || '',
    },
  });

  useEffect(() => {
    if (!loading && soilTypes.length > 0 && irrigationTypes.length > 0) {
      if (areaName) form.setValue('areaName', areaName);
      if (soilTypeName) form.setValue('soilType', soilTypeName);
      if (irrigationTypeName) form.setValue('irrigationType', irrigationTypeName);
    }
  }, [areaName, soilTypeName, irrigationTypeName, form, loading, soilTypes.length, irrigationTypes.length]);

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    try {
      const { isSuccess, errorMessage } = await editArea(areaId, {
        name: data.areaName,
        soilTypeId: soilTypes.find((type) => type.name === data.soilType)?.id ?? 0,
        irrigationTypeId: irrigationTypes.find((type) => type.name === data.irrigationType)?.id ?? 0,
        isActive: true,
      });

      if (isSuccess) {
        toast.success('Área Editada com Sucesso.');
        if (pathname === '/gerenciamentoArea') {
          refetch?.();
          // opcional: router.refresh();
          onClose?.();
        } else {
          router.push('/gerenciamentoArea');
        }
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleDeleteArea = async (areaId: number) => {
    const { isSuccess, errorMessage } = await deleteArea(areaId);
    if (isSuccess) {
      toast.success('Área Excluída com Sucesso.');
      if (pathname === '/gerenciamentoArea') {
        refetch?.();
        // opcional: router.refresh();
        onClose?.();
      } else {
        router.push('/gerenciamentoArea');
      }
    } else {
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <div className="max-w-md mx-auto mt-2 align-middle px-8 pb-3 ">
        <div className="mt-4 mb-4 text-center flex flex-col items-center">
          <Label className="text-md text-center font-bold text-gray-700 ">{areaName}</Label>
          <div className="flex gap-2 mt-2">
            <div className="font-bold text-gray-500 text-md">Tamanho da área:</div>
            <div className="text-gray-500 text-base">{'2.5 ha (25.000 m²)'}</div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="soilType"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-mg font-bold mb-3 text-gray-700 block">Tipo de solo:</Label>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                      <SelectTrigger>
                        <SelectValue placeholder={loading ? "Carregando..." : "Selecione o tipo de solo"} />
                      </SelectTrigger>
                      <SelectContent>
                        {soilTypes.map((type) => (
                          <SelectItem key={type.id} value={type.name}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="irrigationType"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-mg font-bold mb-4 text-gray-700 block">Tipo de irrigação:</Label>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                      <SelectTrigger>
                        <SelectValue placeholder={loading ? "Carregando..." : "Selecione o tipo de irrigação"} />
                      </SelectTrigger>
                      <SelectContent>
                        {irrigationTypes.map((type) => (
                          <SelectItem key={type.id} value={type.name}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <DeleteAreaConfirmDialog
                handleDeleteArea={handleDeleteArea}
                areaId={areaId}
                buttonSize="sm"
              />
              <Button type="submit" className="w-full py-5 bg-green-600 hover:bg-green-700 mb-3">
                {isLoading ? 'Carregando...' : 'Concluir'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
