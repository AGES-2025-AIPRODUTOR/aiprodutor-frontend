/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useMemo } from 'react';
import type { Polygon as GJPolygon, MultiPolygon as GJMultiPolygon } from 'geojson';

type RGB = { r: number; g: number; b: number } | [number, number, number];

type PolygonLike = { type: 'Polygon'; coordinates: number[][][] };
type MultiPolygonLike = { type: 'MultiPolygon'; coordinates: number[][][][] };
type AnyPolygon =
  | GJPolygon
  | GJMultiPolygon
  | PolygonLike
  | MultiPolygonLike
  | { type: string; coordinates: any };

type Props = {
  polygon: AnyPolygon;
  size?: number;
  className?: string;
  frameStroke?: string;
  frameStrokeWidth?: number;
  frameRadius?: number;
  bg?: string;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  fillOpacity?: number;
  color?: string | RGB;
  padding?: number;
};

/** ---- type guards ---- */
function hasCoords(p: unknown): p is { type: string; coordinates: any } {
  return !!p && typeof p === 'object' && 'type' in (p as any) && 'coordinates' in (p as any);
}
function isPolygon(p: AnyPolygon): p is GJPolygon | PolygonLike {
  return hasCoords(p) && p.type === 'Polygon';
}
function isMultiPolygon(p: AnyPolygon): p is GJMultiPolygon | MultiPolygonLike {
  return hasCoords(p) && p.type === 'MultiPolygon';
}

function toCssColor(color?: string | RGB): string | undefined {
  if (!color) return undefined;
  if (typeof color === 'string') {
    const m = color.match(/^\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*$/);
    return m ? `rgb(${m[1]}, ${m[2]}, ${m[3]})` : color;
  }
  const [r, g, b] = Array.isArray(color) ? color : [color.r, color.g, color.b];
  return `rgb(${r}, ${g}, ${b})`;
}

/** --------- Helpers de geometria --------- */

type Ring = { x: number; y: number }[];
type Bounds = { minX: number; minY: number; maxX: number; maxY: number };

function normalizeRings(polygon: AnyPolygon): number[][][] | null {
  if (!hasCoords(polygon)) return null;
  if (isPolygon(polygon)) return polygon.coordinates as number[][][];
  if (isMultiPolygon(polygon)) return (polygon.coordinates as number[][][][]).flat();
  // fallback: aceitar “likes” desde que tenham estrutura minimamente válida
  const c = polygon.coordinates as unknown;
  return Array.isArray(c) && Array.isArray(c[0]) && Array.isArray(c[0][0]) ? (c as number[][][]) : null;
}

function centroidLngLat(rings: number[][][]): { lng0: number; lat0: number } | null {
  const all = rings.flat();
  if (all.length < 3) return null;
  let sumLng = 0, sumLat = 0;
  for (const [lng, lat] of all) {
    sumLng += lng;
    sumLat += lat;
  }
  return { lng0: sumLng / all.length, lat0: sumLat / all.length };
}

function projectRings(rings: number[][][], lng0: number, lat0: number): Ring[] {
  const cosLat0 = Math.cos((lat0 * Math.PI) / 180);
  return rings.map(ring =>
    ring.map(([lng, lat]) => ({
      x: (lng - lng0) * cosLat0,
      y: (lat - lat0),
    }))
  );
}

function boundsOf(projected: Ring[]): Bounds | null {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  let any = false;
  for (const ring of projected) {
    for (const p of ring) {
      any = true;
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
  }
  return any ? { minX, minY, maxX, maxY } : null;
}

function scaleAndOffset(
  boxW: number,
  boxH: number,
  pad: number,
  b: Bounds
): { k: number; offX: number; offY: number; drawW: number; drawH: number } | null {
  const w = b.maxX - b.minX;
  const h = b.maxY - b.minY;
  if (w === 0 || h === 0) return null;

  const drawW = boxW - pad * 2;
  const drawH = boxH - pad * 2;
  const k = Math.min(drawW / w, drawH / h);

  const offX = pad + (drawW - w * k) / 2;
  const offY = pad + (drawH - h * k) / 2;

  return { k, offX, offY, drawW, drawH };
}

function ringsToPath(projected: Ring[], b: Bounds, k: number, offX: number, offY: number): string {
  const toSvg = (p: { x: number; y: number }) => ({
    x: offX + (p.x - b.minX) * k,
    y: offY + (b.maxY - p.y) * k, // inverte Y
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
  return parts.join(' ');
}

/** Orquestradora: pequena e com baixa complexidade */
function projectRingsCentered(rings: number[][][], boxW: number, boxH: number, pad: number): { d: string } {
  if (!rings?.length || !rings[0]?.length) return { d: '' };

  const c = centroidLngLat(rings);
  if (!c) return { d: '' };

  const projected = projectRings(rings, c.lng0, c.lat0);
  const b = boundsOf(projected);
  if (!b) return { d: '' };

  const s = scaleAndOffset(boxW, boxH, pad, b);
  if (!s) return { d: '' };

  return { d: ringsToPath(projected, b, s.k, s.offX, s.offY) };
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
  const d = useMemo(() => {
    if (!polygon) return '';
    const rings = normalizeRings(polygon);
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
