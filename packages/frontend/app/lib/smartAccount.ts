import {
  toMetaMaskSmartAccount,
  Implementation,
  type MetaMaskSmartAccount,
} from '@metamask/delegation-toolkit'
import { createPublicClient, http, type Account } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { monadTestnet } from 'viem/chains'

const MONAD_RPC_URL = process.env.NEXT_PUBLIC_MONAD_RPC_URL as string

export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(MONAD_RPC_URL),
})

/**
 * Creates a MetaMask Hybrid Smart Account for a given owner account
 * @param ownerAccount - The EOA account that will own the smart account
 * @returns MetaMask Smart Account instance
 */
export const createSmartAccount = async (
  ownerAccount: Account | `0x${string}`,
): Promise<MetaMaskSmartAccount<Implementation.Hybrid>> => {
  try {
    // Convert hex private key to account if needed
    const account =
      typeof ownerAccount === 'string'
        ? privateKeyToAccount(ownerAccount)
        : ownerAccount

    // Create Hybrid smart account using MetaMask Delegation Toolkit
    const smartAccount = await toMetaMaskSmartAccount({
      client: publicClient,
      implementation: Implementation.Hybrid,
      deployParams: [account.address, [], [], []], // owner, no passkeys initially
      deploySalt: '0x',
      signer: { account },
    })

    return smartAccount
  } catch (error) {
    console.error('Smart account creation failed:', error)
    throw error
  }
}

/**
 * Gets an existing MetaMask Smart Account for a given owner
 * @param ownerAccount - The EOA account that owns the smart account
 * @returns MetaMask Smart Account instance or null if not found
 */
export const getExistingSmartAccount = async (
  ownerAccount: Account | `0x${string}`,
): Promise<MetaMaskSmartAccount<Implementation.Hybrid> | null> => {
  try {
    const account =
      typeof ownerAccount === 'string'
        ? privateKeyToAccount(ownerAccount)
        : ownerAccount

    // Try to get existing smart account
    const smartAccount = await toMetaMaskSmartAccount({
      client: publicClient,
      implementation: Implementation.Hybrid,
      address: account.address,
      signer: { account },
    })

    return smartAccount
  } catch (error) {
    console.error('Failed to get existing smart account:', error)
    return null
  }
}
