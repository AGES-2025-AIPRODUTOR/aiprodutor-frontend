import { Calendar, Scaling } from 'lucide-react';
import { StatusBadge, StatusType } from './statusBadge';

export const HistoricoSafraCard: React.FC<{
  id: number;
  name: string;
  plantingDate: string;
  harvestDate: string;
  status: StatusType;
  areaName: string;
  onDetailsClick?: (id: number) => void;
}> = ({ id, name, plantingDate, harvestDate, status, areaName, onDetailsClick }) => {
  const fields = [
    { label: 'Início', value: plantingDate, Icon: Calendar },
    { label: 'Fim', value: harvestDate, Icon: Calendar },
    { label: 'Área', value: areaName, Icon: Scaling },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold" style={{ fontSize: '16px' }}>
          {name}
        </h2>
        <StatusBadge status={status} />
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-gray-600"
        style={{ fontSize: '14px' }}
      >
        {fields.map((field) => {
          const { Icon } = field;
          return (
            <div key={field.label} className="flex items-center gap-1">
              <Icon size={14} className="text-gray-500" />
              <span className="font-medium">{field.label}:</span> {field.value}
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <button
          onClick={() => onDetailsClick?.(id)}
          className="w-full py-2 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#38A068', fontSize: '14px' }}
        >
          Detalhes
        </button>
      </div>
    </div>
  );
};
