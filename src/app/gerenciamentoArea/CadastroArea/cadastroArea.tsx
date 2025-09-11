/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMemo, useState } from 'react';
import Dropdown from './dropdown';
import { postArea, type AreaCreate } from '@/service/areas';
import { useSoilAndIrrigationTypes } from '../hooks/useSoilAndIrrigationTypes';

export type CadastroAreaProps = {
  onError?: (err: Error) => void;
  menuHeight?: number;
};

export default function CadastroAreaFullScreen({ onError, menuHeight = 50 }: CadastroAreaProps) {
  const [nomeArea, setNomeArea] = useState('');
  const [solo, setSolo] = useState<{ selected: string; open: boolean }>({ selected: 'Selecione', open: false });
  const [irrigacao, setIrrigacao] = useState<{ selected: string; open: boolean }>({
    selected: 'Selecione',
    open: false,
  });

  // 🚀 carrega tipos pela API
  const { soilTypes, irrigationTypes, loading, error } = useSoilAndIrrigationTypes();

  // adapta para o Dropdown atual (string[])
  const soloOptions = useMemo(() => soilTypes.map(s => s.name), [soilTypes]);
  const irrigOptions = useMemo(() => irrigationTypes.map(i => i.name), [irrigationTypes]);

  // limites de input
  const maxLengthNome = 255;
  const warningLimitNome = 230;

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value.replace(/[^a-zA-ZÀ-ÿ0-9 \-_\.,()+]/g, '');
    if (newValue.length > maxLengthNome) newValue = newValue.slice(0, maxLengthNome);
    setNomeArea(newValue);
  };

  const handleSubmit = async () => {
    if (!nomeArea.trim()) {
      alert('Informe o nome da área');
      return;
    }
    if (solo.selected === 'Selecione' || irrigacao.selected === 'Selecione') {
      alert('Selecione o tipo de solo e de irrigação.');
      return;
    }

    // mapeia nome -> id vindo da API
    const soilTypeId = soilTypes.find(s => s.name === solo.selected)?.id;
    const irrigationTypeId = irrigationTypes.find(i => i.name === irrigacao.selected)?.id;

    if (!soilTypeId || !irrigationTypeId) {
      alert('Não foi possível identificar os IDs de solo/irrigação.');
      return;
    }

    try {
      const payload: AreaCreate = {
        name: nomeArea.trim(),
        producerId: 1, // mock do usuário
        soilTypeId,
        irrigationTypeId,
        polygon: {
          type: 'Polygon',
          coordinates: [
            [
              [-51.21, -30.03],
              [-51.2, -30.03],
              [-51.2, -30.02],
              [-51.21, -30.02],
              [-51.21, -30.03], // fecha o polígono
            ],
          ],
        },
      };

      const result = await postArea(payload);

      if (result.isSuccess) {
        alert('Área cadastrada com sucesso!');
        console.log('Área criada:', result.response);
      } else {
        alert('Erro ao cadastrar área (validação).');
        console.log('Detalhes:', result);
      }
    } catch (err: any) {
      const data = err?.response?.data ?? err;
      console.error('Falha ao criar área:', data);
      alert('Falha ao criar área. Veja o console para detalhes.');
      onError?.(err);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[var(--neutral-0)] font-[var(--font-family-base)] flex flex-col">
      {/* Cabeçalho */}
      <div className="flex justify-center mt-8 mb-3">
        <div className="flex items-center gap-2">
          <img src="/circle-alert.svg" alt="Informação" className="w-5" />
          <p className="text-base font-bold text-[#6D6A6D]">Complete as informações</p>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex flex-col justify-between items-center px-4 sm:px-0 max-h-[600px] overflow-y-auto">
        <div className="w-full max-w-sm flex flex-col gap-4 py-4 flex-1">
          {/* Nome da Área */}
          <div className="flex flex-col gap-1 w-full px-2">
            <div className="flex px-1 justify-between text-gray-400 text-md">
              <label className="px-1">Nome da área:</label>
              <span className={`text-xs ${nomeArea.length >= warningLimitNome ? 'text-red-500' : 'text-gray-400'}`}>
                {nomeArea.length}/{maxLengthNome}
              </span>
            </div>
            <input
              type="text"
              placeholder="Nome da área"
              value={nomeArea}
              onChange={handleNomeChange}
              className="border border-gray-300 text-gray-600 h-9 px-2 focus:outline-none rounded w-full select-text"
            />
          </div>

          {/* Dropdown Solo */}
          <div className="flex flex-col gap-1 w-full px-2 text-md text-gray-400">
            <label className="px-1 text-left">Tipo de solo:</label>
            {loading ? (
              <div className="px-1 text-sm text-gray-500">Carregando…</div>
            ) : error ? (
              <div className="px-1 text-sm text-red-600">{error}</div>
            ) : (
              <Dropdown options={soloOptions} value={solo} onChange={setSolo} />
            )}
          </div>

          {/* Dropdown Irrigação */}
          <div className="flex flex-col gap-1 w-full px-2 text-md text-gray-400">
            <label className="px-1 text-left">Tipo de irrigação:</label>
            {loading ? (
              <div className="px-1 text-sm text-gray-500">Carregando…</div>
            ) : error ? (
              <div className="px-1 text-sm text-red-600">{error}</div>
            ) : (
              <Dropdown options={irrigOptions} value={irrigacao} onChange={setIrrigacao} />
            )}
          </div>

          {/* Tamanho da área (mock) */}
          <div className="text-center mt-1 flex flex-col gap-0.5">
            <span className="text-lg font-bold text-[#6D6A6D]">Tamanho</span>
            <span className="text-md text-gray-400">2.5ha (25000m²)</span>
          </div>

          {/* Botão Concluir */}
          <div className="flex justify-center mt-2">
            <button
              onClick={handleSubmit}
              className="bg-green-600 text-green-50 min-h-12 min-w-44 rounded border-none cursor-pointer hover:bg-green-700"
            >
              Concluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
