// src/utils/geo.ts
export type LatLng = google.maps.LatLngLiteral;

export function rgbToHex(rgb?: string): string | undefined {
  if (!rgb) return;
  if (rgb.startsWith('#')) return rgb;
  const [r, g, b] = rgb.split(',').map(v => Number(v.trim()));
  if ([r, g, b].some(n => Number.isNaN(n))) return;
  const h = (n: number) => n.toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function geojsonToPaths(geometry: any): LatLng[][] {
  const toPath = (ring: number[][]) => ring.map(([lng, lat]) => ({ lat, lng }));
  if (!geometry) return [];
  if (geometry.type === 'Polygon') {
    const outer = geometry.coordinates?.[0] ?? [];
    return [toPath(outer)];
  }
  if (geometry.type === 'MultiPolygon') {
    return (geometry.coordinates ?? []).map((poly: number[][][]) => toPath(poly?.[0] ?? []));
  }
  return [];
}

export function pathsToBounds(paths: LatLng[][]) {
  const b = new google.maps.LatLngBounds();
  paths.forEach(path => path.forEach(p => b.extend(p)));
  return b;
}
