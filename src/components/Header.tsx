'use client';
import Image from 'next/image';
import Link from 'next/link';
import { LOGOS } from '../../public/brand/logos';

export default function Header() {
  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4">
        {/* hortti (não clica) */}
        <div className="select-none">
          <Image src={LOGOS.hortti} alt="hortti sig" width={110} height={24} priority draggable={false} />
        </div>

        <div className="flex items-center gap-3">

          {/* AI Produtor (link para Home) */}
          <Link href="/" aria-label="Ir para a Home — AI Produtor" className="inline-flex items-center">
            <Image src={LOGOS.aiProdutor} alt="AI Produtor" width={120} height={24} draggable={false} />
          </Link>
        </div>
      </div>
    </header>
  );
}
