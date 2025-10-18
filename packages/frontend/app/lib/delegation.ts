import {
  createDelegation as createMetaMaskDelegation,
  type Delegation,
} from '@metamask/delegation-toolkit'
import { type MetaMaskSmartAccount } from '@metamask/delegation-toolkit'
import { DelegationInfo } from '@heekowave/shared'

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

    // Create delegation with specified scope
    const delegation = createMetaMaskDelegation({
      to: delegateAddress,
      from: delegatorSmartAccount.address,
      environment,
      scope,
    })

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
    return {
      delegator: delegatorSmartAccount.address,
      delegate: delegateAddress,
      caveatHash: '0x',
      isValid: false,
      delegation: {} as Delegation,
    }
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
  return createDelegation(delegatorSmartAccount, delegateAddress, {
    type: 'erc20TransferAmount',
    tokenAddress,
    maxAmount,
  })
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
