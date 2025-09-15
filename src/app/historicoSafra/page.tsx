'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Bookmark } from "lucide-react";
import { HistoricoSafraCard, HistoricoSafraItem } from "./components/components";

export const HistoricoSafraPage: React.FC<{
  onBack: () => void;
  onSearchChange: (value: string) => void;
  onFilterClick: () => void;
  onViewMap: (id: number) => void;
  searchValue: string;
  historico: HistoricoSafraItem[];
}> = ({ onBack, onSearchChange, onFilterClick, onViewMap, searchValue, historico }) => {
  return (
    <div className="min-h-screen bg-white p-4">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white">
        <ArrowLeft
          size={24}
          className="text-gray-600 cursor-pointer"
          onClick={onBack}
        />
        <div className="flex-1 flex justify-center">
          <h1 className="text-xl font-bold text-gray-700">Histórico</h1>
        </div>
        <div className="w-6"></div> {/* Espaço para balancear o ArrowLeft */}
      </div>

      {/* Pesquisa e Filtros */}
      <div className="px-4 py-3 flex items-center gap-2">
        <Input
          placeholder="Pesquisar"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1"
          style={{ fontSize: '11px' }}
        />
        <button
          onClick={onFilterClick}
          className="px-3 py-2 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          style={{ backgroundColor: '#38A068', fontSize: '11px' }}
        >
          <Bookmark size={16} />
          Filtros
        </button>
      </div>

      {/* Espaço reservado para filtros */}
      <div className="px-4 pb-4">{/* Filtros virão aqui */}</div>

      {/* Lista de cards */}
      <div className="px-4 space-y-3">
        {historico.map((item) => (
          <HistoricoSafraCard key={item.id} item={item} onViewMap={onViewMap} />
        ))}
      </div>
    </div>
  );
};

// 🔹 Página principal que importa o histórico
const Page = () => {
  const router = useRouter();

  const historico: HistoricoSafraItem[] = [
    {
      id: 1,
      nome: "Safra de Soja",
      status: "Concluída",
      plantio: "01/03/2025",
      colheita: "10/08/2025",
      peso: "500kg",
      colhida: "450kg",
      area: "10ha",
      tamanho: "Grande",
    },
    {
      id: 2,
      nome: "Safra de Milho",
      status: "Em Andamento",
      plantio: "05/03/2025",
      colheita: "12/09/2025",
      peso: "200kg",
      colhida: "—",
      area: "5ha",
      tamanho: "Médio",
    },
    {
      id: 3,
      nome: "Safra de Arroz",
      status: "Excluída",
      plantio: "15/02/2025",
      colheita: "20/07/2025",
      peso: "300kg",
      colhida: "—",
      area: "8ha",
      tamanho: "Médio",
    },
  ];

  return (
    <HistoricoSafraPage
      onBack={() => router.push("/home")}
      onSearchChange={(val) => console.log("Pesquisar:", val)}
      onFilterClick={() => console.log("Abrir filtros")}
      onViewMap={(id) => console.log("Ver mapa:", id)}
      searchValue=""
      historico={historico}
    />
  );
};

export default Page;