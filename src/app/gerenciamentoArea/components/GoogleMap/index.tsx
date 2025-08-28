// components/GoogleMap/index.tsx
'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import Skeleton from './Skeleton';
import ErrorView from './Error';
import type { GoogleMapCoreProps } from './GoogleMap';

const CoreMap = dynamic<GoogleMapCoreProps>(
  () => import('./GoogleMap'),
  { ssr: false, loading: () => <Skeleton /> }
);

export default function GoogleMapWrapper(props: GoogleMapCoreProps) {
  const [err, setErr] = useState<Error | null>(null);
  const [nonce, setNonce] = useState(0); // força remontar no retry

  if (err) {
    return (
      <ErrorView
        message={err.message}
        onRetry={() => {
          setErr(null);
          setNonce((n) => n + 1);
        }}
      />
    );
  }

  return <CoreMap key={nonce} {...props} onError={setErr} />;
}
