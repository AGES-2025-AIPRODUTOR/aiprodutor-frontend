import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './statusBadge';
import { HistoryEntity, PlantingItem } from '@/service/history';

type HistoryEntityDisplay = Omit<HistoryEntity, 'status'> & {
  status: string;
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Não definida';

  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const calculateTotalQty = (planting: PlantingItem[]): string => {
  if (!planting || planting.length === 0) return '0kg';

  let totalKg = 0;

  planting.forEach((item) => {
    const match = item.qtyEstimated.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      totalKg += parseFloat(match[1]);
    }
  });

  return `${totalKg}kg`;
};

export const HistoricoSafraCard: React.FC<{
  safra: HistoryEntityDisplay;
  onDetailsClick?: (id: number) => void;
}> = ({ safra, onDetailsClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const totalQty = calculateTotalQty(safra.planting || []);

  const startDate = formatDate(safra.safraInitialDate);
  const endDate = safra.safraEndDate ? formatDate(safra.safraEndDate) : 'Em andamento';
  const dateRange = `${startDate} – ${endDate}`;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-base">{safra.safraName}</h2>
        <StatusBadge status={safra.status} />
      </div>

      <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
        <Calendar size={14} className="text-gray-500" />
        <span className="font-medium">Período:</span>
        <span>{dateRange}</span>
      </div>

      <div className="mb-4">
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-3"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-800">Quantidade Total Esperada:</span>
            <span className="text-base font-bold text-gray-800">{totalQty}</span>
          </div>
          {isExpanded ? (
            <ChevronUp size={18} className="text-gray-500" />
          ) : (
            <ChevronDown size={18} className="text-gray-500" />
          )}
        </Button>

        {isExpanded && safra.planting && safra.planting.length > 0 && (
          <div className="mt-2 space-y-2">
            {safra.planting.map((planting) => (
              <div
                key={planting.id}
                className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200"
              >
                <span className="text-sm font-medium text-gray-800">{planting.plantingName}</span>
                <span className="text-sm font-semibold text-gray-800">{planting.qtyEstimated}</span>
              </div>
            ))}
          </div>
        )}

        {isExpanded && (!safra.planting || safra.planting.length === 0) && (
          <div className="mt-2 text-center text-sm text-gray-500 py-2">
            Nenhuma cultura cadastrada
          </div>
        )}
      </div>

      <div className="mt-4">
        <Button
          onClick={() => onDetailsClick?.(safra.safraId)}
          className="w-full py-2 text-sm"
        >
          Detalhes
        </Button>
      </div>
    </div>
  );
};
