import {
  toMetaMaskSmartAccount,
  Implementation,
  type MetaMaskSmartAccount,
} from '@metamask/delegation-toolkit'
import { createPublicClient, http, type WalletClient } from 'viem'
import { monadTestnet } from 'viem/chains'

const MONAD_RPC_URL = process.env.NEXT_PUBLIC_MONAD_RPC_URL as string

export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(MONAD_RPC_URL),
})

/**
 * Creates a MetaMask Hybrid Smart Account using a Wallet Client signer
 * This is the correct approach for Web3Auth integration
 * @param walletClient - The wallet client from Web3Auth or other wallet providers
 * @returns MetaMask Smart Account instance
 */
export const createSmartAccount = async (
  walletClient: WalletClient,
): Promise<MetaMaskSmartAccount<Implementation.Hybrid>> => {
  try {
    // Get the first address from the wallet client
    const addresses = await walletClient.getAddresses()
    const owner = addresses[0]

    if (!owner) {
      throw new Error('No addresses found in wallet client')
    }

    // Create Hybrid smart account using MetaMask Delegation Toolkit
    // Using walletClient as signer with correct format
    const smartAccount = await toMetaMaskSmartAccount({
      client: publicClient,
      implementation: Implementation.Hybrid,
      deployParams: [owner, [], [], []], // owner, no passkeys initially
      deploySalt: '0x',
      signer: { walletClient } as any, // Type assertion to handle Web3Auth wallet client compatibility
    })

    return smartAccount
  } catch (error) {
    console.error('Smart account creation failed:', error)
    throw error
  }
}

/**
 * Gets an existing MetaMask Smart Account using a Wallet Client signer
 * @param walletClient - The wallet client from Web3Auth or other wallet providers
 * @returns MetaMask Smart Account instance or null if not found
 */
export const getExistingSmartAccount = async (
  walletClient: WalletClient,
): Promise<MetaMaskSmartAccount<Implementation.Hybrid> | null> => {
  try {
    // Get the first address from the wallet client
    const addresses = await walletClient.getAddresses()
    const owner = addresses[0]

    if (!owner) {
      return null
    }

    // Try to get existing smart account
    // Using walletClient as signer with correct format
    const smartAccount = await toMetaMaskSmartAccount({
      client: publicClient,
      implementation: Implementation.Hybrid,
      address: owner, // Use the owner address as the smart account address
      signer: { walletClient } as any, // Type assertion to handle Web3Auth wallet client compatibility
    })

    return smartAccount
  } catch (error) {
    console.error('Failed to get existing smart account:', error)
    return null
  }
}
