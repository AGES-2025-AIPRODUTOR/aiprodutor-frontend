'use client';
import React, { useEffect, useState } from "react";
import AreaCardList from "./AreaCardList";
import { Button } from "@/components/ui/button";
import { getAllAreas, AreasEntity } from "@/service/areas";
import Loading from "@/components/Loading";

interface AreaListModalProps {
  producerId: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selected: AreasEntity[]) => void;
}

export default function AreaListModal({ producerId, isOpen, onClose, onConfirm }: AreaListModalProps) {
  const [areas, setAreas] = useState<AreasEntity[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    getAllAreas(producerId)
      .then(({ isSuccess, response, errorMessage }) => {
        if (isSuccess && response) setAreas(response);
        else setError(errorMessage || "Erro ao carregar áreas");
      })
      .catch(err => setError(err.message || "Erro desconhecido"))
      .finally(() => setLoading(false));
  }, [producerId, isOpen]);

  const toggleSelection = (id: number, checked: boolean) =>
    setSelectedIds(prev => checked ? [...prev, id] : prev.filter(i => i !== id));

  const handleConfirm = () => {
    onConfirm(areas.filter(a => selectedIds.includes(a.id)));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-background w-[95vw] max-w-xl h-[90vh] rounded-lg shadow-lg p-6 flex flex-col">
        <h2 className="text-lg font-semibold text-center sm:text-left">
          Selecione as áreas desejadas
        </h2>

        <div className="flex-1 overflow-y-auto mt-4 flex flex-col gap-3">
          {loading && <Loading label="Carregando áreas..." center />}
          {error && <p className="text-red-600">{error}</p>}
          {!loading && !error && areas.map(area => (
            <AreaCardList
              key={area.id}
              areaName={area.name}
              soilType={area.soilTypeId ? `Solo #${area.soilTypeId}` : "Não definido"}
              irrigationType={area.irrigationTypeId ? `Irrigação #${area.irrigationTypeId}` : "Não definido"}
              size="1 ha"
              checked={selectedIds.includes(area.id)}
              onCheckedChange={checked => toggleSelection(area.id, checked)}
            />
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={onClose} className="flex-1 text-green-600 border border-green-600 bg-white">
            Cancelar
          </Button>
          <Button onClick={handleConfirm} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
            Concluir
          </Button>
        </div>
      </div>
    </div>
  );
}
