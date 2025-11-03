/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
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
  color?: string;
  paths: LatLng[][];
};

const PRODUCER_ID = 1; // ✅ produtor padrão

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

  const mapRef = useRef<google.maps.Map | null>(null);
  const polygonsRef = useRef<Record<number, google.maps.Polygon[]>>({});
  const listenersRef = useRef<google.maps.MapsEventListener[]>([]);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const carouselWrapperRef = useRef<HTMLDivElement | null>(null);

  const defaultCenter = { lat: -30.0346, lng: -51.2177 };
  const firstPoint = selectedArea?.polygon
    ? geojsonToPaths(selectedArea.polygon)[0]?.[0]
    : undefined;

  /** ---------- helpers ---------- */
  const clearMapArtifacts = useCallback(() => {
    for (const list of Object.values(polygonsRef.current)) {
      for (const p of list) p.setMap(null);
    }
    polygonsRef.current = {};
    for (const l of listenersRef.current) l.remove();
    listenersRef.current = [];
  }, []);

  const buildPolygonsForArea = useCallback((map: google.maps.Map, da: DrawArea) => {
    const fill = da.color ?? '#2E86DE';
    const list: google.maps.Polygon[] = [];

    for (const path of da.paths) {
      const poly = new google.maps.Polygon({
        map,
        paths: path,
        clickable: true,
        geodesic: false,
        strokeColor: fill,
        strokeOpacity: 0.9,
        strokeWeight: 1,
        fillColor: fill,
        fillOpacity: 0.25,
        zIndex: 1,
      });
      list.push(poly);
    }
    polygonsRef.current[da.id] = list;
    return list;
  }, []);

  const handlePolygonClick = useCallback((area: AreasEntity) => {
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
  }, []);

  const attachClickListeners = useCallback(
    (areaId: number, areasAll: AreasEntity[]) => {
      const list = polygonsRef.current[areaId] ?? [];
      for (const poly of list) {
        const l = poly.addListener('click', () => {
          const area = areasAll.find((x) => x.id === areaId);
          if (area) handlePolygonClick(area);
        });
        listenersRef.current.push(l);
      }
    },
    [handlePolygonClick]
  );

  const applySelectedStyles = useCallback((selectedId: number) => {
    for (const [idStr, list] of Object.entries(polygonsRef.current)) {
      const isSel = Number(idStr) === selectedId;
      for (const poly of list) {
        poly.setOptions({
          fillOpacity: isSel ? 0.45 : 0.25,
          strokeColor: isSel ? '#000000' : (poly.get('fillColor') ?? '#2E86DE'),
          strokeWeight: isSel ? 2 : 1,
          zIndex: isSel ? 10 : 1,
        });
      }
    }
  }, []);

  const fitSelected = useCallback((selectedId: number, bottomPadding = 48) => {
    const list = polygonsRef.current[selectedId];
    if (!list?.length || !mapRef.current) return;

    const allPaths: LatLng[][] = [];
    for (const poly of list) {
      const path = poly.getPath();
      const arr: LatLng[] = [];
      for (let i = 0; i < path.getLength(); i++) {
        const pt = path.getAt(i);
        arr.push({ lat: pt.lat(), lng: pt.lng() });
      }
      allPaths.push(arr);
    }

    const b = pathsToBounds(allPaths);
    if (!b.isEmpty())
      mapRef.current.fitBounds(b, { top: 48, right: 48, bottom: bottomPadding, left: 48 });
  }, []);

  const getBottomPadding = useCallback(() => {
    if (isDrawerVisible && drawerRef.current) {
      const h = Math.round(drawerRef.current.getBoundingClientRect().height || 0);
      return Math.min(Math.max(h + 24, 80), 600);
    }
    if (!isDrawerVisible && carouselWrapperRef.current) {
      const h = Math.round(carouselWrapperRef.current.getBoundingClientRect().height || 0) + 24;
      return Math.min(Math.max(h, 80), 400);
    }
    return 48;
  }, [isDrawerVisible]);

  /** ---------- efeitos ---------- */

  // 1) Carrega áreas
  useEffect(() => {
    (async () => {
      try {
        const { isSuccess, response } = await getAllAreas(PRODUCER_ID);
        if (isSuccess && response) setAreas(response);
      } catch (err) {
        console.error('Erro ao buscar áreas:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2) Busca área selecionada
  useEffect(() => {
    if (!selectedAreaId) return;
    setLoading(true);
    (async () => {
      try {
        const { isSuccess, response } = await getAreaById(selectedAreaId);
        if (isSuccess && response) setSelectedArea(response);
      } catch (err) {
        console.error('Erro ao buscar área:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedAreaId]);

  // 3) Busca nomes de tipos
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

  // 4) Abre drawer quando vem via rota
  useEffect(() => {
    if (selectedAreaId && !loading) {
      const t = setTimeout(() => setIsDrawerVisible(true), 300);
      return () => clearTimeout(t);
    }
  }, [selectedAreaId, loading]);

  // 5) Monta as áreas desenháveis
  const drawAreas: DrawArea[] = useMemo(() => {
    return areas
      .map((a) => {
        const paths = geojsonToPaths(a.polygon);
        if (!paths.length) return null;
        const color = rgbToHex((a as any).color);
        return { id: a.id, name: a.name, color, paths };
      })
      .filter(Boolean) as DrawArea[];
  }, [areas]);

  // 6) Desenha polígonos no mapa
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    clearMapArtifacts();

    for (const da of drawAreas) {
      buildPolygonsForArea(map, da);
      attachClickListeners(da.id, areas);
    }

    if (selectedArea) {
      applySelectedStyles(selectedArea.id);
      fitSelected(selectedArea.id);
    }
  }, [mapRef.current, drawAreas, areas, selectedArea, clearMapArtifacts, buildPolygonsForArea, attachClickListeners, applySelectedStyles, fitSelected]); // eslint-disable-line react-hooks/exhaustive-deps

  // 7) Atualiza foco quando muda drawer/seleção
  useEffect(() => {
    if (!mapRef.current || !selectedArea) return;
    applySelectedStyles(selectedArea.id);
    const padding = getBottomPadding();
    const t = setTimeout(() => fitSelected(selectedArea.id, padding), 250);
    return () => clearTimeout(t);
  }, [selectedArea?.id, isDrawerVisible, applySelectedStyles, fitSelected, getBottomPadding]); // eslint-disable-line react-hooks/exhaustive-deps

  // 8) Carousel muda → focar no mapa
  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      const idx = carouselApi.selectedScrollSnap();
      const area = areas[idx];
      if (area) fitSelected(area.id, getBottomPadding());
    };

    onSelect();
    carouselApi.on('select', onSelect);
    carouselApi.on('reInit', onSelect);
    return () => {
      carouselApi.off('select', onSelect);
      carouselApi.off('reInit', onSelect);
    };
  }, [carouselApi, areas, getBottomPadding, fitSelected]);

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
          onReady={(m) => {
            mapRef.current = m;
          }}
        />

        <div className="absolute top-4 left-4 z-20">
          <Button onClick={onBack}>Voltar</Button>
        </div>

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
                            onClick={() => handlePolygonClick(area)}
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
          className={`overflow-y-auto p-2 absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl transition-transform duration-500 ease-out ${
            isDrawerVisible ? 'translate-y-0' : 'translate-y-full'
          } lg:relative lg:translate-y-0 lg:w-96 lg:rounded-none lg:border-l lg:border-gray-200`}
          ref={drawerRef}
        >
          <EditAreaForm
            areaId={selectedAreaId || selectedArea?.id || 0}
            areaName={selectedArea?.name || ''}
            soilTypeName={soilTypeName}
            irrigationTypeName={irrigationTypeName}
            refetch={refetch}
            onClose={() => setIsDrawerVisible(false)}
          />
        </div>
      )}
    </div>
  );
}
