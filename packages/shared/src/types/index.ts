// Contract interaction types
export interface PaymentRequest {
  from: string
  to: string
  amount: string
  token: string
  fulfilled: boolean
  createdAt: number
  fulfilledAt: number
}

export interface WithdrawalRequest {
  user: string
  amount: string
  currency: string
  bankDetails: string
  processed: boolean
  success: boolean
  message: string
  createdAt: number
  processedAt: number
}

export interface DelegationInfo {
  delegator: string
  delegate: string
  caveatHash: string
  isValid: boolean
}

export interface MetaMaskSmartAccount {
  address: string
  owner: string
  isDeployed: boolean
}

// Transaction types
export interface Transaction {
  hash: string
  from: string
  to: string
  amount: string
  token: string
  timestamp: number
  type: 'sent' | 'received' | 'withdrawal' | 'request'
  status: 'pending' | 'confirmed' | 'failed'
}

// API request/response types
export interface SendPaymentRequest {
  to: string
  amount: string
  token: string
  useGasless?: boolean
}

export interface SendPaymentResponse {
  success: boolean
  txHash?: string
  error?: string
}

export interface RequestPaymentRequest {
  from: string
  to: string
  amount: string
  token: string
}

export interface RequestPaymentResponse {
  success: boolean
  requestId?: string
  error?: string
}

export interface WithdrawalRequestData {
  amount: string
  currency: string
  bankDetails: string
}

export interface WithdrawalResponse {
  success: boolean
  requestId?: string
  error?: string
}

// Envio GraphQL types
export interface PaymentSentEvent {
  id: string
  from: string
  to: string
  amount: string
  token: string
  timestamp: number
  txHash: string
}

export interface PaymentRequestedEvent {
  id: string
  from: string
  to: string
  amount: string
  token: string
  requestId: string
  timestamp: number
}

export interface RequestFulfilledEvent {
  id: string
  requestId: string
  fulfiller: string
  timestamp: number
}

export interface WithdrawalRequestedEvent {
  id: string
  user: string
  amount: string
  currency: string
  bankDetails: string
  requestId: string
  timestamp: number
}

export interface WithdrawalCompletedEvent {
  id: string
  requestId: string
  success: boolean
  message: string
  timestamp: number
}

export interface DelegationExecutedEvent {
  id: string
  delegator: string
  delegate: string
  caveatHash: string
  timestamp: number
}

// GraphQL subscription types
export interface ActivityEvent {
  __typename: string
  id: string
  timestamp: number
}

export type AllActivityEvents =
  | PaymentSentEvent
  | PaymentRequestedEvent
  | RequestFulfilledEvent
  | WithdrawalRequestedEvent
  | WithdrawalCompletedEvent
  | DelegationExecutedEvent

// User types
export interface User {
  address: string
  smartAccount?: MetaMaskSmartAccount
  balance: string
  currency: string
}

export interface WalletInfo {
  address: string
  balance: string
  network: string
  isConnected: boolean
}

// Delegation types
export interface DelegationInfo {
  delegator: string
  delegate: string
  caveatHash: string
  isValid: boolean
}

// Notification types
export interface NotificationData {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
}

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}
