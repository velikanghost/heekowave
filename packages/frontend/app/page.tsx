import type { Metadata } from 'next'
import LandingPageClient from './components/LandingPageClient'

export const metadata: Metadata = {
  title: 'Heekowave - P2P Payments',
  description: 'Experience fast, secure, and decentralized transactions powered by MetaMask Smart Accounts and Monad.',
}

export default function Page() {
  return <LandingPageClient />
}