'use client';

import { redirect, RedirectType } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    const timer = setTimeout(() => {
      redirect('/controleSafra', RedirectType.replace);
    }, 0);
    return () => clearTimeout(timer);
  }, []);
}
