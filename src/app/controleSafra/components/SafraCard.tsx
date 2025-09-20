'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Edit, Trash2 } from 'lucide-react';
import { SafraEntity } from '@/service/safraControl';

interface SafraCardProps {
  safra: SafraEntity;
  onEdit: (safraId: number) => void;
  onDelete: (safraId: number) => void;
  onViewControl: (safraId: number) => void;
}

export const SafraCard: React.FC<SafraCardProps> = ({ safra, onEdit, onDelete, onViewControl }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{safra.safraName}</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onViewControl(safra.safraId)}
          className="border-green-600 text-green-600 hover:bg-green-50 bg-white"
        >
          Ver Controle
        </Button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2 text-gray-500" />
          <span><strong>Início:</strong> {formatDate(safra.safraInitialDate)}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2 text-gray-500" />
          <span><strong>Fim:</strong> {formatDate(safra.safraEndDate)}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(safra.safraId)}
          className="flex-1 border-green-600 text-green-600 hover:bg-green-50 bg-white"
        >
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(safra.safraId)}
          className="flex-1 border-green-600 text-green-600 hover:bg-green-50 bg-white"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Excluir
        </Button>
      </div>
    </div>
  );
};
