'use client';
import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

export type GoogleMapCoreProps  = {
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  onReady?: (map: google.maps.Map) => void;
  onError?: (err: Error) => void;
  height?: number | string;
};

export default function GoogleMap({
  center = { lat: -30.0346, lng: -51.2177 },
  zoom = 12,
  onReady,
  onError,
  height = '70vh',
}: GoogleMapCoreProps ) {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: 'weekly',
      libraries: ['places']
    });

    loader
      .load()
      .then(() => {
        if (cancelled || !divRef.current) return;

        const map = new google.maps.Map(divRef.current, {
          center,
          zoom,
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

        onReady?.(map);
      })
      .catch((e) => onError?.(e instanceof Error ? e : new Error(String(e))));

    return () => {
      cancelled = true;
    };
  }, [center, zoom, onReady, onError]);

  return <div ref={divRef} style={{ width: '100%', height }} />;
}
