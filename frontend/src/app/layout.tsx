import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Heekowave | The Bazaar',
  description: 'A decentralized marketplace for AI agent services utilizing the Stellar x402 payment protocol.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-black antialiased selection:bg-indigo-500/30`}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 px-6">
              <div className="container mx-auto max-w-7xl">
                {children}
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
