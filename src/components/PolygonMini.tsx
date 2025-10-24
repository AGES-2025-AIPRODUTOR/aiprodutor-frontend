/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useMemo } from 'react';
import type { Polygon as GJPolygon, MultiPolygon as GJMultiPolygon } from 'geojson';

type RGB = { r: number; g: number; b: number } | [number, number, number];

/** Aceita GeoJSON + “likes” vindos do back */
type PolygonLike = { type: 'Polygon'; coordinates: number[][][] };
type MultiPolygonLike = { type: 'MultiPolygon'; coordinates: number[][][][] };
// 👇 Aceitar Polygon | MultiPolygon | “Polygon-like” (do back)
type AnyPolygon =
  | GJPolygon
  | GJMultiPolygon
  | PolygonLike
  | MultiPolygonLike
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | { type: string; coordinates: any };

type Props = {
  polygon: AnyPolygon;     // <-- antes era só GeoJSONPolygon
  size?: number;
  className?: string;

  // Moldura
  frameStroke?: string;
  frameStrokeWidth?: number;
  frameRadius?: number;
  bg?: string;

  // Estilo padrão do polígono (fallback se não passar `color`)
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  fillOpacity?: number;

  // Cor opcional (RGB/hex/etc.)
  color?: string | RGB;

  // padding interno
  padding?: number;
};
/** ---- type guards seguros ---- */
function hasCoords(p: unknown): p is { type: string; coordinates: any } {
  return !!p && typeof p === 'object' && 'type' in (p as any) && 'coordinates' in (p as any);
}
function isPolygon(p: AnyPolygon): p is GJPolygon | PolygonLike {
  return p.type === 'Polygon' && hasCoords(p);
}
function isMultiPolygon(p: AnyPolygon): p is GJMultiPolygon | MultiPolygonLike {
  return p.type === 'MultiPolygon' && hasCoords(p);
}
function toCssColor(color?: string | RGB): string | undefined {
  if (!color) return undefined;
  if (typeof color === 'string') {
    const m = color.match(/^\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*$/);
    if (m) return `rgb(${m[1]}, ${m[2]}, ${m[3]})`;
    return color;
  }
  const [r, g, b] = Array.isArray(color) ? color : [color.r, color.g, color.b];
  return `rgb(${r}, ${g}, ${b})`;
}

/** Projeta [lng,lat] e centraliza no box considerando padding */
function projectRingsCentered(
  // aceita anelagem de Polygon (N x M x 2)
  rings: number[][][],
  boxW: number,
  boxH: number,
  pad: number
): { d: string } {
  if (!rings?.length || !rings[0]?.length) return { d: '' };

  const all = rings.flat().map(([lng, lat]) => ({ lng, lat }));
  if (all.length < 3) return { d: '' };

  const lat0 = all.reduce((s, p) => s + p.lat, 0) / all.length;
  const lng0 = all.reduce((s, p) => s + p.lng, 0) / all.length;
  const cosLat0 = Math.cos((lat0 * Math.PI) / 180);

  const projected = rings.map(ring =>
    ring.map(([lng, lat]) => ({
      x: (lng - lng0) * cosLat0,
      y: (lat - lat0),
    }))
  );

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const ring of projected) {
    for (const p of ring) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
  }
  const w = maxX - minX;
  const h = maxY - minY;
  if (w === 0 || h === 0) return { d: '' };

  const drawW = boxW - pad * 2;
  const drawH = boxH - pad * 2;
  const k = Math.min(drawW / w, drawH / h);

  const offX = pad + (drawW - w * k) / 2;
  const offY = pad + (drawH - h * k) / 2;

  const toSvg = (p: { x: number; y: number }) => ({
    x: offX + (p.x - minX) * k,
    y: offY + (maxY - p.y) * k, // inverte Y
  });

  const parts: string[] = [];
  for (const ring of projected) {
    if (!ring.length) continue;
    const first = toSvg(ring[0]);
    const cmds = [`M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`];
    for (let i = 1; i < ring.length; i++) {
      const p = toSvg(ring[i]);
      cmds.push(`L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`);
    }
    cmds.push('Z');
    parts.push(cmds.join(' '));
  }

  return { d: parts.join(' ') };
}

export default function PolygonMini({
  polygon,
  size = 96,
  className,
  frameStroke = '#000',
  frameStrokeWidth = 3,
  frameRadius = 6,
  bg = '#fff',
  stroke = '#000',
  strokeWidth = 3,
  fill = '#000',
  fillOpacity = 1,
  color,
  padding = 8,
}: Props) {
  // 👇 normaliza: se for MultiPolygon, junta todos os “polygons” em um único array de rings
  const d = useMemo(() => {
    if (!polygon) return '';

    let rings: number[][][] | null = null;

    if (polygon.type === 'Polygon') {
      rings = polygon.coordinates as number[][][];
    } else if (polygon.type === 'MultiPolygon') {
      // flatten de number[][][][] -> number[][][]
      rings = (polygon.coordinates as number[][][][]).flat();
    } else {
      // fallback para objetos “parecidos” (teu tipo custom)
      if (polygon.type === 'Polygon' && polygon.coordinates) {
        rings = polygon.coordinates as number[][][];
      }
    }

    if (!rings) return '';
    return projectRingsCentered(rings, size, size, padding).d;
  }, [polygon, size, padding]);

  const colorCss = toCssColor(color);
  const fillCss = colorCss ?? fill;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Prévia da área"
      className={className}
    >
      <rect
        x={frameStrokeWidth / 2}
        y={frameStrokeWidth / 2}
        width={size - frameStrokeWidth}
        height={size - frameStrokeWidth}
        rx={frameRadius}
        ry={frameRadius}
        fill={bg}
        stroke={frameStroke}
        strokeWidth={frameStrokeWidth}
      />
      {d && (
        <path
          d={d}
          fill={fillCss}
          fillOpacity={fillOpacity}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
          fillRule="evenodd"
        />
      )}
    </svg>
  );
}
