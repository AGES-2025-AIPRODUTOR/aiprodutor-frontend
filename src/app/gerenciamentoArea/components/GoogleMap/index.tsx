'use client';
import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Skeleton from './Skeleton';
import ErrorView from './Error';

// evita SSR e mostra Skeleton enquanto importa
const CoreMap = dynamic(() => import('./GoogleMap'), {
  ssr: false,
  loading: () => <Skeleton />,
});

type Props = React.ComponentProps<typeof CoreMap>;

export default function GoogleMapWrapper(props: Props) {
  const [err, setErr] = useState<Error | null>(null);
  const retry = useCallback(() => setErr(null), []);

  if (err) return <ErrorView message={err.message} onRetry={retry} />;

  return <CoreMap {...props} onError={setErr} />;
}
