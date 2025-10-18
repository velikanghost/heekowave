import { createPublicClient, http, getContract } from 'viem'
import {
  DELEGATION_MANAGER_ABI,
  HEKOWAVE_PAYMENTS_ABI,
  HEKOWAVE_WITHDRAWAL_ABI,
  USDC_ABI,
  MONAD_TESTNET_ADDRESSES,
} from '@heekowave/shared'

const MONAD_RPC_URL = process.env.NEXT_PUBLIC_MONAD_RPC_URL as string

export const publicClient = createPublicClient({
  transport: http(MONAD_RPC_URL),
})

export const paymentsContract = () =>
  getContract({
    address: MONAD_TESTNET_ADDRESSES.HEKOWAVE_PAYMENTS as `0x${string}`,
    abi: HEKOWAVE_PAYMENTS_ABI,
    client: { public: publicClient },
  })

export const withdrawalContract = () =>
  getContract({
    address: MONAD_TESTNET_ADDRESSES.HEKOWAVE_WITHDRAWAL as `0x${string}`,
    abi: HEKOWAVE_WITHDRAWAL_ABI,
    client: { public: publicClient },
  })

export const delegationManagerContract = () =>
  getContract({
    address: MONAD_TESTNET_ADDRESSES.DELEGATION_MANAGER as `0x${string}`,
    abi: DELEGATION_MANAGER_ABI,
    client: { public: publicClient },
  })

export const erc20Contract = (address: `0x${string}`) =>
  getContract({ address, abi: USDC_ABI, client: { public: publicClient } })
