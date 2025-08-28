// src/app/layout.tsx
import './globals.css';
import Header from '@/components/Header';

export const metadata = { title: 'Ai Produtor' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Header /> {/* aparece em todas as rotas */}
        <main>{children}</main>
      </body>
    </html>
  );
}
