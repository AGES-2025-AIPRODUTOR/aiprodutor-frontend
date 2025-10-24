'use client';

import { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getAllAreas } from '@/service/areas';
import MapAreaViewer from '../../components/MapAreaViewer';
import { useAgriculturalProducerContext } from '@/context/AgriculturalProducerContext';

function EditAreaContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data } = useAgriculturalProducerContext();

  const areaId = params.id ? Number(params.id as string) : undefined;
  const soilTypeId = searchParams.get('soilTypeId')
    ? Number(searchParams.get('soilTypeId'))
    : undefined;
  const irrigationTypeId = searchParams.get('irrigationTypeId')
    ? Number(searchParams.get('irrigationTypeId'))
    : undefined;

  const { refetch } = useQuery({
    queryKey: ['areas'],
    queryFn: () => getAllAreas(data.id ?? 1),
  });

  const handleBack = () => {
    router.push('/gerenciamentoArea');
  };

  return (
    <MapAreaViewer
      selectedAreaId={areaId}
      soilTypeId={soilTypeId}
      irrigationTypeId={irrigationTypeId}
      onBack={handleBack}
      refetch={refetch}
    />
  );
}

export default function EditArea() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Carregando...</div>}>
      <EditAreaContent />
    </Suspense>
  );
}
