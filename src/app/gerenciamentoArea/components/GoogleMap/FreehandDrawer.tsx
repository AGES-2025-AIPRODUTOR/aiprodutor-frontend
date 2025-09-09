'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import GoogleMap, { GoogleMapCoreProps } from './GoogleMap';

type LatLng = google.maps.LatLngLiteral;

type Props = Omit<GoogleMapCoreProps, 'onReady' | 'onError' | 'height'> & {
  mapHeight?: number | string;
  onConfirm?: (polygon: { path: LatLng[]; areaM2: number }) => void;
  onClear?: () => void;
};

export default function FreehandPolygonDrawer({
  center,
  zoom = 17,
  mapHeight = '70vh',
  onConfirm,
  onClear,
}: Props) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const drawingRef = useRef(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const attachListeners = useCallback((map: google.maps.Map) => {
    const pl = new google.maps.Polyline({
      map,
      path: [],
      clickable: false,
      strokeWeight: 3,
    });
    polylineRef.current = pl;

    const down = () => {
      drawingRef.current = true;
      setIsDrawing(true);
      pl.setPath([]);
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
        polygonRef.current = null;
      }
    };

    const move = (e: google.maps.MapMouseEvent) => {
      if (!drawingRef.current || !e.latLng) return;
      pl.getPath().push(e.latLng);
    };

    const up = () => {
      if (!drawingRef.current) return;
      drawingRef.current = false;
      setIsDrawing(false);

      const pts = pl.getPath().getArray();
      if (pts.length < 3) {
        pl.setPath([]);
        return;
      }

      const pg = new google.maps.Polygon({
        paths: pts,
        map,
        fillOpacity: 0.3,
        strokeWeight: 2,
        clickable: false,
      });
      polygonRef.current = pg;

      pl.setPath([]);
    };

    const listeners = [
      map.addListener('mousedown', down),
      map.addListener('touchstart', down),
      map.addListener('mousemove', move),
      map.addListener('touchmove', move),
      map.addListener('mouseup', up),
      map.addListener('touchend', up),
    ];

    return () => listeners.forEach((l) => l.remove());
  }, []);

  const handleReady = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      const remove = attachListeners(map);

      return () => {
        remove?.();
        if (polylineRef.current) polylineRef.current.setMap(null);
        if (polygonRef.current) polygonRef.current.setMap(null);
      };
    },
    [attachListeners]
  );

  const handleClear = () => {
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }
    if (polylineRef.current) polylineRef.current.setPath([]);
    onClear?.();
  };

  const handleConfirm = () => {
    if (!polygonRef.current) return;

    const path = polygonRef.current
      .getPath()
      .getArray()
      .map((p) => ({ lat: p.lat(), lng: p.lng() }));

    const area = google.maps.geometry?.spherical?.computeArea(polygonRef.current.getPath()) ?? 0;

    onConfirm?.({ path, areaM2: area });
  };

  return (
    <div className="w-full">
      <div style={{ width: '100%', height: mapHeight }}>
        <GoogleMap
          center={center}
          zoom={zoom}
          onReady={handleReady}
          onError={(e) => console.error(e)}
        />
      </div>

      <div className="flex gap-3 mt-4">
        <button
          className="flex-1 py-3 rounded-xl bg-white text-gray-700 shadow"
          onClick={handleClear}
          disabled={isDrawing}
        >
          Apagar
        </button>
        <button
          className="flex-1 py-3 rounded-xl bg-green-600 text-white shadow disabled:opacity-60"
          onClick={handleConfirm}
          disabled={isDrawing || !polygonRef.current}
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}
