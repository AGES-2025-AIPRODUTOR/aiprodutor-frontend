'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { GoogleMap, OverlayView, Polyline, Polygon, useJsApiLoader } from '@react-google-maps/api';

type LatLng = google.maps.LatLngLiteral;

type Props = {
  initialCenter?: LatLng;
  initialZoom?: number;
  onPolygonComplete?: (path: LatLng[], areaM2: number) => void;
};

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  touchAction: 'none',
};

export default function FreeDrawMap({
  initialCenter = { lat: -27.5935, lng: -48.5585 }, // Floripa como default, pois ainda nao temos o local do usuário
  initialZoom = 14,
  onPolygonComplete,
}: Props) {
  const { isLoaded } = useJsApiLoader({
    id: 'gmap-freedraw',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    version: 'weekly',
    libraries: ['geometry'],
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const overlayRef = useRef<google.maps.OverlayView | null>(null);

  const [drawing, setDrawing] = useState(false);
  const [path, setPath] = useState<LatLng[]>([]);
  const [polygonPath, setPolygonPath] = useState<LatLng[] | null>(null);

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

  const pxToLatLng = useCallback((clientX: number, clientY: number): LatLng | null => {
    const mapDiv = mapRef.current?.getDiv();
    const proj = overlayRef.current?.getProjection();
    if (!mapDiv || !proj) return null;

    const rect = mapDiv.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const latLng = proj.fromContainerPixelToLatLng(new google.maps.Point(x, y));
    return latLng?.toJSON() ?? null;
  }, []);

  const startDraw = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      setPolygonPath(null);
      setPath([]);
      setDrawing(true);

      let clientX: number, clientY: number;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else return;

      const ll = pxToLatLng(clientX, clientY);
      if (ll) setPath([ll]);
    },
    [pxToLatLng]
  );

  const moveDraw = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!drawing) return;
      e.preventDefault();

      if ('touches' in e && e.touches.length === 0) return;

      let clientX: number, clientY: number;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else return;

      const ll = pxToLatLng(clientX, clientY);
      if (!ll) return;

      setPath((prev) => {
        const last = prev[prev.length - 1];
        if (!last) return [ll];
        const dx = last.lat - ll.lat;
        const dy = last.lng - ll.lng;
        if (Math.hypot(dx, dy) < 1e-6) return prev;
        return [...prev, ll];
      });
    },
    [drawing, pxToLatLng]
  );

  const endDraw = useCallback(() => {
    if (!drawing || path.length < 3) {
      setDrawing(false);
      setPath([]);
      return;
    }

    const closed = [...path, path[0]];
    setPolygonPath(closed);
    setDrawing(false);
    setPath([]);

    const area = google.maps.geometry.spherical.computeArea(
      closed.map((p) => new google.maps.LatLng(p.lat, p.lng))
    );

    onPolygonComplete?.(closed, area);
  }, [drawing, path, onPolygonComplete]);

  if (!isLoaded) return <div className="w-full h-full">Carregando mapa…</div>;

  return (
    <div className="w-full h-[calc(100vh-64px)]">
      {' '}
      <GoogleMap
        onLoad={onLoadMap}
        mapContainerStyle={containerStyle}
        center={initialCenter}
        zoom={initialZoom}
        options={mapOptions}
      >
        {path.length > 1 && (
          <Polyline
            path={path}
            options={{
              strokeWeight: 3,
              clickable: false,
            }}
          />
        )}

        {polygonPath && (
          <Polygon
            path={polygonPath}
            options={{
              fillOpacity: 0.15,
              strokeWeight: 2,
              clickable: false,
            }}
          />
        )}

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
            }}
            onTouchStart={startDraw}
            onTouchMove={moveDraw}
            onTouchEnd={endDraw}
            onMouseDown={startDraw}
            onMouseMove={moveDraw}
            onMouseUp={endDraw}
          />
        </OverlayView>
      </GoogleMap>
    </div>
  );
}
