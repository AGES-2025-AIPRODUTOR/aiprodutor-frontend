import React from 'react';
import { AlertTriangle, Filter, Sprout } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingSkeletonProps {
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-full mt-4 rounded-lg" />
        </div>
      ))}
    </>
  );
};

export const ErrorMessage: React.FC = () => {
  return (
    <div className="text-center py-8">
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <div className="text-red-600">
          <p className="font-medium">Erro ao carregar dados</p>
          <p className="text-sm text-red-500 mt-1">Tente novamente mais tarde</p>
        </div>
      </div>
    </div>
  );
};

interface EmptyStateProps {
  variant?: 'search' | 'filter';
}

export const EmptyState: React.FC<EmptyStateProps> = ({ variant = 'filter' }) => {
  const isSearch = variant === 'search';

  return (
    <div className="text-center py-8">
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
          <Filter className="w-6 h-6 text-gray-400" />
        </div>
        <div className="text-gray-500">
          <p className="font-medium">
            {isSearch ? 'Nenhuma safra encontrada com esse nome' : 'Nenhuma Safra encontrada'}
          </p>
          <p className="text-sm mt-1">
            {isSearch ? 'Tente pesquisar por outro nome' : 'Tente ajustar os filtros de pesquisa'}
          </p>
        </div>
      </div>
    </div>
  );
};

export const SafraDetailSkeleton: React.FC = () => {
  return (
    <div className="min-h-full bg-white">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        <div className="flex items-center gap-6 mb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Sprout size={20} className="text-green-600" />
          <span style={{ fontSize: '16px', fontWeight: '600' }}>
            Plantios (<Skeleton className="h-4 w-3 inline-block align-middle" />)
          </span>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900" style={{ fontSize: '16px' }}>
            Plantios desta Safra
          </h3>

          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>

              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, fieldIndex) => (
                  <div key={fieldIndex} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3.5 w-3.5" />
                      <Skeleton className="h-3.5 w-20" />
                    </div>
                    <Skeleton className="h-3.5 w-16" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
