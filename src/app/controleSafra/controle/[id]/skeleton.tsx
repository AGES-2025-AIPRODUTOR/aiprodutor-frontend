'use client';
import { Skeleton } from '@/components/ui/skeleton';

function GeneralInfoTableSkeleton() {
  const rows = 6;
  return (
    <div className="rounded-md divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex justify-between items-center px-4 py-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

export function PlantingAccordionSkeleton() {
  return (
    <div className="rounded-md border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-4" />
      </div>
    </div>
  );
}

export function SafraControlPanelSkeleton() {
  return (
    <main className="p-4 flex flex-col gap-2">
      <Skeleton className="h-6 w-48 mx-auto mb-4" />
      <Skeleton className="h-5 w-40 mx-auto" />
      <GeneralInfoTableSkeleton />
      <div className="py-4">
        <hr className="border-b-1 border-gray-300 mx-1" />
        <hr className="border-b-1 border-gray-300 mx-1" />
      </div>
      <Skeleton className="h-5 w-56 mx-auto" />
      <PlantingAccordionSkeleton />
    </main>
  );
}
