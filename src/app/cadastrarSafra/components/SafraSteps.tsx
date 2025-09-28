// components/SafraSteps.tsx
'use client';
import React from 'react';

type Step = 'safra' | 'plantios';
type DotState = 'idle' | 'active' | 'done';

// 👇 agora aceita className, style, aria-*, etc.
type Props = React.HTMLAttributes<HTMLDivElement> & {
  active?: Step;
  safraDone?: boolean;
  title?: string;
  connectorWidthClass?: string;
  offsetXClass?: string;
};

function Dot({ state }: { state: DotState }) {
  const ring = state === 'done' || state === 'active' ? 'border-green-600' : 'border-gray-300';
  const fill =
    state === 'done' ? 'bg-green-600' : state === 'active' ? 'bg-green-600' : 'bg-gray-200';

  return (
    <div aria-hidden className={`grid h-5 w-5 select-none place-items-center rounded-full border ${ring}`}>
      {state === 'done' ? (
        <svg viewBox="0 0 16 16" className="h-3 w-3 text-white">
          <path d="M6.2 10.6 3.9 8.3l1.1-1.1 1.2 1.2 3.7-3.7 1.1 1.1-4.8 4.8z" fill="currentColor" />
        </svg>
      ) : (
        <span className={`h-2.5 w-2.5 rounded-full ${fill}`} />
      )}
    </div>
  );
}

export default function SafraSteps({
  active = 'safra',
  safraDone = false,
  title = 'Nova Safra',
  connectorWidthClass = 'w-12 sm:w-16',
  offsetXClass = '',
  className,           // 👈 agora disponível
  ...rest              // passa os demais attrs pro container
}: Props) {
  const left: DotState = safraDone ? 'done' : active === 'safra' ? 'active' : 'idle';
  const right: DotState = active === 'plantios' ? 'active' : 'idle';
  const progress = active === 'plantios' || safraDone ? '100%' : '0%';

  return (
    <div className={`flex flex-col items-center ${offsetXClass} ${className ?? ''}`} {...rest}>


      <div className="mt-1 grid items-center" style={{ gridTemplateColumns: '20px auto 20px' }}>
        <div className="col-[1] row-[1] justify-self-center">
          <Dot state={left} />
        </div>

        <div className="col-[2] row-[1] mx-2 flex items-center">
          <div className={`relative h-[2px] ${connectorWidthClass} rounded bg-gray-300`}>
            <div
              className="absolute left-0 top-0 h-[2px] rounded bg-green-600 transition-[width] duration-200"
              style={{ width: progress }}
            />
          </div>
        </div>

        <div className="col-[3] row-[1] justify-self-center">
          <Dot state={right} />
        </div>

        <span className="col-[1] row-[2] mt-1 justify-self-center text-[11px] font-medium text-gray-900">
          Safra
        </span>
        <span className="col-[3] row-[2] mt-1 justify-self-center text-[11px] text-gray-400">
          Plantios
        </span>
      </div>
    </div>
  );
}
