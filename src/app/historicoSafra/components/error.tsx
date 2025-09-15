'use client';
type Props = { message?: string; onRetry?: () => void; height?: number | string };

export default function HistoricoError({ message, onRetry, height = '70vh' }: Props) {
  return (
    <div
      style={{ height }}
      className="w-full rounded-lg border border-red-300 bg-red-50 p-4 text-red-700 flex items-center justify-between"
    >
      <span style={{ fontSize: '11px' }}>
        Não foi possível carregar o histórico de safras{message ? `: ${message}` : ''}.
      </span>
      {onRetry && (
        <button 
          onClick={onRetry} 
          className="rounded-md border px-3 py-1 hover:bg-red-100"
          style={{ fontSize: '11px' }}
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}