'use client';
import { useState, useEffect } from "react";
import axios from "axios";
import Dropdown from "./dropdown";

export type CadastroAreaProps = {
  onError?: (err: Error) => void;
  menuHeight?: number; // altura do menu para descontar (não usamos mais no height fixo)
};

export default function CadastroAreaFullScreen({ onError, menuHeight = 50 }: CadastroAreaProps) {
  const [nomeArea, setNomeArea] = useState("");
  const [cultivo, setCultivo] = useState("");
  const [solo, setSolo] = useState({ selected: "Selecione", open: false });
  const [irrigacao, setIrrigacao] = useState({ selected: "Selecione", open: false });
  const [solos, setSolos] = useState<string[]>([]);
  const [irrigacoes, setIrrigacoes] = useState<string[]>([]);

  const maxLengthNome = 255;
  const warningLimitNome = 230;
  const maxLengthCultivo = 100;
  const warningLimiteCultivo = 90;

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    newValue = newValue.replace(/[^a-zA-ZÀ-ÿ0-9 \-_\.,()+]/g, "");
    if (newValue.length > maxLengthNome) newValue = newValue.slice(0, maxLengthNome);
    setNomeArea(newValue);
  };

  const handleCultivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    newValue = newValue.replace(/[^a-zA-ZÀ-ÿ0-9 \-_\.,()+]/g, "");
    if (newValue.length > maxLengthCultivo) newValue = newValue.slice(0, maxLengthCultivo);
    setCultivo(newValue);
  };

  const handleSubmit = () => {
    if (
      !nomeArea.trim() ||
      !solo.selected || solo.selected === "Selecione" ||
      !irrigacao.selected || irrigacao.selected === "Selecione" ||
      !cultivo.trim()
    ) {
      alert("Todos os campos devem ser preenchidos!");
      return;
    }

    try {
      console.log("Formulário enviado:", {
        nomeArea,
        solo: solo.selected,
        irrigacao: irrigacao.selected,
        cultivo,
      });
    } catch (err) {
      if (onError && err instanceof Error) onError(err);
    }
  };

  useEffect(() => {
    axios.get("/mock/solo.json")
      .then(res => setSolos(res.data.map((item: any) => item.tipo)))
      .catch(err => onError?.(err));
    axios.get("/mock/irrigacao.json")
      .then(res => setIrrigacoes(res.data.map((item: any) => item.tipo)))
      .catch(err => onError?.(err));
  }, []);

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
      <div
        className="flex flex-col justify-between items-center px-4 sm:px-0 max-h-[600px] overflow-y-auto"
      >
        <div className="w-full max-w-sm flex flex-col gap-4 py-4 flex-1">

          {/* Nome da Área */}
          <div className="flex flex-col gap-1 w-full px-2">
            <div className="flex px-1 justify-between text-gray-400 text-md">
              <label className="px-1">Nome da área:</label>
              <span className={`text-xs ${nomeArea.length >= warningLimitNome ? "text-red-500" : "text-gray-400"}`}>
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
            <Dropdown options={solos} value={solo} onChange={setSolo} />
          </div>

          {/* Dropdown Irrigação */}
          <div className="flex flex-col gap-1 w-full px-2 text-md text-gray-400">
            <label className="px-1 text-left">Tipo de irrigação:</label>
            <Dropdown options={irrigacoes} value={irrigacao} onChange={setIrrigacao} />
          </div>

          {/* Tipo de Cultivo */}
          <div className="flex flex-col gap-1 px-2 text-gray-400 text-md">
            <div className="flex justify-between items-center px-1">
              <label>Tipo de cultivo:</label>
              <span className={`text-xs ${cultivo.length >= warningLimiteCultivo ? "text-red-500" : "text-gray-400"}`}>
                {cultivo.length}/{maxLengthCultivo}
              </span>
            </div>
            <input
              type="text"
              placeholder="Tipo de cultivo"
              value={cultivo}
              onChange={handleCultivoChange}
              className="border border-gray-300 text-gray-600 h-9 px-2 focus:outline-none rounded select-text"
            />
          </div>

          {/* Tamanho da área */}
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
