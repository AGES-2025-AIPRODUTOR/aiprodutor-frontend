// components/GoogleMap/GoogleMap.tsx
'use client';
import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

export type GoogleMapCoreProps = {
  initialCenter?: google.maps.LatLngLiteral;
  initialZoom?: number;
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  onReady?: (map: google.maps.Map) => void;
  onError?: (err: Error) => void;
  height?: number | string;
};

export default function GoogleMap({
  initialCenter = { lat: -30.0346, lng: -51.2177 },
  initialZoom = 12,
  center,
  zoom,
  onReady,
  onError,
  height = '70vh',
}: GoogleMapCoreProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: 'weekly',
      libraries: ['places', 'geometry'],
    });

    loader
      .load()
      .then(() => {
        if (cancelled || !divRef.current) return;

        mapRef.current = new google.maps.Map(divRef.current, {
          center: initialCenter,
          zoom: initialZoom,
          mapTypeId: 'satellite',
          disableDefaultUI: true,
          fullscreenControl: false,
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          rotateControl: false,
          scaleControl: false,
          keyboardShortcuts: false,
          gestureHandling: 'greedy',
          tilt: 0,
          heading: 0,
        });

        onReady?.(mapRef.current);
      })
      .catch((e) => onError?.(e instanceof Error ? e : new Error(String(e))));

    return () => { cancelled = true; };
  }, []);

  // ⬇️ NOVO: reagir a center/zoom depois que o mapa existir
  useEffect(() => {
    if (!mapRef.current) return;
    if (center) mapRef.current.setCenter(center);
    if (typeof zoom === 'number') mapRef.current.setZoom(zoom);
  }, [center?.lat, center?.lng, zoom]);

  return (
    <div
      ref={divRef}
      style={{ width: '100%', height: typeof height === 'number' ? `${height}px` : height }}
    />
  );
}
