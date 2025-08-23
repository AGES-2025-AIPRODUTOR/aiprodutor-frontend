'use client';

import { useState } from 'react';

export default function Home() {
  const [count, setCount] = useState(0);

  return (
    <main style={{ padding: '24px' }}>
      <h1 style={{ 
        fontFamily: 'var(--font-title)', 
        fontSize: 'var(--font-size-xl)' 
      }}>
        🚀 Next.js rodando no Docker!
      </h1>

      <p style={{ 
        marginTop: 8, 
        fontFamily: 'var(--font-body)', 
        fontSize: 'var(--font-size-md)' 
      }}>
        Se você está vendo esta página, a rota <code>/</code> está ativa.
      </p>

      <div style={{ 
        marginTop: 16, 
        padding: 16, 
        border: '1px solid var(--green-300)', 
        borderRadius: 8, 
        background: 'var(--green-25)' 
      }}>
        <strong>Hot‑reload:</strong> edite este texto e salve para ver atualizar.
      </div>

      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => setCount(c => c + 1)}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            background: 'var(--green-500)',
            color: 'white',
          }}
        >
          Clique (+1)
        </button>
        <span>Contador: {count}</span>
      </div>

      <div style={{ marginTop: 24, fontSize: 'var(--font-size-sm)' }}>
        <div><strong>NEXT_PUBLIC_API_URL:</strong> {process.env.NEXT_PUBLIC_API_URL ?? '—'}</div>
        <div style={{ opacity: 0.7 }}>Agora: {new Date().toLocaleString()}</div>
      </div>
    </main>
  );
}
