'use client';
import { Button } from '@/components/ui/button';

type Props = { message?: string; onRetry?: () => void; height?: number | string };
export default function MapError({ message, onRetry, height = '70vh' }: Props) {
  return (
    <div
      style={{ height }}
      className="w-full rounded-lg border border-red-300 bg-red-50 p-4 text-red-700 flex items-center justify-between"
    >
      <span>Não foi possível carregar o formulário{message ? `: ${message}` : ''}.</span>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="border-red-300 text-red-700 hover:bg-red-100">
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
