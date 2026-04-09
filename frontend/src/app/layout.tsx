import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Heekowave | Agentic Registry',
  description: 'A decentralized registry for AI agent services utilizing the Stellar x402 payment protocol.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${mono.variable} font-sans min-h-screen bg-black antialiased selection:bg-primary/30`}>
        <Providers>
          <div className="flex min-h-screen bg-black overflow-hidden truncate">
            <Sidebar />
            <div className="flex-1 lg:pl-64 flex flex-col min-h-screen max-h-screen">
              <Navbar />
              <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}

