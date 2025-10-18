import { formatUnits, parseUnits } from 'viem'

// Address validation
export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export const shortenAddress = (address: string, chars = 4): string => {
  if (!isValidAddress(address)) return address
  return `${address.slice(0, 2 + chars)}...${address.slice(-chars)}`
}

// Amount formatting
export const formatAmount = (
  amount: string | bigint,
  decimals: number = 6,
  displayDecimals: number = 2,
): string => {
  try {
    const formatted = formatUnits(BigInt(amount), decimals)
    const num = parseFloat(formatted)
    return num.toFixed(displayDecimals)
  } catch {
    return '0.00'
  }
}

export const parseAmount = (amount: string, decimals: number = 6): bigint => {
  try {
    return parseUnits(amount, decimals)
  } catch {
    return 0n
  }
}

// Date formatting
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString()
}

export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleTimeString()
}

export const formatDateTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleString()
}

export const getRelativeTime = (timestamp: number): string => {
  const now = Date.now() / 1000
  const diff = now - timestamp

  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`

  return formatDate(timestamp)
}

// Currency formatting
export const formatCurrency = (
  amount: string | number,
  currency: string = 'USD',
  locale: string = 'en-US',
): string => {
  try {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  } catch {
    return `${amount} ${currency}`
  }
}

// Transaction type helpers
export const getTransactionTypeLabel = (type: string): string => {
  switch (type) {
    case 'sent':
      return 'Sent'
    case 'received':
      return 'Received'
    case 'withdrawal':
      return 'Withdrawal'
    case 'request':
      return 'Request'
    default:
      return 'Transaction'
  }
}

export const getTransactionTypeColor = (type: string): string => {
  switch (type) {
    case 'sent':
      return 'text-red-600'
    case 'received':
      return 'text-green-600'
    case 'withdrawal':
      return 'text-blue-600'
    case 'request':
      return 'text-yellow-600'
    default:
      return 'text-gray-600'
  }
}

// Error handling
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error
  if (error?.message) return error.message
  if (error?.error?.message) return error.error.message
  return 'An unexpected error occurred'
}

// Network helpers
export const getNetworkName = (chainId: number): string => {
  switch (chainId) {
    case 10143:
      return 'Monad Testnet'
    default:
      return `Chain ${chainId}`
  }
}

// Local storage helpers
export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export const setStorageItem = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore storage errors
  }
}

export const removeStorageItem = (key: string): void => {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(key)
  } catch {
    // Ignore storage errors
  }
}

// URL helpers
export const generateRequestLink = (
  requestId: string,
  baseUrl: string,
): string => {
  return `${baseUrl}/request/${requestId}`
}

// Validation helpers
export const validateAmount = (
  amount: string,
  maxDecimals: number = 6,
): boolean => {
  const regex = new RegExp(`^\\d+(\\.\\d{1,${maxDecimals}})?$`)
  return regex.test(amount) && parseFloat(amount) > 0
}

export const validateBankDetails = (details: string): boolean => {
  // Basic validation - in production, this would be more sophisticated
  return details.length >= 10 && /^[a-zA-Z0-9\s-]+$/.test(details)
}

// Constants
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
]

export const DEFAULT_DECIMALS = 6 // USDC decimals
export const MIN_AMOUNT = '0.01'
export const MAX_AMOUNT = '1000000'
