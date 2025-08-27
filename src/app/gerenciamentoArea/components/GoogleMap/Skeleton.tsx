'use client';

type Props = { height?: number | string };
export default function MapSkeleton({ height = '70vh' }: Props) {
  return (
    <div style={{ height }} className="w-full rounded-lg bg-neutral-200 animate-pulse" />
  );
}
