'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { GoogleMap, OverlayView, Polyline, Polygon, useJsApiLoader } from '@react-google-maps/api';
import { useRouter } from 'next/navigation';
import { set } from 'zod';

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
  const [pending, setPending] = useState<{ path: LatLng[]; areaM2: number; color: string } | null>(null);

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
      }
      if (!next) {
        setIsDrawing(false);
        setPath([]);
      }
      return next;
    });
  }, []);

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
  }
}, []);


  if (!isLoaded) return <div className="w-full h-full">Carregando mapa…</div>;

  return (
    <div className="relative w-full h-[calc(100vh-64px)]">
      {/* Controles */}
      <div className="absolute z-10 left-4 top-4 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleDrawMode}
          className="rounded-md px-4 py-2 bg-emerald-600 text-white shadow-md hover:opacity-90"
        >
          {isDrawMode ? 'Sair do modo desenho' : 'Desenhar área'}
        </button>

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

      {/* MAPA */}
      <GoogleMap
        onLoad={onLoadMap}
        mapContainerStyle={containerStyle}
        center={mapCenter}   // ✅ centro estável
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
          <Polyline path={path} options={{ strokeWeight: 3, clickable: false, strokeColor: selectedColor }} />
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

      {/* ⚠️ Div de captura fora do OverlayView: sempre cobre o mapa */}
      {isDrawMode && !confirmOpen && (
        <div
          className="absolute inset-0 z-10" // cobre o mapa todo
          style={{ pointerEvents: 'auto', touchAction: 'none', cursor: 'crosshair' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      )}

      {/* Modal de confirmação */}
      {confirmOpen && pending && (
        <div className="absolute inset-0 z-20 bg-black/50 flex items-center justify-center">
          <div className="w-11/12 max-w-sm rounded-xl bg-white p-4 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Confirmar área</h2>

            <div className="flex items-center gap-3 text-sm mb-2">
              <span className="inline-block h-4 w-4 rounded" style={{ background: pending.color }} />
              <span>Cor selecionada</span>
            </div>

            <p className="text-sm mb-4">
              Área estimada: <strong>{formatArea(pending.areaM2)}</strong>
            </p>

            <div className="flex gap-2">
              <button type="button" onClick={handleConfirm} className="flex-1 rounded-md px-3 py-2 bg-emerald-600 text-white hover:opacity-90">
                Confirmar
              </button>
              <button type="button" onClick={handleDiscard} className="flex-1 rounded-md px-3 py-2 bg-neutral-200 hover:bg-neutral-300">
                Descartar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
