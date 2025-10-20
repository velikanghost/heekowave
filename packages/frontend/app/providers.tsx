'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'
import { Web3AuthProvider } from '@web3auth/modal/react'
import { WagmiProvider } from '@web3auth/modal/react/wagmi'
import { createConfig, http } from 'wagmi'
import { monadTestnet } from 'viem/chains'

type Props = {
  children: ReactNode
}

export function Providers({ children }: Props) {
  const [queryClient] = useState(() => new QueryClient())

  const config = createConfig({
    chains: [monadTestnet],
    transports: {
      [monadTestnet.id]: http(),
    },
  })

  const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID

  if (!clientId) {
    console.warn('NEXT_PUBLIC_WEB3AUTH_CLIENT_ID is not set. Please add it to your .env.local file.')
    return (
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>{children}</WagmiProvider>
      </QueryClientProvider>
    )
  }

  return (
    <Web3AuthProvider
      config={{
        web3AuthOptions: {
          clientId: clientId,
          web3AuthNetwork: 'sapphire_devnet',
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>{children}</WagmiProvider>
      </QueryClientProvider>
    </Web3AuthProvider>
  )
}
