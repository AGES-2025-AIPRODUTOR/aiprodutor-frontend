'use client';

import React from 'react';

export type StatusType = 'Concluído' | 'Ativo' | 'Em Andamento' | 'Desativado';

export const StatusBadge: React.FC<{ status: StatusType | string }> = ({ status }) => {
  const normalizedStatus = status as StatusType;
  
  const colors: Record<StatusType, { bg: string; text: string }> = {
    'Concluído': { bg: '#38A067', text: 'white' },
    'Ativo': { bg: '#1A41FF', text: 'white' },
    'Em Andamento': { bg: '#EDC606', text: 'white' },
    'Desativado': { bg: '#FF0000', text: 'white' },
  };

  const statusStyle = colors[normalizedStatus] || { bg: '#6B7280', text: 'white' };

  return (
    <span
      className="px-2 py-1 rounded-full font-medium"
      style={{
        fontSize: '11px',
        backgroundColor: statusStyle.bg,
        color: statusStyle.text,
      }}
    >
      {normalizedStatus}
    </span>
  );
};