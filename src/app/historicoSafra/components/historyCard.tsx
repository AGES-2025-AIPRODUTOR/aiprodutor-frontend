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
  const formatAreaText = (areaText: string) => {
    const areas = areaText.split(', ');
    if (areas.length <= 2) return areaText;
    if (areas.length <= 3) {
      return areas.join(', ');
    }

    const firstTwo = areas.slice(0, 2).join(', ');
    return `${firstTwo} e mais ${areas.length - 2} área(s)`;
  };

  const formatAreaDisplay = (areaText: string) => {
    const areas = areaText.split(', ');
    return {
      short: formatAreaText(areaText),
      hasMore: areas.length > 3,
      allAreas: areas,
    };
  };

  const areaDisplay = formatAreaDisplay(areaName);

  const fields = [
    { label: 'Início', value: plantingDate, Icon: Calendar, type: 'normal' },
    { label: 'Fim', value: harvestDate, Icon: Calendar, type: 'normal' },
    {
      label: 'Área',
      value: areaDisplay.short,
      Icon: Scaling,
      type: 'area',
      fullValue: areaDisplay,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold" style={{ fontSize: '16px' }}>
          {name}
        </h2>
        <StatusBadge status={status} />
      </div>

      <div className="space-y-2 text-gray-600" style={{ fontSize: '14px' }}>
        {fields.map((field) => {
          const { Icon } = field;

          if (field.type === 'area' && field.fullValue?.hasMore) {
            return (
              <div key={field.label} className="space-y-1">
                <div className="flex items-start gap-1">
                  <Icon size={14} className="text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="font-medium">{field.label}:</span>
                    <span className="ml-1 break-words">{field.value}</span>
                  </div>
                </div>
                <details className="ml-4 text-xs text-gray-500">
                  <summary className="cursor-pointer hover:text-gray-700 select-none py-1">
                    Ver todas as áreas ({field.fullValue.allAreas.length})
                  </summary>
                  <div className="mt-1 pl-3 border-l-2 border-green-200 bg-gray-50 rounded-r p-2 space-y-0.5">
                    {field.fullValue.allAreas.map((area: string, areaIndex: number) => (
                      <div key={areaIndex} className="text-gray-700 text-sm">
                        <span className="font-medium text-green-600">{areaIndex + 1}.</span>{' '}
                        {area.trim()}
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            );
          }

          return (
            <div key={field.label} className="flex items-center gap-1">
              <Icon size={14} className="text-gray-500" />
              <span className="font-medium">{field.label}:</span> <span>{field.value}</span>
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
