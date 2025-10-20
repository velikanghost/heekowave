import {
  createDelegation as createMetaMaskDelegation,
  type Delegation,
  type Caveat,
} from '@metamask/delegation-toolkit'
import { type MetaMaskSmartAccount } from '@metamask/delegation-toolkit'
import { DelegationInfo } from '@heekowave/shared'
import {
  normalizeAddress,
  validateTokenAddress,
  validateDelegateAddress,
} from './addressUtils'
import {
  encodeERC20TransferAmountTerms,
  encodeNativeTokenTransferAmountTerms,
} from './caveatEnforcers'
import { encodeAbiParameters, parseAbiParameters } from 'viem'

// Type for delegation scope configuration (for internal use)
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
    // Validate and normalize addresses
    const normalizedDelegateAddress = validateDelegateAddress(delegateAddress)
    const normalizedDelegatorAddress = normalizeAddress(
      delegatorSmartAccount.address,
    )

    // Get the environment for the chain
    const environment = delegatorSmartAccount.environment

    console.log('Creating delegation with:', {
      to: normalizedDelegateAddress,
      from: normalizedDelegatorAddress,
      environment,
      scope,
    })

    // Build caveats array based on scope type
    let caveats: Caveat[] = []

    if (scope.type === 'erc20TransferAmount') {
      const normalizedTokenAddress = validateTokenAddress(scope.tokenAddress)

      console.log('Token address validation:', {
        originalTokenAddress: scope.tokenAddress,
        normalizedTokenAddress,
        isValidAddress: !!normalizedTokenAddress,
        addressLength: normalizedTokenAddress.length,
        startsWith0x: normalizedTokenAddress.startsWith('0x'),
        isHex: /^0x[a-fA-F0-9]+$/.test(normalizedTokenAddress),
      })

      // Get the ERC20TransferAmountEnforcer address from environment
      const enforcerAddress = environment.caveatEnforcers?.ERC20TransferAmount

      if (!enforcerAddress) {
        throw new Error(
          'ERC20TransferAmount caveat enforcer not found in environment configuration',
        )
      }

      console.log('Using ERC20TransferAmountEnforcer at:', enforcerAddress)

      // Encode terms: 20 bytes token address + 32 bytes max amount (52 bytes total)
      const terms = encodeERC20TransferAmountTerms(
        normalizedTokenAddress,
        scope.maxAmount,
      )

      console.log('Encoded caveat terms:', {
        tokenAddress: normalizedTokenAddress,
        maxAmount: scope.maxAmount.toString(),
        termsLength: terms.length,
        terms,
      })

      caveats = [
        {
          enforcer: enforcerAddress,
          terms: terms as `0x${string}`,
          args: '0x' as `0x${string}`,
        },
      ]
    } else if (scope.type === 'nativeTokenTransferAmount') {
      const enforcerAddress =
        environment.caveatEnforcers?.NativeTokenTransferAmount

      if (!enforcerAddress) {
        throw new Error(
          'NativeTokenTransferAmount caveat enforcer not found in environment configuration',
        )
      }

      // Encode terms: 32 bytes max amount
      const terms = encodeNativeTokenTransferAmountTerms(scope.maxAmount)

      caveats = [
        {
          enforcer: enforcerAddress,
          terms: terms as `0x${string}`,
          args: '0x' as `0x${string}`,
        },
      ]
    } else if (scope.type === 'functionCall') {
      // For function call restrictions, we'd need AllowedTargetsEnforcer and AllowedMethodsEnforcer
      throw new Error('Function call scope not yet implemented')
    }

    console.log('Final delegation parameters:', {
      to: normalizedDelegateAddress,
      from: normalizedDelegatorAddress,
      environment: environment,
      caveats,
    })

    // Create delegation with caveats
    // The MetaMask SDK may handle the actual structure creation differently
    let delegation: Delegation
    try {
      // Try using the SDK's helper if available, otherwise construct manually
      delegation = createMetaMaskDelegation({
        to: normalizedDelegateAddress,
        from: normalizedDelegatorAddress,
        caveats,
      } as any)
    } catch (delegationError) {
      // Fallback: construct delegation manually according to the struct
      console.log('SDK helper failed, constructing delegation manually')
      delegation = {
        delegate: normalizedDelegateAddress,
        delegator: normalizedDelegatorAddress,
        authority:
          '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
        caveats,
        salt: `0x${Date.now().toString(16)}` as `0x${string}`,
        signature: '0x' as `0x${string}`,
      }
    }

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
      delegator: normalizedDelegatorAddress,
      delegate: normalizedDelegateAddress,
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

    // Validate addresses using our utility functions
    const validatedDelegateAddress = validateDelegateAddress(delegateAddress)
    const validatedTokenAddress = validateTokenAddress(tokenAddress)

    console.log('Address validation results:', {
      originalDelegate: delegateAddress,
      validatedDelegate: validatedDelegateAddress,
      originalToken: tokenAddress,
      validatedToken: validatedTokenAddress,
    })

    return createDelegation(delegatorSmartAccount, validatedDelegateAddress, {
      type: 'erc20TransferAmount',
      tokenAddress: validatedTokenAddress,
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
