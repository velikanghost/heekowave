import { createPublicClient, http, createWalletClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { monadTestnet } from 'viem/chains'

const MONAD_RPC_URL = process.env.NEXT_PUBLIC_MONAD_RPC_URL as string

export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(MONAD_RPC_URL),
})

export const getRelayerClient = () => {
  const privateKey = process.env.RELAYER_PRIVATE_KEY as `0x${string}`
  const account = privateKeyToAccount(privateKey)
  return createWalletClient({
    chain: monadTestnet,
    account,
    transport: http(MONAD_RPC_URL),
  })
}

export const getProcessorClient = () => {
  const privateKey = process.env.PROCESSOR_PRIVATE_KEY as `0x${string}`
  const account = privateKeyToAccount(privateKey)
  return createWalletClient({
    chain: monadTestnet,
    account,
    transport: http(MONAD_RPC_URL),
  })
}
