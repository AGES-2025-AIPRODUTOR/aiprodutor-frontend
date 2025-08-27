// src/app/page.tsx
'use client';

import { redirect, RedirectType } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    redirect('/home', RedirectType.replace);
  }, []);
  // UseEffect com um Array vazio - Ação ocorre uma vez ao carregar a página.

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-blue-500 text-white">
      <h1 className="text-5xl font-extrabold mb-6 drop-shadow-lg">Tailwind funcionando 🚀</h1>
      <button className="px-6 py-3 rounded-lg bg-white text-blue-700 font-semibold shadow hover:bg-gray-100 transition">
        Botão de Teste
      </button>
    </main>
  );
}
