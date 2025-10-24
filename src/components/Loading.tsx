'use client';

type LoadingProps = {
  label?: string;
  size?: number;          // px
  height?: number | string; // útil para ocupar espaço em cards
  center?: boolean;       // centraliza vertical/horizontal
};

export default function Loading({
  label = 'Carregando…',
  size = 48,
  height,
  center = true,
}: LoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        height,
        display: 'flex',
        alignItems: center ? 'center' : undefined,
        justifyContent: center ? 'center' : undefined,
        flexDirection: 'column',
      }}
    >
      <div
        className="loading__spinner"
        style={{ width: size, height: size, borderWidth: Math.max(3, Math.round(size / 12)) }}
      />
      <span className="loading__text">{label}</span>
    </div>
  );
}
