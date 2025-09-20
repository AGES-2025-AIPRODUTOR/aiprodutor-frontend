'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const SafraCardSkeleton: React.FC = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
    {/* Header skeleton */}
    <div className="flex justify-between items-start mb-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-8 w-24" />
    </div>

    {/* Dates skeleton */}
    <div className="space-y-2 mb-4">
      <div className="flex items-center">
        <Skeleton className="w-4 h-4 mr-2" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex items-center">
        <Skeleton className="w-4 h-4 mr-2" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>

    {/* Buttons skeleton */}
    <div className="flex gap-2">
      <Skeleton className="h-9 flex-1" />
      <Skeleton className="h-9 flex-1" />
    </div>
  </div>
);
