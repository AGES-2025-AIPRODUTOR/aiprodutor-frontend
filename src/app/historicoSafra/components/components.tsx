'use client';

import React from "react";
import { Calendar, Redo, Weight, Scaling, Ruler } from "lucide-react";

// 🔹 Tipagem dos status permitidos
export type StatusType = "Concluído" | "Ativo" | "Em Andamento" | "Desativado";

// 🔹 Tag de Status
export const StatusBadge: React.FC<{ status: StatusType }> = ({ status }) => {
  const colors: Record<StatusType, { bg: string; text: string }> = {
    Concluído: { bg: "#38A067", text: "white" },
    Ativo: { bg: "#1A41FF", text: "white" },
    "Em Andamento": { bg: "#EDC606", text: "white" },
    Desativado: { bg: "#FF0000", text: "white" },
  };

  const statusStyle = colors[status] || { bg: "#6B7280", text: "white" }; // fallback para status não encontrado

  return (
    <span 
      className="px-2 py-1 rounded-full font-medium"
      style={{ 
        fontSize: '11px',
        backgroundColor: statusStyle.bg,
        color: statusStyle.text
      }}
    >
      {status}
    </span>
  );
};

// 🔹 Tipagem de cada item do histórico
export interface HistoricoSafraItem {
  id: number;
  nome: string;
  status: StatusType;
  plantio: string;
  colheita: string;
  peso: string;       // Qtd. Plantada
  colhida?: string;   // Qtd. Colhida
  area: string;
  tamanho: string;
}

// 🔹 Card de Histórico Safra com mapping automático e ícones corretos
export const HistoricoSafraCard: React.FC<{
  item: HistoricoSafraItem;
  onViewMap: (id: number) => void;
}> = ({ item, onViewMap }) => {
  const campos = [
    { label: "Plantio", value: item.plantio, Icon: Calendar },
    { label: "Colheita", value: item.colheita, Icon: Calendar },
    { label: "Qtd. Plantada", value: item.peso, Icon: Redo },
    { label: "Qtd. Colhida", value: item.colhida || "—", Icon: Weight },
    { label: "Área", value: item.area, Icon: Scaling },
    { label: "Tamanho", value: item.tamanho, Icon: Ruler },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold" style={{ fontSize: '11px' }}>{item.nome}</h2>
        <StatusBadge status={item.status} />
      </div>

      <div className="grid grid-cols-2 gap-y-2 text-gray-600" style={{ fontSize: '11px' }}>
        {campos.map((campo) => (
          <div key={campo.label} className="flex items-center gap-1">
            <campo.Icon size={16} className="flex-shrink-0" />
            <span className="font-medium">{campo.label}:</span> {campo.value}
          </div>
        ))}
      </div>

      <div className="mt-4">
        <button
          onClick={() => onViewMap(item.id)}
          className="w-full py-2 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#38A068', fontSize: '11px' }}
        >
          Visualizar no Mapa
        </button>
      </div>
    </div>
  );
};