'use client';
import Loading from '@/components/Loading';

export default function CadastroAreaSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto bg-[var(--neutral-0)] font-[var(--font-family-base)] flex flex-col">

      {/* Cabeçalho */}
      <div className="flex justify-center mt-8 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-300 rounded-full" />
          <div className="h-4 w-40 bg-gray-300 rounded" />
        </div>
      </div>

      {/* Formulário simulado */}
      <div
        className="flex flex-col justify-between items-center px-4 sm:px-0 relative"
        style={{ height: 'calc(100vh - 50px)' }}
      >
        <div className="w-full max-w-sm flex flex-col gap-4 py-4 flex-1 overflow-y-auto relative animate-pulse">

          {/* Campos simulados */}
          <div className="flex flex-col gap-4">
            <div className="h-9 bg-gray-300 rounded" /> {/* Nome da Área */}
            <div className="h-9 bg-gray-300 rounded" /> {/* Tipo de Solo */}
            <div className="h-9 bg-gray-300 rounded" /> {/* Tipo de Irrigação */}
            <div className="h-9 bg-gray-300 rounded" /> {/* Tipo de Cultivo */}

            {/* Tamanho da Área */}
            <div className="flex flex-col gap-1 text-center">
              <div className="h-4 w-20 bg-gray-300 rounded mx-auto" />
              <div className="h-3 w-32 bg-gray-300 rounded mx-auto" />
            </div>

            {/* Botão Concluir */}
            <div className="h-12 w-44 bg-gray-300 rounded mx-auto" />
          </div>

          {/* Loading centralizado */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Loading label="Carregando formulário..." />
          </div>
        </div>
      </div>
    </div>
  );
}
