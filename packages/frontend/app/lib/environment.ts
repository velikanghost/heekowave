/**
 * Environment configuration for MetaMask Delegation Framework on Monad Testnet
 * This is crucial for proper delegation creation and validation
 */

export const monadTestnetEnvironment = {
  chainId: 10143, // Monad Testnet chain ID
  DelegationManager:
    '0xdb9B1e94B5b69Df7e401DDbedE43491141047dB3' as `0x${string}`,
  EntryPoint: '0x0000000071727De22E5E9d8BAf0edAc6f37da032' as `0x${string}`,
  SimpleFactory: '0x69aa2f9fe1572f1b640e1bbc512f5c3a734fc77c' as `0x${string}`, // Will be set when we have the factory address
  implementations: {
    Hybrid: '0x48dBe696A4D990079e039489bA2053B36E8FFEC4' as `0x${string}`, // Will be set when we have the implementation address
    HybridDeleGatorImpl:
      '0x48dBe696A4D990079e039489bA2053B36E8FFEC4' as `0x${string}`, // Add the missing field
  },
  caveatEnforcers: {
    ERC20TransferAmount:
      '0xf100b0819427117EcF76Ed94B358B1A5b5C6D2Fc' as `0x${string}`,
    NativeTokenTransferAmount:
      '0x0000000000000000000000000000000000000000' as `0x${string}`, // Update with actual deployed address if needed
  },
  // Additional fields for compatibility
  rpcUrl: process.env.NEXT_PUBLIC_MONAD_RPC_URL as string,
  bundlerUrl: `https://monad-testnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  domain: {
    name: 'MetaMask Delegation',
    version: '1',
    chainId: 10143,
    verifyingContract: '0xdb9B1e94B5b69Df7e401DDbedE43491141047dB3',
  },
}

/**
 * Validate that all required environment variables are set
 */
export const validateEnvironment = () => {
  const required = ['NEXT_PUBLIC_MONAD_RPC_URL', 'NEXT_PUBLIC_ALCHEMY_API_KEY']
  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing)
    return false
  }

  return true
}
