'use client';
import React from 'react';

export default function AreaCardReadOnly(props: {
  soilType: string;        
  areaName?: string;        
  irrigationType: string;    
  size: string;             
  checked?: boolean;        
  onCheckedChange?: (checked: boolean) => void;
}) {
  const { soilType, irrigationType, size, areaName, checked, onCheckedChange } = props;

  return (
    <div className="flex justify-between items-center p-3 border rounded-lg shadow-md text-gray-600 text-sm font-light">
      {/* Conteúdo do card */}
      <div className="flex flex-col gap-1">
        <h1 className="font-bold text-lg">{areaName || 'Área Sem Nome'}</h1>
        <p>Tipo de solo: {soilType}</p>
        <p>Tipo de irrigação: {irrigationType}</p>
        <p>Tamanho: {size}</p>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className="w-6 h-6 accent-green-600 cursor-pointer flex-shrink-0 mr-4"
      />
    </div>
  );
}
