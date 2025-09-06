'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import Skeleton from './Skeleton';
import ErrorView from './Error';
import type { AreaFormProps } from './AreaForm';

const CoreAreaForm = dynamic<AreaFormProps>(
  () => import('./AreaForm'),
  { ssr: false, loading: () => <Skeleton /> }
);

export default function CadastroAreaWrapper(props: AreaFormProps) {
  const [err, setErr] = useState<Error | null>(null);
  const [nonce, setNonce] = useState(0); // força remontagem no retry

  if (err) {
    return (
      <ErrorView
        message={err.message || 'Não foi possível carregar o formulário.'}
        onRetry={() => {
          setErr(null);
          setNonce((n) => n + 1);
        }}
      />
    );
  }

  return <CoreAreaForm key={nonce} {...props} onError={setErr} />;
}
