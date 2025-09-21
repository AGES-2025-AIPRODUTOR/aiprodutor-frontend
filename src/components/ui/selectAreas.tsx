'use client'

import React, { useState } from "react"
import { ConfirmDialog } from "./confirmDialog" // ajuste o caminho se necessário

/* Tipo que define cada área */
export type Area = {
  id: number
  nome: string
  componente: React.ReactNode
}

/* Props do componente */
type SelecionarAreaProps = {
  areas?: Area[]
}

export default function SelecionarArea({ areas = [] }: SelecionarAreaProps) {
  const [listaAreas, setListaAreas] = useState<Area[]>(areas)
  const [modalAberto, setModalAberto] = useState(false)

  const [confirmExcluirId, setConfirmExcluirId] = useState<number | null>(null)

  const excluirArea = (id: number) => {
    setListaAreas(listaAreas.filter(area => area.id !== id))
  }

  const abrirModal = () => setModalAberto(true)
  const fecharModal = () => setModalAberto(false)

  return (
    <div className="text-gray-400">
      {/* Cabeçalho fixo */}
      <div className="flex justify-between items-end m-1">
        <label>Áreas</label>
        <button
          className="text-green-300 border rounded-sm border-green-300 p-0.5"
          onClick={abrirModal}
        >
          Adicionar Áreas
        </button>
      </div>

      {/* Caixa fixa */}
      <div className="px-4 py-1 bg-white w-[90vw] max-w-[600px] h-[8rem] border border-neutral-300 rounded-md relative overflow-y-auto">
        {listaAreas.length === 0 ? (
          <span className="text-gray-400">Clique em 'Adicionar Áreas' para escolher entre as áreas disponíveis</span>
        ) : (
          listaAreas.map(area => (
            <div
              key={area.id}
              className="flex items-center border-b border-neutral-200 py-1 w-full"
            >
              <span className="w-[60%] truncate block" title={area.nome}>
                {area.nome}
              </span>
              <div className="w-[20%] ml-5">{area.componente}</div>
              <button
                className="border rounded-sm border-red-700 text-red-700 p-0.5 ml-2"
                onClick={() => setConfirmExcluirId(area.id)}
              >
                Excluir
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal de confirmação de exclusão */}
      <ConfirmDialog
        isOpen={confirmExcluirId !== null}
        description={`Deseja realmente excluir a área "${listaAreas.find(a => a.id === confirmExcluirId)?.nome}"?`}
        onConfirm={() => {
          if (confirmExcluirId !== null) excluirArea(confirmExcluirId)
          setConfirmExcluirId(null)
        }}
        onCancel={() => setConfirmExcluirId(null)}
      />

      {/* Modal básico de adicionar áreas - SUBSTITUIR PELO MODAL QUANDO FOR CRIADO */}
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
  )
}
