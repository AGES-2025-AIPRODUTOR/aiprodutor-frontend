'use client';

import { redirect, RedirectType } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import { LOGOS } from '../../public/brand/logos';

export default function Home() {
  useEffect(() => {
    const timer = setTimeout(() => {
      redirect('/home', RedirectType.replace);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-white">
      <Image
        src={LOGOS.aiProdutor}
        alt="AI Produtor"
        width={180}
        height={40}
        priority
        draggable={false}
      />
    </div>
  );
}
