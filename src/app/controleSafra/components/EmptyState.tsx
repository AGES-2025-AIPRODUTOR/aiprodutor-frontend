'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Sprout } from 'lucide-react';
import Link from 'next/link';

export const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-6">
        <Sprout className="w-16 h-16 text-gray-400 mx-auto" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Nenhuma safra encontrada
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-sm">
        Você ainda não possui nenhuma safra cadastrada. Comece criando sua primeira safra.
      </p>
      
      <Link href="/cadastrarSafra">
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Nova Safra
        </Button>
      </Link>
    </div>
  );
};
