'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-6">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Ops! Algo deu errado
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-sm">
        Não foi possível carregar as safras. Verifique sua conexão e tente novamente.
      </p>
      
      <Button 
        onClick={onRetry}
        variant="outline"
        className="border-green-600 text-green-600 hover:bg-green-50"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Tentar novamente
      </Button>
    </div>
  );
};
