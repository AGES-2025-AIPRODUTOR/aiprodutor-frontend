'use client';
import React, { useState, useEffect } from "react";
import { ConfirmDialog } from "./confirmDialog";
import { AreasEntity } from "@/service/areas";
import PolygonMini from "../PolygonMini";

type SelecionarAreaProps = {
  areas?: AreasEntity[];
};

export default function SelecionarArea({ areas = [] }: SelecionarAreaProps) {
  const [listaAreas, setListaAreas] = useState<AreasEntity[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [confirmExcluirId, setConfirmExcluirId] = useState<number | null>(null);

  useEffect(() => {
    setListaAreas(areas);
  }, [areas]);

  const excluirArea = (id: number) => {
    setListaAreas(prev => prev.filter(area => area.id !== id));
  };

  const abrirModal = () => setModalAberto(true);
  const fecharModal = () => setModalAberto(false);

  const nomeAreaConfirm = confirmExcluirId
    ? listaAreas.find(a => a.id === confirmExcluirId)?.name ?? ""
    : "";

  return (
    <div className="text-gray-400">
      <div className="flex justify-between items-end m-1">
        <label>Áreas</label>
        <button
          className="text-green-300 border rounded-sm border-green-300 p-0.5"
          onClick={abrirModal}
        >
          Adicionar Áreas
        </button>
      </div>

      <div className="px-4 py-1 bg-white w-[90vw] max-w-[600px] h-[8rem] border border-neutral-300 rounded-md relative overflow-y-auto">
        {listaAreas.length === 0 ? (
          <div className="text-gray-400 text-sm">
            <span className="block mb-1">
              Clique em 'Adicionar Áreas' para escolher entre as áreas disponíveis
            </span>
            <span className="block">Área total da produção: 0.0ha</span>
          </div>
        ) : (
          listaAreas.map(area => (
            <div
              key={area.id}
              className="flex items-center border-b border-neutral-200 py-1 w-full"
            >
              {/* Nome da área */}
              <span className="w-[60%] truncate block" title={area.name}>
                {area.name}
              </span>

              {/* PolygonMini - modificar cores quando tiver no back*/}
              <div className="w-[20%] ml-2">
                {area.polygon?.coordinates?.length ? (
                  <PolygonMini
                    polygon={area.polygon}
                    size={32}
                    padding={4}
                    stroke="#4ade80"
                    fill="#a7f3d0"
                    strokeWidth={2}
                    frameStroke="#6C6A6D"
                    frameStrokeWidth={1}
                  />
                ) : null}
              </div>

              {/* Botão de excluir */}
              <button
                className="border rounded-sm border-red-700 text-red-700 p-0.5 ml-auto"
                onClick={() => setConfirmExcluirId(area.id)}
              >
                Excluir
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal de confirmação */}
      <ConfirmDialog
        isOpen={confirmExcluirId !== null}
        description={`Deseja realmente excluir a área "${nomeAreaConfirm}"?`}
        onConfirm={() => {
          if (confirmExcluirId !== null) excluirArea(confirmExcluirId);
          setConfirmExcluirId(null);
        }}
        onCancel={() => setConfirmExcluirId(null)}
      />

      {/* Modal de adicionar áreas */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-lg max-w-md w-full">
            <h2 className="text-lg font-bold mb-2">Selecione uma área</h2>
            <p className="text-sm text-gray-500 mb-4">
              Aqui você colocará sua lista de áreas disponíveis para adicionar.
            </p>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={fecharModal}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
