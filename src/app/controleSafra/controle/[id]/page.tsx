'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import PageTitle from '@/components/PageTitle';
import { getSafraById, type SafraDetalhe } from '@/service/safras';
import { SafraControlPanelSkeleton } from './skeleton';
import GeneralInfoTable from './components/GeneralInfoTable';
import PlantingAccordion from './components/PlantingAccordion';
import { PlantingsEmptyState } from './components/EmptyState';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function Page() {
  const { id } = useParams();
  const [safra, setSafra] = useState<SafraDetalhe>();
  const [openErrorModal, setOpenErrorModal] = useState(false);

  const {
    data: response,
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['safra-detalhe', id],
    queryFn: () => getSafraById(Number(id) || 0),
    enabled: Boolean(id),
    retry: false,
  });

  useEffect(() => {
    if (isError || response?.isSuccess === false) setOpenErrorModal(true);
    else setOpenErrorModal(false);

    if (response?.isSuccess && response.response) setSafra(response.response);
  }, [response, isError]);

  if (isLoading && !safra) {
    return <SafraControlPanelSkeleton />;
  }

  return (
    <>
      <Dialog
        open={openErrorModal}
        onOpenChange={() => {
          window.location.href = '/controleSafra';
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ocorreu um erro ao buscar os dados</DialogTitle>
            <DialogDescription>
              Não foi possível carregar as informações da safra. Por favor, tente novamente ou volte
              para a página anterior.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-2">
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => {
                window.location.href = '/controleSafra';
              }}
            >
              Voltar
            </Button>
            <Button
              className="flex-1 bg-green-600"
              onClick={async () => {
                setOpenErrorModal(false);
                const result = await refetch();
                if (!result.data?.isSuccess) {
                  setOpenErrorModal(true);
                }
              }}
            >
              Tentar novamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {safra && (
        <main>
          <PageTitle title="Painel de Controle" variant="no-border-center" href="/controleSafra" />

          {!!safra.nome && (
            <h1 className="text-center text-xl text-green-700 font-bold">{safra.nome}</h1>
          )}

          <h1 className="text-center text-lg text-gray-600 pt-4">Informações Gerais</h1>

          <div className="w-full px-4 mt-4 text-sm">
            <GeneralInfoTable safra={safra} />
          </div>

          <div className="py-4">
            <hr className="border-1 border-gray-300 mx-4" />
            <hr className="border-1 border-gray-300 mx-4" />
          </div>

          <PlantingsEmptyState show={(safra.plantios?.length ?? 0) < 1} />

          <div className="py-2 flex flex-col gap-2">
            {safra.plantios?.map((planting) => (
              <PlantingAccordion planting={planting} key={planting.id} />
            ))}
          </div>
        </main>
      )}
    </>
  );
}
