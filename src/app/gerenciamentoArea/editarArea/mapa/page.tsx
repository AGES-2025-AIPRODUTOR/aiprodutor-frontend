'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getAllAreas } from '@/service/areas';
import MapAreaViewer from '../../components/MapAreaViewer';
import { useAgriculturalProducerContext } from '@/context/AgriculturalProducerContext';

export default function MapaAreas() {
  const router = useRouter();
  const { data } = useAgriculturalProducerContext();

  const { refetch } = useQuery({
    queryKey: ['areas'],
    queryFn: () => getAllAreas(data.id ?? 0),
  });

  const handleBack = () => {
    router.push('/gerenciamentoArea');
  };

  return <MapAreaViewer onBack={handleBack} refetch={refetch} />;
}
