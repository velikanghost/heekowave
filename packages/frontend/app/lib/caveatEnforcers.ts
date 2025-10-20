/**
 * Caveat enforcer utilities for MetaMask Delegation Framework
 * Encodes terms according to the caveat enforcer specifications
 */

import { encodeAbiParameters, parseAbiParameters, pad, toHex } from 'viem'

/**
 * Encode terms for ERC20TransferAmountEnforcer
 * According to the enforcer contract, terms must be exactly 52 bytes:
 * - 20 bytes: ERC20 token address
 * - 32 bytes: Maximum amount (uint256)
 *
 * @param tokenAddress - The ERC20 token contract address
 * @param maxAmount - Maximum amount that can be transferred
 * @returns Encoded terms as hex string (52 bytes)
 */
export const encodeERC20TransferAmountTerms = (
  tokenAddress: `0x${string}`,
  maxAmount: bigint,
): string => {
  // Validate inputs
  if (!tokenAddress || tokenAddress.length !== 42) {
    throw new Error('Invalid token address format')
  }

  if (maxAmount < BigInt(0)) {
    throw new Error('Max amount must be positive')
  }

  // Remove '0x' prefix from token address for concatenation
  const addressBytes = tokenAddress.slice(2).toLowerCase()

  // Convert maxAmount to 32-byte hex string (64 hex chars)
  const amountHex = maxAmount.toString(16).padStart(64, '0')

  // Concatenate: 20 bytes address + 32 bytes amount = 52 bytes
  const terms = `0x${addressBytes}${amountHex}`

  // Verify length: 2 chars for '0x' + 40 chars (20 bytes) + 64 chars (32 bytes) = 106 chars total
  if (terms.length !== 106) {
    throw new Error(
      `Invalid terms length: expected 106 characters, got ${terms.length}`,
    )
  }

  console.log('Encoded ERC20TransferAmount terms:', {
    tokenAddress,
    maxAmount: maxAmount.toString(),
    addressBytes: `0x${addressBytes}`,
    amountHex: `0x${amountHex}`,
    finalTerms: terms,
    termsLength: terms.length,
    bytesLength: (terms.length - 2) / 2,
  })

  return terms
}

/**
 * Encode terms for NativeTokenTransferAmountEnforcer
 * According to the enforcer contract, terms must be 32 bytes (uint256)
 *
 * @param maxAmount - Maximum amount of native tokens that can be transferred
 * @returns Encoded terms as hex string (32 bytes)
 */
export const encodeNativeTokenTransferAmountTerms = (
  maxAmount: bigint,
): string => {
  if (maxAmount < BigInt(0)) {
    throw new Error('Max amount must be positive')
  }

  // Convert to 32-byte hex string
  const amountHex = maxAmount.toString(16).padStart(64, '0')
  const terms = `0x${amountHex}`

  // Verify length: 2 chars for '0x' + 64 chars (32 bytes) = 66 chars total
  if (terms.length !== 66) {
    throw new Error(
      `Invalid terms length: expected 66 characters, got ${terms.length}`,
    )
  }

  console.log('Encoded NativeTokenTransferAmount terms:', {
    maxAmount: maxAmount.toString(),
    terms,
    termsLength: terms.length,
    bytesLength: (terms.length - 2) / 2,
  })

  return terms
}

/**
 * Decode ERC20TransferAmount terms for inspection
 * @param terms - Encoded terms hex string
 * @returns Decoded token address and max amount
 */
export const decodeERC20TransferAmountTerms = (
  terms: string,
): { tokenAddress: `0x${string}`; maxAmount: bigint } => {
  if (terms.length !== 106) {
    throw new Error('Invalid terms length for ERC20TransferAmount')
  }

  // Extract token address (20 bytes = 40 hex chars after '0x')
  const tokenAddress = `0x${terms.slice(2, 42)}` as `0x${string}`

  // Extract max amount (32 bytes = 64 hex chars)
  const amountHex = terms.slice(42)
  const maxAmount = BigInt(`0x${amountHex}`)

  return { tokenAddress, maxAmount }
}

/**
 * Decode NativeTokenTransferAmount terms for inspection
 * @param terms - Encoded terms hex string
 * @returns Decoded max amount
 */
export const decodeNativeTokenTransferAmountTerms = (
  terms: string,
): { maxAmount: bigint } => {
  if (terms.length !== 66) {
    throw new Error('Invalid terms length for NativeTokenTransferAmount')
  }

  const maxAmount = BigInt(terms)
  return { maxAmount }
}
