/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useMemo, useState } from 'react';
import Dropdown from './dropdown';
import { postArea, type AreaCreate } from '@/service/areas';
import { useSoilAndIrrigationTypes } from '../hooks/useSoilAndIrrigationTypes';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type CadastroAreaProps = {
  onError?: (err: Error) => void;
  menuHeight?: number;
};

type LatLng = { lat: number; lng: number };

export default function CadastroAreaFullScreen({ onError, menuHeight = 50 }: CadastroAreaProps) {
  const [nomeArea, setNomeArea] = useState('');
  const [solo, setSolo] = useState<{ selected: string; open: boolean }>({
    selected: 'Selecione',
    open: false,
  });
  const [irrigacao, setIrrigacao] = useState<{ selected: string; open: boolean }>({
    selected: 'Selecione',
    open: false,
  });
  const router = useRouter();

  // 🚀 carrega tipos pela API
  const { soilTypes, irrigationTypes, loading, error } = useSoilAndIrrigationTypes();

  // ===== 1) Lê polygon/center/area/color do sessionStorage =====
  const [polygonLatLng, setPolygonLatLng] = useState<LatLng[] | null>(null);
  const [center, setCenter] = useState<LatLng | null>(null);
  const [areaM2, setAreaM2] = useState<number >(0);
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    try {
      const polyStr = sessionStorage.getItem('aiprodutor:polygon');
      const centerStr = sessionStorage.getItem('aiprodutor:center');
      const areaStr = sessionStorage.getItem('aiprodutor:areaM2');
      const colorStr = sessionStorage.getItem('aiprodutor:color');

      if (polyStr) setPolygonLatLng(JSON.parse(polyStr));
      if (centerStr) setCenter(JSON.parse(centerStr));
      if (areaStr) setAreaM2(Number(areaStr));
      if (colorStr) setColor(colorStr);

      // (opcional) consumir uma vez só:
      // sessionStorage.removeItem('aiprodutor:polygon');
      // sessionStorage.removeItem('aiprodutor:center');
      // sessionStorage.removeItem('aiprodutor:areaM2');
      // sessionStorage.removeItem('aiprodutor:color');
    } catch (e) {
      console.warn('Falha ao ler do sessionStorage', e);
    }
  }, []);

  // ===== 2) Converte lat/lng -> GeoJSON [ [ [lng,lat], ... ] ] =====
  function toGeoJSONPolygon(latlng?: LatLng[] | null): number[][][] | undefined {
    if (!latlng || latlng.length < 3) return undefined;
    const ring = latlng.map((p) => [p.lng, p.lat]);
    const [fx, fy] = ring[0];
    const [lx, ly] = ring[ring.length - 1];
    if (fx !== lx || fy !== ly) ring.push([fx, fy]);
    return [ring];
  }

  // adapta para o Dropdown atual (string[])
  const soloOptions = useMemo(() => soilTypes.map((s) => s.name), [soilTypes]);
  const irrigOptions = useMemo(() => irrigationTypes.map((i) => i.name), [irrigationTypes]);

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

    const soilTypeId = soilTypes.find((s) => s.name === solo.selected)?.id;
    const irrigationTypeId = irrigationTypes.find((i) => i.name === irrigacao.selected)?.id;

    if (!soilTypeId || !irrigationTypeId) {
      alert('Não foi possível identificar os IDs de solo/irrigação.');
      return;
    }

    const polygonCoordinates = toGeoJSONPolygon(polygonLatLng);
    if (!polygonCoordinates) {
      alert('Desenho inválido ou ausente. Volte e desenhe a área no mapa.');
      return;
    }

    try {
      const payload: AreaCreate = {
        name: nomeArea.trim(),
        producerId: 1, // TODO: ajustar para o contexto real
        soilTypeId,
        irrigationTypeId,
        areaM2: areaM2,
        color: "#4CAF50",
        polygon: {
          type: 'Polygon',
          coordinates: polygonCoordinates,
        },
        // opcional: salvar centro e/ou área
        // centroidLat: center?.lat,
        // centroidLng: center?.lng,
      };

      const result = await postArea(payload);

      if (result.isSuccess) {
        toast.success('Área cadastrada com sucesso! ✅');
        console.log('Área criada:', result.response);
        router.push('/gerenciamentoArea');
      } else {
        toast.error('Ocorreu Algum erro no cadastro da Área! ✅');
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

      {/* Aviso de desenho recebido */}
      <div className="flex justify-center mb-2">
        {polygonLatLng ? (
          <span className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            Desenho recebido: {polygonLatLng.length} pontos
            {areaM2 ? ` • ${Math.round(areaM2).toLocaleString('pt-BR')} m²` : ''}
          </span>
        ) : (
          <span className="text-xs px-2 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
            Nenhum desenho encontrado — volte e desenhe a área
          </span>
        )}
      </div>

      {/* Formulário */}
      <div className="flex flex-col justify-between items-center px-4 sm:px-0 max-h-[600px] overflow-y-auto">
        <div className="w-full max-w-sm flex flex-col gap-4 py-4 flex-1">
          {/* Nome da Área */}
          <div className="flex flex-col gap-1 w-full px-2">
            <div className="flex px-1 justify-between text-gray-400 text-md">
              <label className="px-1">Nome da área:</label>
              <span
                className={`text-xs ${nomeArea.length >= warningLimitNome ? 'text-red-500' : 'text-gray-400'}`}
              >
                {nomeArea.length}/{maxLengthNome}
              </span>
            </div>
            <Input
              type="text"
              placeholder="Nome da área"
              value={nomeArea}
              onChange={handleNomeChange}
              className="select-text"
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

          {/* Tamanho da área (placeholder) */}
          <div className="text-center mt-1 flex flex-col gap-0.5">
            <span className="text-lg font-bold text-[#6D6A6D]">Tamanho</span>
            <span className="text-md text-gray-400">
              {areaM2
                ? `${(areaM2 / 10000).toFixed(2)} ha (${Math.round(areaM2).toLocaleString('pt-BR')} m²)`
                : '—'}
            </span>
          </div>

          {/* Botão Concluir */}
          <div className="flex justify-center mt-2">
            <Button
              onClick={handleSubmit}
              className="min-h-12 min-w-44"
              disabled={!polygonLatLng}
              title={!polygonLatLng ? 'Desenhe a área no mapa para continuar' : undefined}
            >
              Concluir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
