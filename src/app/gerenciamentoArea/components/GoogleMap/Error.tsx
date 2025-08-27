'use client';

type Props = { message?: string; onRetry?: () => void; height?: number | string };
export default function MapError({ message, onRetry, height = '70vh' }: Props) {
  return (
    <div
      style={{ height }}
      className="w-full rounded-lg border border-red-300 bg-red-50 p-4 text-red-700 flex items-center justify-between"
    >
      <span>Não foi possível carregar o mapa{message ? `: ${message}` : ''}.</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md border px-3 py-1 text-sm hover:bg-red-100"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
