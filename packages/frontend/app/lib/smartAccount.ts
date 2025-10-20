import {
  toMetaMaskSmartAccount,
  Implementation,
  type MetaMaskSmartAccount,
} from '@metamask/delegation-toolkit'
import { createPublicClient, http, type WalletClient } from 'viem'
import { createBundlerClient } from 'viem/account-abstraction'
import { monadTestnet } from 'viem/chains'
import { monadTestnetEnvironment, validateEnvironment } from './environment'

// Validate environment variables on import
validateEnvironment()

export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(monadTestnetEnvironment.rpcUrl),
})

export const bundlerClient = createBundlerClient({
  client: publicClient,
  transport: http(monadTestnetEnvironment.bundlerUrl),
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
    // Using walletClient as signer with proper environment configuration
    const smartAccount = await toMetaMaskSmartAccount({
      client: publicClient,
      implementation: Implementation.Hybrid,
      deployParams: [owner, [], [], []], // owner, no passkeys initially
      deploySalt: '0x',
      signer: { walletClient } as any, // Type assertion to handle Web3Auth wallet client compatibility
      environment: monadTestnetEnvironment, // Proper environment configuration
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
    // Using walletClient as signer with proper environment configuration
    const smartAccount = await toMetaMaskSmartAccount({
      client: publicClient,
      implementation: Implementation.Hybrid,
      address: owner, // Use the owner address as the smart account address
      signer: { walletClient } as any, // Type assertion to handle Web3Auth wallet client compatibility
      environment: monadTestnetEnvironment, // Proper environment configuration
    })

    return smartAccount
  } catch (error) {
    console.error('Failed to get existing smart account:', error)
    return null
  }
}
