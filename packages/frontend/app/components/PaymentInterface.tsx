'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useWriteHeekowavePaymentsRequestPayment,
  useReadHeekowavePaymentsGetPaymentRequest,
  useReadHeekowavePaymentsDelegationManager,
  useReadHeekowavePaymentsOwner,
  useReadHeekowavePaymentsRequestCounter,
  useReadHeekowavePaymentsUsdcToken,
} from '../hooks/contracts-generated'
import { MONAD_TESTNET_ADDRESSES } from '@heekowave/shared'
import { parseUnits } from 'viem'

export default function PaymentInterface() {
  const { address: userAddress, isConnected } = useAccount()

  // Request Payment State
  const [fromAddress, setFromAddress] = useState('')
  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [tokenAddress, setTokenAddress] = useState<string>(
    MONAD_TESTNET_ADDRESSES.MOCK_USDC,
  )

  // View Request State
  const [requestId, setRequestId] = useState('')

  // Hooks for write operations
  const { writeContract: writeRequestPayment, isPending: isRequestingPayment } =
    useWriteHeekowavePaymentsRequestPayment()

  // Hooks for read operations
  const { data: delegationManager } = useReadHeekowavePaymentsDelegationManager(
    {
      address: MONAD_TESTNET_ADDRESSES.HEKOWAVE_PAYMENTS as `0x${string}`,
    },
  )

  const { data: owner } = useReadHeekowavePaymentsOwner({
    address: MONAD_TESTNET_ADDRESSES.HEKOWAVE_PAYMENTS as `0x${string}`,
  })

  const { data: requestCounter } = useReadHeekowavePaymentsRequestCounter({
    address: MONAD_TESTNET_ADDRESSES.HEKOWAVE_PAYMENTS as `0x${string}`,
  })

  const { data: usdcToken } = useReadHeekowavePaymentsUsdcToken({
    address: MONAD_TESTNET_ADDRESSES.HEKOWAVE_PAYMENTS as `0x${string}`,
  })

  const { data: paymentRequest, refetch: refetchPaymentRequest } =
    useReadHeekowavePaymentsGetPaymentRequest({
      address: MONAD_TESTNET_ADDRESSES.HEKOWAVE_PAYMENTS as `0x${string}`,
      args: requestId ? [requestId as `0x${string}`] : undefined,
      query: { enabled: !!requestId },
    })

  const handleRequestPayment = async () => {
    if (!fromAddress || !toAddress || !amount) return

    // Validate addresses
    if (
      !fromAddress.startsWith('0x') ||
      !toAddress.startsWith('0x') ||
      !tokenAddress.startsWith('0x')
    ) {
      console.error('Invalid address format')
      return
    }

    try {
      const amountWei = parseUnits(amount, 6) // USDC has 6 decimals

      await writeRequestPayment({
        address: MONAD_TESTNET_ADDRESSES.HEKOWAVE_PAYMENTS as `0x${string}`,
        args: [
          fromAddress as `0x${string}`,
          toAddress as `0x${string}`,
          amountWei,
          tokenAddress as `0x${string}`,
        ],
      })
    } catch (error) {
      console.error('Error requesting payment:', error)
    }
  }

  const handleViewRequest = () => {
    if (requestId) {
      refetchPaymentRequest()
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Interface</CardTitle>
          <CardDescription>
            Connect your wallet to interact with payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please connect your wallet first
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Interface</CardTitle>
        <CardDescription>
          Request payments and view payment details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="request" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="request">Request Payment</TabsTrigger>
            <TabsTrigger value="view">View Request</TabsTrigger>
          </TabsList>

          <TabsContent value="request" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="from">From Address</Label>
                <Input
                  id="from"
                  placeholder="0x..."
                  value={fromAddress}
                  onChange={(e) => setFromAddress(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Address that will send the payment (usually your smart
                  account)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="to">To Address</Label>
                <Input
                  id="to"
                  placeholder="0x..."
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Address that will receive the payment
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USDC)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="token">Token Address</Label>
                <Input
                  id="token"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Default: Mock USDC address
                </p>
              </div>

              <Button
                onClick={handleRequestPayment}
                disabled={
                  isRequestingPayment || !fromAddress || !toAddress || !amount
                }
                className="w-full"
              >
                {isRequestingPayment ? 'Requesting...' : 'Request Payment'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="view" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="requestId">Request ID</Label>
                <Input
                  id="requestId"
                  placeholder="0x..."
                  value={requestId}
                  onChange={(e) => setRequestId(e.target.value)}
                />
              </div>

              <Button
                onClick={handleViewRequest}
                disabled={!requestId}
                className="w-full"
              >
                View Request
              </Button>

              {paymentRequest && (
                <div className="space-y-2">
                  <Badge variant="default">Payment Request Details</Badge>
                  <div className="bg-muted p-3 rounded-md space-y-2">
                    <div>
                      <span className="text-sm font-semibold">From: </span>
                      <code className="text-xs font-mono">
                        {paymentRequest.from}
                      </code>
                    </div>
                    <div>
                      <span className="text-sm font-semibold">To: </span>
                      <code className="text-xs font-mono">
                        {paymentRequest.to}
                      </code>
                    </div>
                    <div>
                      <span className="text-sm font-semibold">Amount: </span>
                      <span className="text-sm">
                        {(Number(paymentRequest.amount) / 1e6).toFixed(6)} USDC
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold">Token: </span>
                      <code className="text-xs font-mono">
                        {paymentRequest.token}
                      </code>
                    </div>
                    <div>
                      <span className="text-sm font-semibold">Fulfilled: </span>
                      <Badge
                        variant={
                          paymentRequest.fulfilled ? 'default' : 'secondary'
                        }
                      >
                        {paymentRequest.fulfilled ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm font-semibold">
                        Created At:{' '}
                      </span>
                      <span className="text-sm">
                        {new Date(
                          Number(paymentRequest.createdAt) * 1000,
                        ).toLocaleString()}
                      </span>
                    </div>
                    {paymentRequest.fulfilledAt !== BigInt(0) && (
                      <div>
                        <span className="text-sm font-semibold">
                          Fulfilled At:{' '}
                        </span>
                        <span className="text-sm">
                          {new Date(
                            Number(paymentRequest.fulfilledAt) * 1000,
                          ).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

        {/* Contract Info */}
        <div className="space-y-4">
          <Badge variant="outline">Contract Information</Badge>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-semibold">Delegation Manager:</p>
                <code className="text-xs font-mono break-all">
                  {delegationManager}
                </code>
              </div>

              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-semibold">Owner:</p>
                <code className="text-xs font-mono break-all">{owner}</code>
              </div>
            </div>

            <div className="space-y-2">
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-semibold">Request Counter:</p>
                <span className="text-sm">
                  {requestCounter?.toString() || '0'}
                </span>
              </div>

              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-semibold">USDC Token:</p>
                <code className="text-xs font-mono break-all">{usdcToken}</code>
              </div>
            </div>
          </div>
        </div>

        {/* Backend Actions Info */}
        <div className="bg-muted/50 p-3 rounded-md mt-4">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> The <code>sendPayment</code> and{' '}
            <code>fulfillRequest</code> functions are executed by the
            relayer/backend using delegations, not directly by users. The
            relayer redeems delegations through the DelegationManager to execute
            these functions.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
