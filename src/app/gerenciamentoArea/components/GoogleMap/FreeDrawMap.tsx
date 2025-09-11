'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import {
  GoogleMap,
  OverlayView,
  Polyline,
  Polygon,
  useJsApiLoader,
} from '@react-google-maps/api';

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

const GMAPS_LIBRARIES: ('geometry')[] = ['geometry'];

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
};

const MIN_STEP_PX = 4;

export default function FreeDrawMap({
  initialCenter = { lat: -27.5935, lng: -48.5585 },
  initialZoom = 14,
  savedPolys = [],
  onPolygonComplete,
}: Props) {
  const { isLoaded } = useJsApiLoader({
    id: 'gmap-freedraw',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    version: 'weekly',
    libraries: GMAPS_LIBRARIES,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const overlayRef = useRef<google.maps.OverlayView | null>(null);

  // UI / estados
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [path, setPath] = useState<LatLng[]>([]);
  const [polygonPath, setPolygonPath] = useState<LatLng[] | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('#22c55e');

  const onLoadMap = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
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
      if (!isDrawMode) return;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

      setPolygonPath(null);
      setPath([]);
      setIsDrawing(true);

      const ll = pxToLatLng(e.clientX, e.clientY);
      if (ll) setPath([ll]);
    },
    [isDrawMode, pxToLatLng]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawMode || !isDrawing) return;

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
    [isDrawMode, isDrawing, pxToLatLng, latLngToPx]
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

      const area = google.maps.geometry.spherical.computeArea(
        closed.map((p) => new google.maps.LatLng(p.lat, p.lng))
      );

      onPolygonComplete?.({ path: closed, areaM2: area, color: selectedColor });
    },
    [isDrawMode, isDrawing, path, onPolygonComplete, selectedColor]
  );

  if (!isLoaded) return <div className="w-full h-full">Carregando mapa…</div>;

  return (
    <div className="relative w-full h-[calc(100vh-64px)]">
      {/* Controles flutuantes */}
      <div className="absolute z-10 left-4 top-4 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleDrawMode}
          className="rounded-md px-4 py-2 bg-emerald-600 text-white shadow-md hover:opacity-90"
        >
          {isDrawMode ? 'Sair do modo desenho' : 'Desenhar área'}
        </button>

        {isDrawMode && (
          <label className="flex items-center gap-2 bg-white/90 rounded-md px-3 py-2 shadow">
            <span className="text-sm">Cor:</span>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-8 h-8 p-0 border-0 bg-transparent"
            />
          </label>
        )}
      </div>

      <GoogleMap
        onLoad={onLoadMap}
        mapContainerStyle={containerStyle}
        center={initialCenter}
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

        {isDrawMode && (
          <OverlayView
            position={initialCenter}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            onLoad={(ov) => {
              overlayRef.current = ov;
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'auto',
                touchAction: 'none',
                cursor: 'crosshair',
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            />
          </OverlayView>
        )}
      </GoogleMap>
    </div>
  );
}
