'use client';
import Loading from '@/components/Loading';

export default function CadastroAreaSkeleton() {
  return (
    <div className="relative w-full min-h-screen bg-[var(--neutral-0)] font-[var(--font-family-base)] animate-pulse">

      {/* Skeleton da Página */}
      <div className="w-full flex flex-row items-center justify-between px-4 sm:px-8 mt-10 mb-4">
        <div className="w-8 h-8 bg-gray-300 rounded" />
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-300 rounded-full" />
          <div className="h-4 w-40 bg-gray-300 rounded" />
        </div>
        <div className="w-4 h-4 invisible" />
      </div>

      <div className="flex flex-col justify-between h-[calc(100vh-120px)] items-center px-4 sm:px-0 py-6">
        <div className="w-full max-w-sm flex flex-col gap-6">

          {/* Nome da Área */}
          <div className="flex flex-col gap-1 w-full px-2">
            <div className="flex px-1 justify-between items-center">
              <div className="h-4 w-24 bg-gray-300 rounded" />
              <div className="h-3 w-12 bg-gray-300 rounded" />
            </div>
            <div className="w-full h-9 bg-gray-300 rounded" />
          </div>

          {/* Dropdown Solo */}
          <div className="flex flex-col gap-1 px-2">
            <div className="h-4 w-24 bg-gray-300 rounded mb-1" />
            <div className="w-full h-9 bg-gray-300 rounded" />
          </div>

          {/* Dropdown Irrigação */}
          <div className="flex flex-col gap-1 px-2">
            <div className="h-4 w-28 bg-gray-300 rounded mb-1" />
            <div className="w-full h-9 bg-gray-300 rounded" />
          </div>

          {/* Tipo de Cultivo */}
          <div className="flex flex-col gap-1 px-2">
            <div className="flex justify-between items-center px-1">
              <div className="h-4 w-28 bg-gray-300 rounded" />
              <div className="h-3 w-12 bg-gray-300 rounded" />
            </div>
            <div className="w-full h-9 bg-gray-300 rounded" />
          </div>
        </div>

        {/* Tamanho da área */}
        <div className="text-center mt-2 flex flex-col gap-2">
          <div className="h-4 w-20 bg-gray-300 rounded mx-auto" />
          <div className="h-3 w-32 bg-gray-300 rounded mx-auto" />
        </div>

        {/* Botão Concluir */}
        <div className="flex justify-center mt-2">
          <div className="h-12 w-44 bg-gray-300 rounded" />
        </div>
      </div>

      {/* Loading sobreposto */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Loading label="Carregando formulário..." />
      </div>
    </div>
  );
}
