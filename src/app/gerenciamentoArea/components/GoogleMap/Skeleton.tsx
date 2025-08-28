'use client';
import Loading from '@/components/Loading'; 
type Props = { height?: number | string };

export default function MapSkeleton({ height = '70vh' }: Props) {
  return (
    <div className="relative w-full rounded-lg overflow-hidden" style={{ height }}>
      <div className="absolute inset-0 bg-neutral-200 animate-pulse" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Loading label="Carregando… Area" />
      </div>
    </div>
  );
}
