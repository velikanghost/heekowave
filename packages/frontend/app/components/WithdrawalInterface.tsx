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
  useWriteHeekowaveWithdrawalRequestWithdrawal,
  useReadHeekowaveWithdrawalGetWithdrawalRequest,
  useReadHeekowaveWithdrawalOwner,
  useReadHeekowaveWithdrawalProcessor,
  useReadHeekowaveWithdrawalRequestCounter,
  useReadHeekowaveWithdrawalUsdcToken,
  useReadHeekowaveWithdrawalGetContractBalance,
} from '../hooks/contracts-generated'
import { MONAD_TESTNET_ADDRESSES } from '@heekowave/shared'
import { parseUnits } from 'viem'

export default function WithdrawalInterface() {
  const { address: userAddress, isConnected } = useAccount()

  // Request Withdrawal State
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [bankDetails, setBankDetails] = useState('')

  // View Request State
  const [requestId, setRequestId] = useState('')

  // Hooks for write operations
  const {
    writeContract: writeRequestWithdrawal,
    isPending: isRequestingWithdrawal,
  } = useWriteHeekowaveWithdrawalRequestWithdrawal()

  // Hooks for read operations
  const { data: owner } = useReadHeekowaveWithdrawalOwner({
    address: MONAD_TESTNET_ADDRESSES.HEKOWAVE_WITHDRAWAL as `0x${string}`,
  })

  const { data: processor } = useReadHeekowaveWithdrawalProcessor({
    address: MONAD_TESTNET_ADDRESSES.HEKOWAVE_WITHDRAWAL as `0x${string}`,
  })

  const { data: requestCounter } = useReadHeekowaveWithdrawalRequestCounter({
    address: MONAD_TESTNET_ADDRESSES.HEKOWAVE_WITHDRAWAL as `0x${string}`,
  })

  const { data: usdcToken } = useReadHeekowaveWithdrawalUsdcToken({
    address: MONAD_TESTNET_ADDRESSES.HEKOWAVE_WITHDRAWAL as `0x${string}`,
  })

  const { data: contractBalance } =
    useReadHeekowaveWithdrawalGetContractBalance({
      address: MONAD_TESTNET_ADDRESSES.HEKOWAVE_WITHDRAWAL as `0x${string}`,
    })

  const { data: withdrawalRequest, refetch: refetchWithdrawalRequest } =
    useReadHeekowaveWithdrawalGetWithdrawalRequest({
      address: MONAD_TESTNET_ADDRESSES.HEKOWAVE_WITHDRAWAL as `0x${string}`,
      args: requestId ? [requestId as `0x${string}`] : undefined,
      query: { enabled: !!requestId },
    })

  const handleRequestWithdrawal = async () => {
    if (!amount || !currency || !bankDetails) return

    try {
      const amountWei = parseUnits(amount, 6) // USDC has 6 decimals

      await writeRequestWithdrawal({
        address: MONAD_TESTNET_ADDRESSES.HEKOWAVE_WITHDRAWAL as `0x${string}`,
        args: [amountWei, currency, bankDetails],
      })
    } catch (error) {
      console.error('Error requesting withdrawal:', error)
    }
  }

  const handleViewRequest = () => {
    if (requestId) {
      refetchWithdrawalRequest()
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Interface</CardTitle>
          <CardDescription>
            Connect your wallet to request withdrawals
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
        <CardTitle>Withdrawal Interface</CardTitle>
        <CardDescription>
          Request withdrawals and view withdrawal details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="request" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="request">Request Withdrawal</TabsTrigger>
            <TabsTrigger value="view">View Request</TabsTrigger>
          </TabsList>

          <TabsContent value="request" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USDC)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Amount to withdraw from your USDC balance
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  placeholder="USD"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Target currency for the withdrawal
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankDetails">Bank Details</Label>
                <Input
                  id="bankDetails"
                  placeholder="Account number, routing number, etc."
                  value={bankDetails}
                  onChange={(e) => setBankDetails(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Bank account information for the withdrawal
                </p>
              </div>

              <Button
                onClick={handleRequestWithdrawal}
                disabled={
                  isRequestingWithdrawal || !amount || !currency || !bankDetails
                }
                className="w-full"
              >
                {isRequestingWithdrawal
                  ? 'Requesting...'
                  : 'Request Withdrawal'}
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

              {withdrawalRequest && (
                <div className="space-y-2">
                  <Badge variant="default">Withdrawal Request Details</Badge>
                  <div className="bg-muted p-3 rounded-md space-y-2">
                    <div>
                      <span className="text-sm font-semibold">User: </span>
                      <code className="text-xs font-mono">
                        {withdrawalRequest.user}
                      </code>
                    </div>
                    <div>
                      <span className="text-sm font-semibold">Amount: </span>
                      <span className="text-sm">
                        {(Number(withdrawalRequest.amount) / 1e6).toFixed(6)}{' '}
                        USDC
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold">Currency: </span>
                      <span className="text-sm">
                        {withdrawalRequest.currency}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold">
                        Bank Details:{' '}
                      </span>
                      <span className="text-sm">
                        {withdrawalRequest.bankDetails}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold">Processed: </span>
                      <Badge
                        variant={
                          withdrawalRequest.processed ? 'default' : 'secondary'
                        }
                      >
                        {withdrawalRequest.processed ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm font-semibold">Success: </span>
                      <Badge
                        variant={
                          withdrawalRequest.success ? 'default' : 'destructive'
                        }
                      >
                        {withdrawalRequest.success ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    {withdrawalRequest.message && (
                      <div>
                        <span className="text-sm font-semibold">Message: </span>
                        <span className="text-sm">
                          {withdrawalRequest.message}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-semibold">
                        Created At:{' '}
                      </span>
                      <span className="text-sm">
                        {new Date(
                          Number(withdrawalRequest.createdAt) * 1000,
                        ).toLocaleString()}
                      </span>
                    </div>
                    {withdrawalRequest.processedAt !== BigInt(0) && (
                      <div>
                        <span className="text-sm font-semibold">
                          Processed At:{' '}
                        </span>
                        <span className="text-sm">
                          {new Date(
                            Number(withdrawalRequest.processedAt) * 1000,
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
                <p className="text-sm font-semibold">Owner:</p>
                <code className="text-xs font-mono break-all">{owner}</code>
              </div>

              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-semibold">Processor:</p>
                <code className="text-xs font-mono break-all">{processor}</code>
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

          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm font-semibold">Contract Balance:</p>
            <span className="text-sm">
              {(Number(contractBalance || BigInt(0)) / 1e6).toFixed(6)} USDC
            </span>
          </div>
        </div>

        {/* Processor Actions Info */}
        <div className="bg-muted/50 p-3 rounded-md mt-4">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> The <code>processWithdrawal</code> function
            is executed by the processor backend, not directly by users. The
            processor handles off-chain bank transfers and then updates the
            contract with the result (success/failure and message).
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
