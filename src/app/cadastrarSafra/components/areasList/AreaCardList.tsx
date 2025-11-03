/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import PolygonMini from '@/components/PolygonMini';

export default function AreaCardList(props: {
  soilType: string;
  areaName?: string;
  irrigationType: string;
  size: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;

  // NEW
  polygon?: { type: string; coordinates: any[] } | null;
}) {
  const {
    soilType,
    irrigationType,
    size,
    areaName,
    checked,
    onCheckedChange,
    polygon,
  } = props;

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg shadow-md text-gray-600 text-sm font-light">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mini polígono */}
        <div className="w-[44px] h-[44px] flex items-center justify-center">
          {polygon?.coordinates?.length ? (
            <PolygonMini
              polygon={polygon as any}
              size={40}
              padding={4}
              stroke="#4ade80"
              fill="#a7f3d0"
              strokeWidth={2}
              frameStroke="#6C6A6D"
              frameStrokeWidth={1}
            />
          ) : null}
        </div>

        {/* Texto */}
        <div className="min-w-0">
          <h1 className="font-bold text-base truncate">{areaName || 'Área Sem Nome'}</h1>
          <p className="truncate">Tipo de solo: {soilType}</p>
          <p className="truncate">Tipo de irrigação: {irrigationType}</p>
          <p className="truncate">Tamanho: {size}</p>
        </div>
      </div>

      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}
