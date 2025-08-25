'use client';
import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

type Lib = 'drawing' | 'geometry';

type Props = {
  zoom?: number;
  center?: google.maps.LatLngLiteral;
  onPolygonComplete?: (data: { coords: google.maps.LatLngLiteral[]; areaM2: number }) => void;
  onReady?: (map: google.maps.Map) => void; // <-- ADICIONA ISTO
};

export default function GoogleMap({
  zoom = 12,
  center = { lat: -30.0346, lng: -51.2177 },
  onPolygonComplete,
}: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const controlsInjected = useRef(false); // evita duplicar controles em dev

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: 'weekly',
      libraries: ['drawing', 'geometry'] as Lib[],
    });

    let map: google.maps.Map;
    let dm: google.maps.drawing.DrawingManager | null = null;

    // variáveis usadas no freehand
    let freeBtn: HTMLButtonElement | null = null;
    let freehandOn = false;
    let sketchLine: google.maps.Polyline | null = null;
    let moveL: google.maps.MapsEventListener | null = null;
    let upL: google.maps.MapsEventListener | null = null;

    const removeDomListeners: Array<() => void> = [];

    loader.load().then(async () => {
      if (!divRef.current) return;

      map = new google.maps.Map(divRef.current, {
        center,
        zoom,
        gestureHandling: 'greedy',
        fullscreenControl: true,
      });
      map = new google.maps.Map(divRef.current, {
        center,
        zoom,
        gestureHandling: 'greedy',
        fullscreenControl: true,
      });
      // --- DrawingManager padrão ---
      dm = new google.maps.drawing.DrawingManager({
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

      // --- Helper de projeção para converter pixels -> LatLng (touch) ---
      class ProjectionHelper extends google.maps.OverlayView {
        onAdd() {}
        onRemove() {}
        draw() {}
      }
      const helper = new ProjectionHelper();
      helper.setMap(map);

      const fromTouchToLatLng = (t: Touch): google.maps.LatLng | null => {
        const proj = helper.getProjection();
        if (!proj || !divRef.current) return null;
        const rect = divRef.current.getBoundingClientRect();
        const px = new google.maps.Point(t.clientX - rect.left, t.clientY - rect.top);
        return proj.fromContainerPixelToLatLng(px);
      };

      // --- Botão de Freehand (injetado só uma vez) ---
      if (!controlsInjected.current) {
        freeBtn = document.createElement('button');
        freeBtn.textContent = '✏️ Desenho livre';
        Object.assign(freeBtn.style, {
          padding: '6px 10px',
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: '4px',
          cursor: 'pointer',
          marginLeft: '8px',
        });
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(freeBtn);
        controlsInjected.current = true;
      }

      const setFreehand = (on: boolean) => {
        freehandOn = on;
        if (freeBtn) freeBtn.style.background = on ? '#e6f4ea' : '#fff';
        map.setOptions({ draggable: !on, draggableCursor: on ? 'crosshair' : undefined });
        // evita conflito com a barra padrão enquanto desenha livre
        if (on) dm?.setDrawingMode(null);
      };

      freeBtn!.onclick = () => setFreehand(!freehandOn);

      // Início do traçado livre
      const startSketch = (start: google.maps.LatLng) => {
        if (!freehandOn) return;

        sketchLine = new google.maps.Polyline({
          map,
          clickable: false,
          strokeOpacity: 0.9,
          strokeWeight: 2,
        });
        const path = sketchLine.getPath();
        path.push(start);

        let last = start;

        // mousemove (desktop)
        moveL = map.addListener('mousemove', (me: google.maps.MapMouseEvent) => {
          if (!me.latLng) return;
          const d = google.maps.geometry.spherical.computeDistanceBetween(last, me.latLng);
          if (d > 2) {
            path.push(me.latLng);
            last = me.latLng;
          }
        });

        // touchmove (mobile) — usa DOM nativo (com {passive:false})
        const touchMove = (ev: TouchEvent) => {
          if (!sketchLine) return;
          ev.preventDefault();
          const latLng = fromTouchToLatLng(ev.touches[0]);
          if (!latLng) return;
          const d = google.maps.geometry.spherical.computeDistanceBetween(last, latLng);
          if (d > 2) {
            path.push(latLng);
            last = latLng;
          }
        };
        divRef.current!.addEventListener('touchmove', touchMove, { passive: false });
        removeDomListeners.push(() => divRef.current?.removeEventListener('touchmove', touchMove));

        const finish = () => {
          if (moveL) google.maps.event.removeListener(moveL);
          if (upL) google.maps.event.removeListener(upL);

          if (!sketchLine) return;
          const coords = sketchLine
            .getPath()
            .getArray()
            .map((p) => p.toJSON());
          sketchLine.setMap(null);
          sketchLine = null;

          // vira polígono (já editável)
          const polygon = new google.maps.Polygon({
            map,
            paths: coords,
            fillOpacity: 0.2,
            strokeWeight: 2,
            editable: true,
          });
          const areaM2 = google.maps.geometry.spherical.computeArea(polygon.getPath());
          onPolygonComplete?.({ coords, areaM2 });

          setFreehand(false);
        };

        upL = map.addListener('mouseup', finish);

        const touchEnd = () => finish();
        divRef.current!.addEventListener('touchend', touchEnd, { once: true });
        removeDomListeners.push(() => divRef.current?.removeEventListener('touchend', touchEnd));
      };

      // iniciar pelo mouse
      map.addListener('mousedown', (e: google.maps.MapMouseEvent) => {
        if (!freehandOn || !e.latLng) return;
        startSketch(e.latLng);
      });

      // iniciar pelo touch — DOM nativo (NÃO usar addDomListener aqui)
      const touchStart = (ev: TouchEvent) => {
        if (!freehandOn) return;
        ev.preventDefault();
        const latLng = fromTouchToLatLng(ev.touches[0]);
        if (latLng) startSketch(latLng);
      };
      divRef.current.addEventListener('touchstart', touchStart, { passive: false });
      removeDomListeners.push(() => divRef.current?.removeEventListener('touchstart', touchStart));
    });

    // cleanup
    return () => {
      removeDomListeners.forEach((off) => off());
    };
  }, [center, zoom, onPolygonComplete]);

  return <div ref={divRef} style={{ width: '100%', height: '70vh' }} />;
}
