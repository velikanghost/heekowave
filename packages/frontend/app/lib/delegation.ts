import {
  createDelegation as createMetaMaskDelegation,
  type Delegation,
} from '@metamask/delegation-toolkit'
import { type MetaMaskSmartAccount } from '@metamask/delegation-toolkit'
import { DelegationInfo } from '@heekowave/shared'
import { isAddress } from 'viem'

/**
 * Validates if a string is a valid Ethereum address
 * @param address - The address string to validate
 * @returns True if valid, false otherwise
 */
const isValidAddress = (address: string): address is `0x${string}` => {
  return isAddress(address)
}

// Type for delegation scope configuration
type DelegationScope =
  | {
      type: 'erc20TransferAmount'
      tokenAddress: `0x${string}`
      maxAmount: bigint
    }
  | {
      type: 'nativeTokenTransferAmount'
      maxAmount: bigint
    }
  | {
      type: 'functionCall'
      targets: `0x${string}`[]
      selectors: string[]
    }

/**
 * Creates a delegation from a delegator smart account to a delegate
 * @param delegatorSmartAccount - The MetaMask smart account that is delegating
 * @param delegateAddress - The address receiving the delegation
 * @param scope - The delegation scope configuration
 * @returns Delegation info with signature
 */
export const createDelegation = async (
  delegatorSmartAccount: MetaMaskSmartAccount<any>,
  delegateAddress: `0x${string}`,
  scope: DelegationScope,
): Promise<DelegationInfo & { delegation: Delegation }> => {
  try {
    // Get the environment for the chain
    const environment = delegatorSmartAccount.environment

    console.log('Creating delegation with:', {
      to: delegateAddress,
      from: delegatorSmartAccount.address,
      environment,
      scope,
    })

    // Create delegation with specified scope
    const delegation = createMetaMaskDelegation({
      to: delegateAddress,
      from: delegatorSmartAccount.address,
      environment,
      scope,
    })

    console.log('Delegation created successfully:', delegation)

    // Sign the delegation
    const signature = await delegatorSmartAccount.signDelegation({
      delegation,
    })

    const signedDelegation = {
      ...delegation,
      signature,
    }

    return {
      delegator: delegatorSmartAccount.address,
      delegate: delegateAddress,
      caveatHash: '0x', // Will be computed by the delegation manager
      isValid: true,
      delegation: signedDelegation,
    }
  } catch (error) {
    console.error('Delegation creation failed:', error)
    throw error // Re-throw to get better error handling in the UI
  }
}

/**
 * Creates a delegation for ERC-20 token transfers with a maximum amount
 * @param delegatorSmartAccount - The MetaMask smart account delegating
 * @param delegateAddress - The address receiving the delegation
 * @param tokenAddress - The ERC-20 token contract address
 * @param maxAmount - Maximum amount that can be transferred
 * @returns Delegation info
 */
export const createERC20TransferDelegation = async (
  delegatorSmartAccount: MetaMaskSmartAccount<any>,
  delegateAddress: `0x${string}`,
  tokenAddress: `0x${string}`,
  maxAmount: bigint,
): Promise<DelegationInfo & { delegation: Delegation }> => {
  try {
    // Debug logging
    console.log('Creating ERC20 delegation with:', {
      delegator: delegatorSmartAccount.address,
      delegate: delegateAddress,
      tokenAddress,
      maxAmount: maxAmount.toString(),
      environment: delegatorSmartAccount.environment,
    })

    // Validate token address format
    if (!isValidAddress(tokenAddress)) {
      throw new Error(`Invalid token address format: ${tokenAddress}`)
    }

    // Validate delegate address format
    if (!isValidAddress(delegateAddress)) {
      throw new Error(`Invalid delegate address format: ${delegateAddress}`)
    }

    return createDelegation(delegatorSmartAccount, delegateAddress, {
      type: 'erc20TransferAmount',
      tokenAddress,
      maxAmount,
    })
  } catch (error) {
    console.error('ERC20 delegation creation failed:', error)
    throw error
  }
}

/**
 * Creates a delegation for native token transfers with a maximum amount
 * @param delegatorSmartAccount - The MetaMask smart account delegating
 * @param delegateAddress - The address receiving the delegation
 * @param maxAmount - Maximum amount of native tokens that can be transferred
 * @returns Delegation info
 */
export const createNativeTokenDelegation = async (
  delegatorSmartAccount: MetaMaskSmartAccount<any>,
  delegateAddress: `0x${string}`,
  maxAmount: bigint,
): Promise<DelegationInfo & { delegation: Delegation }> => {
  return createDelegation(delegatorSmartAccount, delegateAddress, {
    type: 'nativeTokenTransferAmount',
    maxAmount,
  })
}
