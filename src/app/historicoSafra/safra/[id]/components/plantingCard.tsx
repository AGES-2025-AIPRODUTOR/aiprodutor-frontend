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
  const fields = [
    { label: 'Data Inicial', value: planting.initialDate, Icon: Calendar },
    { label: 'Data Final', value: planting.finalDate, Icon: Calendar },
    { label: 'Quantidade Esperada', value: planting.expectedQuantity, Icon: Package },
    { label: 'Área', value: planting.area, Icon: MapPin },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <Sprout size={16} className="text-green-600" />
        <h3 className="font-semibold text-gray-900" style={{ fontSize: '16px' }}>
          {planting.name}
        </h3>
      </div>

      <div className="space-y-2">
        {fields.map((field, index) => {
          const { Icon } = field;
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
