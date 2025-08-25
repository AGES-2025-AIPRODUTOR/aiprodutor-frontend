'use client';
import { useEffect, useRef } from 'react';
import { Loader, LoaderOptions } from '@googlemaps/js-api-loader';

type Lib = 'drawing' | 'geometry';

type Props = {
  zoom?: number;
  center?: google.maps.LatLngLiteral;
  mapId?: string;
  onReady?: (map: google.maps.Map) => void;
  onPolygonComplete?: (data: { coords: google.maps.LatLngLiteral[]; areaM2: number }) => void;
};

export default function GoogleMap({
  zoom = 12,
  center = { lat: -30.0346, lng: -51.2177 },
  mapId,
  onReady,
  onPolygonComplete,
}: Props) {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: 'weekly',
      libraries: ['drawing', 'geometry'] as Lib[],
    } as LoaderOptions);

    let map: google.maps.Map;

    loader.load().then(() => {
      if (!divRef.current) return;

      map = new google.maps.Map(divRef.current, {
        center,
        zoom,
        mapId,
        gestureHandling: 'greedy',
        fullscreenControl: true,
      });

      // marcador inicial (aviso depreciação pode aparecer; ok usar por enquanto)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      new google.maps.Marker({ position: center, map, title: 'Centro' });

      // botão simples "Minha localização"
      const btn = document.createElement('button');
      btn.textContent = 'Minha localização';
      Object.assign(btn.style, {
        padding: '6px 10px', background: '#fff', border: '1px solid #ccc',
        borderRadius: '4px', cursor: 'pointer'
      });
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(btn); 

      let meMarker: google.maps.Marker | undefined;
      btn.onclick = () => {
        if (!navigator.geolocation) return alert('Geolocalização indisponível');
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            const pos = { lat: coords.latitude, lng: coords.longitude };
            map.setCenter(pos);
            map.setZoom(16);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            meMarker ??= new google.maps.Marker({ position: pos, map, title: 'Você' });
            meMarker.setPosition(pos);
          },
          () => alert('Não foi possível obter sua localização')
        );
      };

      // Drawing Manager (polígono/retângulo/círculo)
      const dm = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [
            google.maps.drawing.OverlayType.POLYGON,
            google.maps.drawing.OverlayType.RECTANGLE,
            google.maps.drawing.OverlayType.CIRCLE,
          ],
        },
        polygonOptions: { fillOpacity: 0.2, strokeWeight: 2 },
      });
      dm.setMap(map);

      google.maps.event.addListener(
        dm,
        'overlaycomplete',
        (e: google.maps.drawing.OverlayCompleteEvent) => {
          if (e.type === google.maps.drawing.OverlayType.POLYGON) {
            const poly = e.overlay as google.maps.Polygon;
            const path = poly.getPath();
            const coords = path.getArray().map((p) => p.toJSON());
            const areaM2 = google.maps.geometry.spherical.computeArea(path);
            onPolygonComplete?.({ coords, areaM2 });
          }
        }
      );

      onReady?.(map);
    });
  }, [center, zoom, mapId, onReady, onPolygonComplete]);

  return <div ref={divRef} style={{ width: '100%', height: '70vh' }} />;
}
