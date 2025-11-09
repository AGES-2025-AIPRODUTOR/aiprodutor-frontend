/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import PolygonMini from '@/components/PolygonMini';
import { cn } from '@/lib/utils';
import type { CheckedState } from '@radix-ui/react-checkbox';

type Props = {
  soilType: string;
  irrigationType: string;
  size: string;
  areaName?: string;

  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;

  /** Geo */
  polygon?: { type: string; coordinates: any[] } | null;

  /** UX extra */
  disabled?: boolean;
  className?: string;
  /** Elemento opcional do lado direito (ex.: ícone, botão) */
  rightSlot?: React.ReactNode;
};

export default function AreaCardList({
  soilType,
  irrigationType,
  size,
  areaName,
  checked = false,
  onCheckedChange,
  polygon,
  disabled = false,
  className,
  rightSlot,
}: Props) {
  // normaliza o tipo do shadcn (CheckedState -> boolean)
  const handleCheckboxChange = useCallback(
    (state: CheckedState) => {
      onCheckedChange?.(state === true);
    },
    [onCheckedChange]
  );

  // permite clicar no card inteiro pra alternar
  const toggleFromCard = useCallback(() => {
    if (disabled) return;
    onCheckedChange?.(!checked);
  }, [checked, disabled, onCheckedChange]);

  return (
    <div
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled}
      onClick={toggleFromCard}
      className={cn(
        'flex items-center justify-between p-3 border rounded-lg shadow-md text-gray-600 text-sm font-light',
        'cursor-pointer select-none',
        disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-muted/40',
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Mini polígono */}
        <div className="w-[44px] h-[44px] flex items-center justify-center shrink-0">
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
          <h1 className="font-bold text-base truncate" title={areaName || 'Área Sem Nome'}>
            {areaName || 'Área Sem Nome'}
          </h1>
          <p className="truncate" title={`Tipo de solo: ${soilType}`}>
            Tipo de solo: {soilType}
          </p>
          <p className="truncate" title={`Tipo de irrigação: ${irrigationType}`}>
            Tipo de irrigação: {irrigationType}
          </p>
          <p className="truncate" title={`Tamanho: ${size}`}>
            Tamanho: {size}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
        {rightSlot ? <div className="mr-1">{rightSlot}</div> : null}
        <Checkbox checked={checked} onCheckedChange={handleCheckboxChange} disabled={disabled} />
      </div>
    </div>
  );
}
