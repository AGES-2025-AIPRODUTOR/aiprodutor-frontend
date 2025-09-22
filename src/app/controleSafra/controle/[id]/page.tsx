'use client';
import PageTitle from '@/components/PageTitle';
import { useAgriculturalProducerContext } from '@/context/AgriculturalProducerContext';
import { getSafraById, SafraControlEntity } from '@/service/safraControl';
import { useQuery } from '@tanstack/react-query';
import { Calendar1, CalendarCheck, Leaf, Map, MapPinned, Truck } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function page() {
  const params = useParams();
  const harvestId = params.id;
  const [safra, setSafra] = useState<SafraControlEntity>();
  const { data } = useAgriculturalProducerContext();
  const {
    data: response,
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['safras'],
    queryFn: () => getSafraById(data?.id ?? 0),
  });

  useEffect(() => {
    setSafra(response?.response);
  }, [response]);

  const tableIconProps = {
    strokeWidth: 1.5,
    size: 20,
  };

  return (
    <main>
      <PageTitle
        title="Painel de Controle"
        variant="no-border-center"
        Icon={undefined}
        href="/controleSafra"
      />
      <h1 className="text-center text-xl text-green-700 font-bold">
        {safra?.name || 'Safra Uva 2025'}
      </h1>

      {/* Bloco de Informações da Safra */}
      <h1 className="text-center text-lg text-gray-600 pt-4">Informações Gerais</h1>
      <div className="w-full px-6 mt-4">
        <table className="w-full">
          <tbody>
            <tr className="border-b">
              <td className="text-gray-500 flex gap-1 py-1.5">
                <MapPinned {...tableIconProps} />
                Número de Áreas
              </td>
              <td>3</td>
            </tr>
            <tr className="border-b">
              <td className="text-gray-500 flex gap-1 py-1.5">
                <Map {...tableIconProps} /> Área Total
              </td>
              <td>25,00 ha</td>
            </tr>
            <tr className="border-b">
              <td className="text-gray-500 flex gap-1 py-1.5">
                <Truck {...tableIconProps} /> Produtividade Esperada
              </td>
              <td>16.000 kg</td>
            </tr>
            <tr className="border-b">
              <td className="text-gray-500 flex gap-1 py-1.5">
                <Leaf {...tableIconProps} /> Cultivar
              </td>
              <td>Uva</td>
            </tr>
            <tr className="border-b">
              <td className="text-gray-500 flex gap-1 py-1.5">
                <Calendar1 {...tableIconProps} /> Data Inicial da Safra
              </td>
              <td>29/02/2026</td>
            </tr>
            <tr>
              <td className="text-gray-500 flex gap-1 py-1.5">
                <CalendarCheck {...tableIconProps} /> Data Final da Safra
              </td>
              <td>25/02/2027</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className='py-4'>
        <hr className="border-1 border-gray-300 mx-4" />
      <hr className="border-1 border-gray-300 mx-4" />
      </div>
      <h1 className="text-center text-xl text-green-700 font-bold px-12 leading-[1.1]">
        Plantios Vinculados à {safra?.name || 'Safra Uva 2025'}
      </h1>
    </main>
  );
}
