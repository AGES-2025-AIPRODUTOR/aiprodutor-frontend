/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/MapAreaViewer/index.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from '@/components/ui/carousel';
import GoogleMapWrapper from '../GoogleMap';
import { EditAreaForm } from '../AreaInfosForm';
import {
  getSoilTypeById,
  getIrrigationTypeById,
  getAreaById,
  getAllAreas,
  AreasEntity,
} from '@/service/areas';
import { useAgriculturalProducerContext } from '@/context/AgriculturalProducerContext';
import { geojsonToPaths, rgbToHex, pathsToBounds, LatLng } from '@/utils/geo';
import Loading from '@/components/Loading';

interface MapAreaViewerProps {
  selectedAreaId?: number;
  soilTypeId?: number;
  irrigationTypeId?: number;
  onBack: () => void;
  refetch?: () => void;
}

type DrawArea = {
  id: number;
  name?: string;
  color?: string; // #hex
  paths: LatLng[][];
};

export default function MapAreaViewer({
  selectedAreaId,
  soilTypeId,
  irrigationTypeId,
  onBack,
  refetch,
}: MapAreaViewerProps) {
  const [areas, setAreas] = useState<AreasEntity[]>([]);
  const [selectedArea, setSelectedArea] = useState<AreasEntity | null>(null);
  const [soilTypeName, setSoilTypeName] = useState('');
  const [irrigationTypeName, setIrrigationTypeName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const { data } = useAgriculturalProducerContext();

  // refs para mapa e polígonos
  const mapRef = useRef<google.maps.Map | null>(null);
  const polygonsRef = useRef<Record<number, google.maps.Polygon[]>>({});
  const listenersRef = useRef<google.maps.MapsEventListener[]>([]);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const carouselWrapperRef = useRef<HTMLDivElement | null>(null);

  const firstPoint = selectedArea?.polygon
    ? geojsonToPaths(selectedArea.polygon)[0]?.[0] // primeiro ponto do outer ring do 1º polígono
    : undefined;

  // 1) Carrega todas as áreas
  useEffect(() => {
    (async () => {
      try {
        const { isSuccess, response } = await getAllAreas(data.id ?? 1);
        if (isSuccess && response) setAreas(response);
      } catch (err) {
        console.error('Erro ao buscar todas as áreas:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [data.id]);

  // 2) Se veio selectedAreaId (rota), busca ela
  useEffect(() => {
    if (!selectedAreaId) return;
    setLoading(true);
    (async () => {
      try {
        const { isSuccess, response } = await getAreaById(selectedAreaId);
        if (isSuccess && response) setSelectedArea(response);
      } catch (err) {
        console.error('Erro ao buscar dados da área selecionada:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedAreaId]);

  // 3) Busca nomes dos tipos
  useEffect(() => {
    (async () => {
      try {
        if (soilTypeId) {
          const { isSuccess, response } = await getSoilTypeById(soilTypeId);
          if (isSuccess && response) setSoilTypeName(response.name);
        }
        if (irrigationTypeId) {
          const { isSuccess, response } = await getIrrigationTypeById(irrigationTypeId);
          if (isSuccess && response) setIrrigationTypeName(response.name);
        }
      } catch (err) {
        console.error('Erro ao buscar tipos:', err);
      }
    })();
  }, [soilTypeId, irrigationTypeId]);

  // 4) Abre drawer quando selecionada via rota
  useEffect(() => {
    if (selectedAreaId && !loading) {
      const t = setTimeout(() => setIsDrawerVisible(true), 300);
      return () => clearTimeout(t);
    }
  }, [selectedAreaId, loading]);

  const defaultCenter = { lat: -30.0346, lng: -51.2177 };

  // 5) Monta as áreas desenháveis (paths + cor)
  const drawAreas: DrawArea[] = useMemo(() => {
    return areas
      .map((a) => {
        const paths = geojsonToPaths(a.polygon);
        if (!paths.length) return null;
        // ajuste o nome do campo de cor se for diferente
        const color = rgbToHex((a as any).color);
        return { id: a.id, name: a.name, color, paths };
      })
      .filter(Boolean) as DrawArea[];
  }, [areas]);

  // 6) Desenhar polígonos no mapa quando mapa pronto OU drawAreas muda
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // limpa polígonos/listeners anteriores
    Object.values(polygonsRef.current)
      .flat()
      .forEach((p) => p.setMap(null));
    polygonsRef.current = {};
    listenersRef.current.forEach((l) => l.remove());
    listenersRef.current = [];

    // cria novos polígonos
    drawAreas.forEach((da) => {
      const fill = da.color ?? '#2E86DE';
      const polyList: google.maps.Polygon[] = [];

      da.paths.forEach((path) => {
        const poly = new google.maps.Polygon({
          map,
          paths: path,
          clickable: true,
          geodesic: false,
          strokeColor: fill,
          strokeOpacity: 0.9,
          strokeWeight: 1,
          fillColor: fill,
          fillOpacity: 0.25, // normal
          zIndex: 1,
        });
        polyList.push(poly);

        // clique → selecionar/editar
        const listener = poly.addListener('click', () => {
          const area = areas.find((x) => x.id === da.id);
          if (area) handleAreaClick(area);
        });
        listenersRef.current.push(listener);
      });

      polygonsRef.current[da.id] = polyList;
    });

    // se já existe uma área selecionada, aplicar destaque e enfocar
    if (selectedArea) {
      applySelectedStyles(selectedArea.id);
      fitSelected(selectedArea.id);
    }
  }, [mapRef.current, drawAreas]); // eslint-disable-line react-hooks/exhaustive-deps

  // calcula padding inferior conforme drawer ou carousel visíveis
  function getBottomPadding() {
    // se drawer visível, utiliza a altura do drawer para levantar o mapa
    if (isDrawerVisible && drawerRef.current) {
      const h = Math.round(drawerRef.current.getBoundingClientRect().height || 0);
      return Math.min(Math.max(h + 24, 80), 600); // entre 80 e 600 px
    }
    // se carousel visível, evita que o carousel esconda a área
    if (!isDrawerVisible && carouselWrapperRef.current) {
      const h = Math.round(carouselWrapperRef.current.getBoundingClientRect().height || 0) + 24;
      return Math.min(Math.max(h, 80), 400);
    }
    return 48;
  }

  // 7) Ao mudar área selecionada → destacar e fitBounds (com padding dependendo do drawer)
  useEffect(() => {
    if (!mapRef.current || !selectedArea) return;
    applySelectedStyles(selectedArea.id);
    const padding = getBottomPadding();
    const t = setTimeout(() => fitSelected(selectedArea.id, padding), 250);
    return () => clearTimeout(t);
  }, [selectedArea?.id, isDrawerVisible]); // eslint-disable-line react-hooks/exhaustive-deps

  // 8) Quando o carousel muda de slide, focar no mapa na área correspondente (sem abrir drawer)
  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => {
      try {
        const idx = carouselApi.selectedScrollSnap();
        const area = areas[idx];
        if (area) {
          // apenas focar, sem abrir drawer
          const padding = getBottomPadding();
          fitSelected(area.id, padding);
        }
      } catch (err) {
        // ignore
      }
    };
    // chamar uma vez para centrar no slide inicial
    onSelect();
    carouselApi.on('select', onSelect);
    carouselApi.on('reInit', onSelect);
    return () => {
      carouselApi.off('select', onSelect);
      carouselApi.off('reInit', onSelect);
    };
  }, [carouselApi, areas, isDrawerVisible]);

  function applySelectedStyles(selectedId: number) {
    // reset visual de todas
    Object.entries(polygonsRef.current).forEach(([id, list]) => {
      const isSel = Number(id) === selectedId;
      list.forEach((poly) => {
        poly.setOptions({
          fillOpacity: isSel ? 0.45 : 0.25,
          strokeColor: isSel ? '#000000' : (poly.get('fillColor') ?? '#2E86DE'),
          strokeWeight: isSel ? 2 : 1,
          zIndex: isSel ? 10 : 1,
        });
      });
    });
  }

  function fitSelected(selectedId: number, bottomPadding = 48) {
    const list = polygonsRef.current[selectedId];
    if (!list || !list.length || !mapRef.current) return;

    const allPaths: LatLng[][] = [];
    list.forEach((poly) => {
      const path = poly.getPath();
      const arr: LatLng[] = [];
      for (let i = 0; i < path.getLength(); i++) {
        const pt = path.getAt(i);
        arr.push({ lat: pt.lat(), lng: pt.lng() });
      }
      allPaths.push(arr);
    });

    const b = pathsToBounds(allPaths);
    if (!b.isEmpty())
      mapRef.current.fitBounds(b, { top: 48, right: 48, bottom: bottomPadding, left: 48 });
  }

  const handleAreaClick = (area: AreasEntity) => {
    setSelectedArea(area);
    setIsDrawerVisible(true);

    if (area.soilTypeId) {
      getSoilTypeById(area.soilTypeId).then(({ isSuccess, response }) => {
        if (isSuccess && response) setSoilTypeName(response.name);
      });
    }
    if (area.irrigationTypeId) {
      getIrrigationTypeById(area.irrigationTypeId).then(({ isSuccess, response }) => {
        if (isSuccess && response) setIrrigationTypeName(response.name);
      });
    }
  };

  // center/zoom apenas como fallback visual inicial (o fitBounds cuida do foco)
  const center = firstPoint ?? defaultCenter;
  const zoom = selectedArea ? 15 : 12;

  if (loading && selectedAreaId) {
    return (
      <div className="h-full flex flex-col lg:flex-row">
        <div className="flex-1 relative">
          {!selectedArea && loading && (
            <div className="h-[calc(100vh-49px)] w-full flex justify-center items-center">
              <Loading label="Carregando Área..." />
            </div>
          )}
          {selectedArea && <GoogleMapWrapper center={defaultCenter} zoom={12} height="100%" />}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 lg:top-8">
            <div className="bg-white p-4 rounded-xl shadow-2xl border border-gray-100 mx-4 backdrop-blur-sm"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-49px)] flex flex-col lg:flex-row relative">
      <div className="flex-1 relative">
        <GoogleMapWrapper
          center={center}
          zoom={zoom}
          height="100%"
          // pega a instância do mapa para desenhar os polígonos
          onReady={(m) => {
            mapRef.current = m;
          }}
        />

        <div className="absolute top-4 left-4 z-20">
          <Button
            onClick={onBack}
            className="bg-green-600 hover:bg-green-700 border border-green-600 text-white"
          >
            Voltar
          </Button>
        </div>

        {/* Carrossel flutuante inferior para selecionar via nome (substitui lista lateral) */}
        {!selectedAreaId && !isDrawerVisible && (
          <div
            ref={carouselWrapperRef}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30 w-[75%] max-w-4xl"
          >
            <div className="bg-white px-3 py-2 rounded-2xl shadow-2xl border border-gray-100 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-600 font-semibold">Áreas Disponíveis</p>
              </div>
              <Carousel className="relative" setApi={(api) => setCarouselApi(api)}>
                <CarouselContent>
                  {areas.map((area) => (
                    <CarouselItem key={area.id} className="pr-2">
                      <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {area.name || `Área ${area.id}`}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-green-600"
                            onClick={() => handleAreaClick(area)}
                          >
                            Editar
                          </Button>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </div>
        )}
      </div>

      {(selectedAreaId || selectedArea) && (
        <div
          className={`
            overflow-y-auto p-2 
            absolute bottom-0 left-0 right-0 
            bg-white rounded-t-2xl
            transition-transform duration-500 ease-out
            ${isDrawerVisible ? 'transform translate-y-0' : 'transform translate-y-full'}
            lg:relative lg:translate-y-0 lg:w-96 lg:rounded-none lg:border-l lg:border-gray-200
          `}
          ref={drawerRef}
        >
          <EditAreaForm
            areaId={selectedAreaId || selectedArea?.id || 0}
            areaName={selectedArea?.name || ''}
            soilTypeName={soilTypeName}
            irrigationTypeName={irrigationTypeName}
            refetch={refetch}
            onClose={() => {
              setIsDrawerVisible(false);
              setSelectedArea(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
