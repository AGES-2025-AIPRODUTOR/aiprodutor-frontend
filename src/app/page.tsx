'use client';

import { redirect, RedirectType } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    redirect('/home', RedirectType.replace);
  }, []);
  // UseEffect com um Array vazio - Ação ocorre uma vez ao carregar a página.

  return (
    <div >

    </div>
  );
}
