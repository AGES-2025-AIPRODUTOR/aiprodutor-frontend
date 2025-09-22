'use client';
import React, { useMemo } from 'react';
import type { Polygon as GeoJSONPolygon } from 'geojson';

type RGB = { r: number; g: number; b: number } | [number, number, number];

type Props = {
  polygon: GeoJSONPolygon;
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

  // Cor opcional para “pintar o desenho” (RGB). Aceita:
  // - string CSS: "#ff8800" | "rgb(255,136,0)" | "hsl(...)" etc.
  // - "r,g,b" (ex.: "255,136,0")
  // - objeto {r,g,b} ou tupla [r,g,b]
  color?: string | RGB;

  // padding interno
  padding?: number;
};

function toCssColor(color?: string | RGB): string | undefined {
  if (!color) return undefined;
  if (typeof color === 'string') {
    // se vier "255,136,0" -> vira rgb(255,136,0)
    const m = color.match(/^\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*$/);
    if (m) return `rgb(${m[1]}, ${m[2]}, ${m[3]})`;
    return color; // já é uma cor CSS (#, rgb(), etc.)
  }
  const [r, g, b] = Array.isArray(color) ? color : [color.r, color.g, color.b];
  return `rgb(${r}, ${g}, ${b})`;
}

/** Projeta [lng,lat] e centraliza no box considerando padding */
function projectRingsCentered(
  rings: GeoJSONPolygon['coordinates'],
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

  // bbox no plano local
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

  // espaço desenhável com padding
  const drawW = boxW - pad * 2;
  const drawH = boxH - pad * 2;

  // escala uniforme
  const k = Math.min(drawW / w, drawH / h);

  // offsets para CENTRALIZAR dentro do quadro (com padding)
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
  const d = useMemo(() => {
    if (!polygon || polygon.type !== 'Polygon') return '';
    return projectRingsCentered(polygon.coordinates, size, size, padding).d;
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
