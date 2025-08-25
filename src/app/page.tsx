'use client';

import { useState } from 'react';

export default function Home() {
  const [count, setCount] = useState(0);

  return (
     <div className="flex min-h-screen items-center justify-center bg-blue-500 text-white">
      <h1 className="text-4xl font-bold">Tailwind funcionando 🚀</h1>
    </div>
  );
}
