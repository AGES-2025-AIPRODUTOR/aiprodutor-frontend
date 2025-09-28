'use client';
import React from 'react';

type StepKey = 'safra' | 'plantios';

type Props = {
  active?: StepKey;                     // etapa atual
  onChange?: (s: StepKey) => void;      // opcional: clicar nas bolinhas
  className?: string;
  title?: string;
  connectorWidthClass?: string;         // ex.: 'w-8 sm:w-14'
  offsetXClass?: string;                // ex.: 'translate-x-1 sm:translate-x-2' (ajuste fino p/ direita)
};

type DotState = 'idle' | 'active' | 'done';

function Dot({ state }: { state: DotState }) {
  // 20px (h-5 w-5) com núcleo de 10px (h-2.5 w-2.5)
  const borderClass =
    state === 'done' || state === 'active' ? 'border-green-600' : 'border-gray-300';
  const fillClass =
    state === 'done'
      ? 'bg-green-600'
      : state === 'active'
      ? 'bg-green-600'
      : 'bg-green-500/25';

  return (
    <span className={`grid h-5 w-5 place-items-center rounded-full border ${borderClass}`}>
      {state === 'done' ? (
        // ícone ✓ branco dentro do círculo verde
        <svg viewBox="0 0 16 16" className="h-3 w-3 text-white" aria-hidden>
          <path
            d="M6.2 10.6 3.9 8.3l1.1-1.1 1.2 1.2 3.7-3.7 1.1 1.1-4.8 4.8z"
            fill="currentColor"
          />
        </svg>
      ) : (
        <span className={`h-2.5 w-2.5 rounded-full ${fillClass}`} />
      )}
    </span>
  );
}

export default function SafraSteps({
  active = 'safra',
  onChange,
  className = '',
  title = 'Nova Safra',
  connectorWidthClass = 'w-8 sm:w-14',
  offsetXClass = '',
}: Props) {
  const idx = active === 'plantios' ? 1 : 0;

  // estados das bolinhas conforme o fluxo Safra -> Plantios
  const leftState: DotState = idx === 0 ? 'active' : 'done';
  const rightState: DotState = idx === 0 ? 'idle' : 'active';

  return (
    <div className={`flex flex-col items-center ${className} ${offsetXClass}`}>

      {/* grid com 2 linhas: bolinhas/linha acima e labels abaixo */}
      <div className="mt-1 grid grid-cols-[auto_auto_auto] items-center">
        {/* linha 1 */}
        <button
          type="button"
          onClick={() => onChange?.('safra')}
          className="col-start-1 row-start-1 justify-self-center"
        >
          <Dot state={leftState} />
        </button>

        {/* conector central exatamente entre as bolinhas (meio da altura) */}
        <div className={`col-start-2 row-start-1 ${connectorWidthClass} mx-2 flex items-center`}>
          <div className="relative h-[2px] w-full rounded bg-gray-200">
            <div
              className="absolute left-0 top-0 h-[2px] rounded bg-green-600 transition-all"
              style={{ width: idx >= 1 ? '100%' : '0%' }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => onChange?.('plantios')}
          className="col-start-3 row-start-1 justify-self-center"
        >
          <Dot state={rightState} />
        </button>

        {/* linha 2: labels alinhadas nas bolinhas */}
        <span className="col-start-1 row-start-2 mt-1 justify-self-center text-[11px] font-medium text-gray-900">
          Safra
        </span>
        <span className="col-start-3 row-start-2 mt-1 justify-self-center text-[11px] text-gray-400">
          Plantios
        </span>
      </div>
    </div>
  );
}
