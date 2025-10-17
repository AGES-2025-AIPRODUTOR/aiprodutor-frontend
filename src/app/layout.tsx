// src/app/layout.tsx
import Header from '@/components/Header';
import { AgriculturalProducerProvider } from '@/context/AgriculturalProducerContext';
import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import ReactQueryProvider from '@/lib/reactQueryProvider';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata = {
  title: 'Ai Produtor',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body className="h-screen">
        <ReactQueryProvider>
          <AgriculturalProducerProvider>
            <Header />
            <main className="h-[calc(h-screen - 49px)]">{children}</main>
            <Toaster position="top-right" richColors />
          </AgriculturalProducerProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
