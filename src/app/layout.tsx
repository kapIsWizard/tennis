import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Low on Legs',
  description: 'Organizacja amatorskich lig tenisowych',
};

export const runtime = 'nodejs';

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pl">
      <body>
        <nav className="site-nav" aria-label="Główna nawigacja">
          <Link className="brand" href="/">
            Low on Legs
          </Link>
          <Link href="/players">Gracze</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
