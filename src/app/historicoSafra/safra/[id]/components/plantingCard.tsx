import React from 'react';
import { Calendar, MapPin, Package, Sprout } from 'lucide-react';

interface PlantioData {
  id: number;
  name: string;
  initialDate: string;
  finalDate: string;
  expectedQuantity: string;
  area: string;
}

interface PlantingCardProps {
  planting: PlantioData;
}

export const PlantingCard: React.FC<PlantingCardProps> = ({ planting }) => {
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

  const areaDisplay = formatAreaDisplay(planting.area);

  const fields = [
    { label: 'Data Inicial', value: planting.initialDate, Icon: Calendar, type: 'normal' },
    { label: 'Data Final', value: planting.finalDate, Icon: Calendar, type: 'normal' },
    {
      label: 'Quantidade Esperada',
      value: planting.expectedQuantity,
      Icon: Package,
      type: 'normal',
    },
    { label: 'Área', value: areaDisplay.short, Icon: MapPin, type: 'area', fullValue: areaDisplay },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <Sprout size={16} className="text-green-600" />
        <h3 className="font-semibold text-gray-900" style={{ fontSize: '16px' }}>
          {planting.name}
        </h3>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => {
          const { Icon } = field;

          if (field.type === 'area' && field.fullValue?.hasMore) {
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Icon size={14} className="text-gray-500 mt-0.5" />
                    <span className="text-gray-600" style={{ fontSize: '14px' }}>
                      {field.label}:
                    </span>
                  </div>
                  <div className="flex-1 text-right">
                    <span className="font-medium text-gray-900" style={{ fontSize: '14px' }}>
                      {field.value}
                    </span>
                  </div>
                </div>
                <details className="ml-5 text-xs text-gray-500">
                  <summary className="cursor-pointer hover:text-gray-700 select-none py-1">
                    Ver todas as áreas ({field.fullValue.allAreas.length})
                  </summary>
                  <div className="mt-2 pl-3 border-l-2 border-green-200 bg-gray-50 rounded-r p-2 space-y-1">
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
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon size={14} className="text-gray-500" />
                <span className="text-gray-600" style={{ fontSize: '14px' }}>
                  {field.label}:
                </span>
              </div>
              <span className="font-medium text-gray-900" style={{ fontSize: '14px' }}>
                {field.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
