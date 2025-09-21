'use client'

import React, { useState } from "react"

/* Tipo que define cada área - para usar no modal*/
export type Area = {
    id: number
    nome: string
    componente: React.ReactNode
}

/* Props do componente, o array é opcional */
type SelecionarAreaProps = {
    areas?: Area[]
}

export default function SelecionarArea({ areas = [] }: SelecionarAreaProps) {
    // Estado interno do componente
    const [listaAreas, setListaAreas] = useState < Area[] > (areas)

    // Função para excluir uma área
    const excluirArea = (id: number) => {
        setListaAreas(listaAreas.filter((area) => area.id !== id))
    }

    return (
        <div className="text-gray-400">
            <div className="flex justify-between items-end mb-1">
                <label>Áreas</label>
                <button className="text-green-300 border rounded-sm border-green-300 p-0.5">
                    Adicionar Áreas
                </button>
            </div>

            <div className="px-4 py-1 bg-white w-[90vw] max-w-[600px] h-[8rem] border border-neutral-300 rounded-md relative overflow-y-auto">
                {listaAreas.length === 0 ? (
                    <span className="text-gray-400">
                        Tamanho total da produção: 0.0 ha
                    </span>
                ) : (
                    listaAreas.map((area) => (
                        <div
                            key={area.id}
                            className="flex items-center border-b border-neutral-200 py-1"
                        >
                            <span
                                className="w-[60%] truncate block"
                                title={area.nome}
                            >
                                {area.nome}
                            </span>
                            <div className="w-[20%] ml-5">{area.componente}</div>
                            
                            {/*Colocar aviso de exclusão de área!!!!!!!!!!!!!! */}
                            <button
                                className="border rounded-sm border-red-700 text-red-700 p-0.5 ml-2"
                                onClick={() => {
                                    const confirmar = window.confirm(`Deseja realmente excluir a área "${area.nome}"?`)
                                    if (confirmar) {
                                        excluirArea(area.id)
                                    }
                                }}
                            >
                                Excluir
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
