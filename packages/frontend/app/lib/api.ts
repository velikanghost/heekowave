import {
  SendPaymentRequest,
  SendPaymentResponse,
  RequestPaymentRequest,
  RequestPaymentResponse,
  WithdrawalRequestData,
  WithdrawalResponse,
} from '@heekowave/shared'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export const apiClient = {
  async sendPayment(data: SendPaymentRequest): Promise<SendPaymentResponse> {
    const response = await fetch(`${API_BASE_URL}/api/relayer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  async requestPayment(
    data: RequestPaymentRequest,
  ): Promise<RequestPaymentResponse> {
    const response = await fetch(`${API_BASE_URL}/api/payments/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  async requestWithdrawal(
    data: WithdrawalRequestData & { signature: string; userAddress: string },
  ): Promise<WithdrawalResponse> {
    const response = await fetch(`${API_BASE_URL}/api/withdrawal/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  async subscribeToNotifications(
    subscription: PushSubscription,
  ): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE_URL}/api/notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription }),
    })
    return response.json()
  },
}
