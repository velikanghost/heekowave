/**
 * Address validation and normalization utilities for MetaMask Delegation Framework
 * Ensures addresses are in the correct format expected by the toolkit
 */

import { isAddress, getAddress } from 'viem'

/**
 * Normalize an address to proper checksum format
 * @param address - The address to normalize
 * @returns Normalized address in checksum format
 */
export const normalizeAddress = (address: string): `0x${string}` => {
  if (!isAddress(address)) {
    throw new Error(`Invalid address format: ${address}`)
  }
  return getAddress(address) as `0x${string}` // This ensures proper checksum
}

/**
 * Validate and normalize a token address
 * @param address - The token address to validate
 * @returns Normalized token address
 */
export const validateTokenAddress = (address: string): `0x${string}` => {
  const normalized = normalizeAddress(address)

  // Additional validation for token contracts if needed
  if (normalized === '0x0000000000000000000000000000000000000000') {
    throw new Error('Token address cannot be zero address')
  }

  return normalized
}

/**
 * Validate delegate address format
 * @param address - The delegate address to validate
 * @returns Normalized delegate address
 */
export const validateDelegateAddress = (address: string): `0x${string}` => {
  const normalized = normalizeAddress(address)

  if (normalized === '0x0000000000000000000000000000000000000000') {
    throw new Error('Delegate address cannot be zero address')
  }

  return normalized
}

/**
 * Check if an address is valid without throwing
 * @param address - The address to check
 * @returns True if valid, false otherwise
 */
export const isValidAddress = (address: string): boolean => {
  try {
    return isAddress(address)
  } catch {
    return false
  }
}
