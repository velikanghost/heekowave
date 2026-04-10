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
    'A decentralized registry for AI agent services utilizing the Stellar x402 payment protocol.',
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
