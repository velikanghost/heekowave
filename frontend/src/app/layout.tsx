import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

import { AppLayout } from '@/components/app-layout'
import { RegistrationDrawer } from '@/components/registration-drawer'

export const metadata: Metadata = {
  title: 'Heekowave',
  description:
    'The discovery and monetization layer for the autonomous economy. Powered by Stellar x402 micro-payments and Soroban smart contracts.',
  openGraph: {
    title: 'Heekowave',
    description:
      'Autonomous Settlement Gateway & API Registry for the Agentic Economy.',
    images: [{ url: '/thumbnail.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Heekowave',
    description:
      'Autonomous Settlement Gateway & API Registry for the Agentic Economy.',
    images: ['/thumbnail.png'],
  },
  icons: {
    icon: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${mono.variable} font-sans min-h-screen bg-black antialiased selection:bg-primary/30`}
      >
        <Providers>
          <AppLayout>{children}</AppLayout>
          <RegistrationDrawer />
        </Providers>
      </body>
    </html>
  )
}
