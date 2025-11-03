'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { GoogleMap, OverlayView, Polyline, Polygon, useJsApiLoader } from '@react-google-maps/api';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export type LatLng = google.maps.LatLngLiteral;

export type SavedPoly = {
  id: string;
  path: LatLng[];
  color?: string;
};

type Props = {
  initialCenter?: LatLng;
  initialZoom?: number;
  savedPolys?: SavedPoly[];
  onPolygonComplete?: (data: { path: LatLng[]; areaM2: number; color: string }) => void;
};

const GMAPS_LIBRARIES: 'geometry'[] = ['geometry'];
const containerStyle: React.CSSProperties = { width: '100%', height: '100%' };
const MIN_STEP_PX = 4;

const formatArea = (m2: number) =>
  m2 < 10000
    ? `${Math.round(m2).toLocaleString('pt-BR')} m²`
    : `${(m2 / 10000).toFixed(2)} ha (${Math.round(m2).toLocaleString('pt-BR')} m²)`;

export default function FreeDrawMap({
  initialCenter = { lat: -30.061288446538484, lng: -51.173931906074635 },
  initialZoom = 14,
  savedPolys = [],
  onPolygonComplete,
}: Props) {
  const { isLoaded } = useJsApiLoader({
    id: 'gmap-freedraw',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: GMAPS_LIBRARIES,
  });

  const router = useRouter();
  const mapRef = useRef<google.maps.Map | null>(null);
  const overlayRef = useRef<google.maps.OverlayView | null>(null);

  // centro estável (não recentra ao alternar desenho)
  const [mapCenter, setMapCenter] = useState<LatLng>(initialCenter);

  // UI / estados
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [path, setPath] = useState<LatLng[]>([]);
  const [polygonPath, setPolygonPath] = useState<LatLng[] | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('#22c55e');

  // modal de confirmação
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState<{ path: LatLng[]; areaM2: number; color: string } | null>(
    null
  );

  // salvar posição do mapa antes de desenhar
  const [savedMapState, setSavedMapState] = useState<{ center: LatLng; zoom: number } | null>(null);

  const onLoadMap = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    const c = map.getCenter()?.toJSON();
    if (c) setMapCenter(c);
  }, []);

  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      disableDefaultUI: true,
      clickableIcons: false,
      gestureHandling: 'greedy',
      fullscreenControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      mapTypeId: 'satellite',
    }),
    []
  );

  const toggleDrawMode = useCallback(() => {
    setIsDrawMode((prev) => {
      const next = !prev;
      const map = mapRef.current;
      if (map) {
        map.setOptions({
          gestureHandling: next ? 'none' : 'greedy',
          draggableCursor: next ? 'crosshair' : '',
        });

        if (next) {
          const currentCenter = map.getCenter()?.toJSON();
          const currentZoom = map.getZoom();
          if (currentCenter && currentZoom) {
            setSavedMapState({
              center: currentCenter,
              zoom: currentZoom,
            });
          }
        }
      }
      if (!next) {
        setIsDrawing(false);
        setPath([]);
      }
      return next;
    });
  }, [isDrawMode]);

  const projection = () => overlayRef.current?.getProjection();

  const pxToLatLng = useCallback((clientX: number, clientY: number): LatLng | null => {
    const mapDiv = mapRef.current?.getDiv();
    const proj = projection();
    if (!mapDiv || !proj) return null;

    const rect = mapDiv.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const latLng = proj.fromContainerPixelToLatLng(new google.maps.Point(x, y));
    return latLng?.toJSON() ?? null;
  }, []);

  const latLngToPx = useCallback((ll: LatLng) => {
    const proj = projection();
    if (!proj) return null;
    const p = proj.fromLatLngToContainerPixel(new google.maps.LatLng(ll));
    return p ? { x: p.x, y: p.y } : null;
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawMode || confirmOpen) return;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

      setPolygonPath(null);
      setPath([]);
      setIsDrawing(true);

      const ll = pxToLatLng(e.clientX, e.clientY);
      if (ll) setPath([ll]);
    },
    [isDrawMode, confirmOpen, pxToLatLng]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawMode || !isDrawing || confirmOpen) return;
      const ll = pxToLatLng(e.clientX, e.clientY);
      if (!ll) return;

      setPath((prev) => {
        const last = prev[prev.length - 1];
        if (!last) return [ll];

        const a = latLngToPx(last);
        const b = latLngToPx(ll);
        if (!a || !b) return prev;

        const dx = a.x - b.x;
        const dy = a.y - b.y;
        if (Math.hypot(dx, dy) < MIN_STEP_PX) return prev;

        return [...prev, ll];
      });
    },
    [isDrawMode, isDrawing, confirmOpen, pxToLatLng, latLngToPx]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

      if (!isDrawMode || !isDrawing || path.length < 3) {
        setIsDrawing(false);
        setPath([]);
        return;
      }

      const closed = [...path, path[0]];
      setPolygonPath(closed);
      setIsDrawing(false);
      setPath([]);

      const areaM2 = google.maps.geometry.spherical.computeArea(
        closed.map((p) => new google.maps.LatLng(p.lat, p.lng))
      );

      setPending({ path: closed, areaM2, color: selectedColor });
      setConfirmOpen(true);

      setTimeout(() => {
        const map = mapRef.current;
        if (map && closed.length > 0) {
          const bounds = new google.maps.LatLngBounds();
          closed.forEach((point) => {
            bounds.extend(new google.maps.LatLng(point.lat, point.lng));
          });

          map.fitBounds(bounds);

          const currentZoom = map.getZoom();
          if (currentZoom && currentZoom > 16) {
            map.setZoom(16);
          }
        }
      }, 100);
    },
    [isDrawMode, isDrawing, path, selectedColor]
  );

  const handleConfirm = useCallback(() => {
    if (!pending) return;

    const centerObj = mapRef.current?.getCenter()?.toJSON() ?? mapCenter;

    try {
      sessionStorage.setItem('aiprodutor:polygon', JSON.stringify(pending.path));
      sessionStorage.setItem('aiprodutor:center', JSON.stringify(centerObj));
      sessionStorage.setItem('aiprodutor:areaM2', String(pending.areaM2));
      sessionStorage.setItem('aiprodutor:color', pending.color);
    } catch (e) {
      console.warn('Falha ao salvar no sessionStorage', e);
    }

    setConfirmOpen(false);
    setPending(null);

    router.push('/gerenciamentoArea/cadastroArea');
  }, [pending, router, mapCenter]);

  const handleDiscard = useCallback(() => {
    setConfirmOpen(false);
    setPending(null);
    setPolygonPath(null);
    setPath([]);

    setIsDrawMode(false);
    const map = mapRef.current;
    if (map) {
      map.setOptions({
        gestureHandling: 'greedy',
        draggableCursor: '',
      });

      if (savedMapState) {
        map.setCenter(savedMapState.center);
        map.setZoom(savedMapState.zoom);
      } else {
        map.setCenter(mapCenter);
        map.setZoom(initialZoom);
      }
    }

    setSavedMapState(null);
  }, [mapCenter, initialZoom, savedMapState]);

  const handleCloseModal = useCallback(() => {
    setConfirmOpen(false);
    const map = mapRef.current;
    if (map) {
      if (savedMapState) {
        map.setCenter(savedMapState.center);
        map.setZoom(savedMapState.zoom);
      } else {
        map.setCenter(mapCenter);
        map.setZoom(initialZoom);
      }
    }

    setSavedMapState(null);
  }, [mapCenter, initialZoom, savedMapState]);

  if (!isLoaded)
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loading label="" />
      </div>
    );

  return (
    <div className="relative w-full h-[calc(100vh-64px)] flex flex-col">
      {/* Controles */}
      {!confirmOpen && (
        <div className="absolute z-10 left-4 top-4 flex items-center gap-2">
          <Button type="button" onClick={toggleDrawMode} className="shadow-md">
            {isDrawMode ? 'Sair do modo desenho' : 'Desenhar área'}
          </Button>

          {/* {isDrawMode && (
            <label className="flex items-center gap-2 bg-white/90 rounded-md px-3 py-2 shadow">
              <span className="text-sm">Cor:</span>
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-8 h-8 p-0 border-0 bg-transparent"
              />
            </label>
          )} */}
        </div>
      )}

      {/* MAPA */}
      <div className={`flex-1 ${confirmOpen ? 'h-[70vh]' : 'h-full'}`}>
        <GoogleMap
          onLoad={onLoadMap}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={mapCenter} // ✅ centro estável
          zoom={initialZoom}
          options={mapOptions}
        >
          {savedPolys.map((poly) => (
            <Polygon
              key={poly.id}
              path={poly.path}
              options={{
                fillColor: poly.color ?? '#22c55e',
                fillOpacity: 0.25,
                strokeColor: poly.color ?? '#16a34a',
                strokeWeight: 2,
                clickable: false,
              }}
            />
          ))}

          {path.length > 1 && (
            <Polyline
              path={path}
              options={{ strokeWeight: 3, clickable: false, strokeColor: selectedColor }}
            />
          )}

          {polygonPath && (
            <Polygon
              path={polygonPath}
              options={{
                fillOpacity: 0.2,
                fillColor: selectedColor,
                strokeColor: selectedColor,
                strokeWeight: 2,
                clickable: false,
              }}
            />
          )}

          {/* OverlayView só para obter a projection */}
          <OverlayView
            position={mapCenter}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            onLoad={(ov) => {
              overlayRef.current = ov;
            }}
          >
            {/* nada aqui */}
            <div style={{ width: 0, height: 0 }} />
          </OverlayView>
        </GoogleMap>
      </div>

      {/* ⚠️ Div de captura fora do OverlayView: sempre cobre o mapa */}
      {isDrawMode && !confirmOpen && (
        <div
          className="absolute top-0 left-0 right-0 z-5" // cobre apenas o mapa
          style={{
            pointerEvents: 'auto',
            touchAction: 'none',
            cursor: 'crosshair',
            height: confirmOpen ? '70vh' : '100%',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      )}

      {/* Modal de confirmação na parte inferior */}
      {confirmOpen && pending && (
        <div className="min-h-[200px] max-h-[40vh] bg-white border-t shadow-lg animate-in slide-in-from-bottom duration-300 overflow-y-auto">
          <div className="p-4 flex flex-col min-h-full">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900">Confirmar área</h2>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={handleCloseModal}
                className="flex-shrink-0 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-col gap-4 flex-shrink-0">
              {/* Informações da área */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-block h-4 w-4 rounded flex-shrink-0"
                    style={{ background: pending.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">Cor selecionada</span>
                </div>

                <div className="flex-1 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Área estimada:</p>
                  <p className="text-base font-semibold text-gray-900">
                    {formatArea(pending.areaM2)}
                  </p>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="button" onClick={handleConfirm} className="flex-1 whitespace-nowrap">
                  Confirmar área
                </Button>
                <Button
                  type="button"
                  onClick={handleDiscard}
                  variant="outline"
                  className="flex-1 whitespace-nowrap"
                >
                  Desfazer desenho
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
