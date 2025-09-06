'use client';
import { useQuery } from '@tanstack/react-query';
import AreaCard from './components/AreaCard';
import { AreasEntity, deleteArea, getAllAreas } from '@/service/areas';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import PageTitle from '../../components/PageTitle';
import { Plus } from 'lucide-react';

export default function GerenciamentoArea() {
  const [areasList, setAreasList] = useState<AreasEntity[]>([]);

  const {
    data: response,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['areas'],
    queryFn: () => getAllAreas(0),
  });

  const handleDeleteArea = async (areaId: Number) => {
    const { isSuccess, errorMessage } = await deleteArea(areaId);
    if (isSuccess) {
      toast('Área Excluída com Sucesso.');
      refetch();
    } else {
      toast(errorMessage);
    }
  };

  useEffect(() => {
    setAreasList(response?.response ?? []);
  }, [response]);

  return (
    <main className="sm:max-w-7xl flex-1 h-[calc(100%-50px)] mx-auto flex flex-col">
      <PageTitle title={'Áreas Cadastradas'} href="/" variant={'center'} />
      <div className="flex justify-center w-full py-4 border-b mb-3">
        <Button variant={'outline'} className="border-green-700 text-green-700 py-7 px-4">
          <Plus /> Adicionar Nova Área
        </Button>
      </div>
      <div className="flex flex-col flex-h-[calc(100%-50px)]ol gap-3 pb-4">
        <AreaCard
          soilType="Arenoso"
          irrigationType="Superficial"
          size="1 ha (10000m²)"
          handleDeleteArea={handleDeleteArea}
          areaId={0}
        />
        <AreaCard
          soilType="Arenoso"
          irrigationType="Superficial"
          size="1 ha (10000m²)"
          handleDeleteArea={handleDeleteArea}
          areaId={0}
        />
        <AreaCard
          soilType="Arenoso"
          irrigationType="Superficial"
          size="1 ha (10000m²)"
          handleDeleteArea={handleDeleteArea}
          areaId={0}
        />
        <AreaCard
          soilType="Arenoso"
          irrigationType="Superficial"
          size="1 ha (10000m²)"
          handleDeleteArea={handleDeleteArea}
          areaId={0}
        />
        <AreaCard
          soilType="Arenoso"
          irrigationType="Superficial"
          size="1 ha (10000m²)"
          handleDeleteArea={handleDeleteArea}
          areaId={0}
        />
      </div>
      <div className="sticky bottom-0 w-full px-6 py-5 bg-white border drop-shadow-2xl mt-auto">
        <Link href={'gerenciamentoArea/mapaAreas'}>
          <Button
            className="w-full border-green-700 bg-green-700 active:bg-green-900 focus:bg-green-900 py-7"
            size={'lg'}
          >
            Visualizar no Mapa
          </Button>
        </Link>
      </div>
    </main>
  );
}
