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

export default function SimplePayment() {
  const { address, isConnected } = useAccount()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [error, setError] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<
    'idle' | 'processing' | 'success' | 'error'
  >('idle')

  const handlePayment = async () => {
    if (!address || !recipient || !amount) {
      setError('Please fill in all required fields')
      return
    }

    setIsProcessing(true)
    setError('')
    setPaymentStatus('processing')

    try {
      console.log('Executing payment via API...')
      const response = await fetch('/api/relayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: address,
          recipient,
          amount,
          description,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Payment failed')
      }

      const { paymentId, txHash: hash } = await response.json()
      console.log('Payment successful:', { paymentId, hash })

      setTxHash(hash)
      setPaymentStatus('success')

      // Reset form
      setRecipient('')
      setAmount('')
      setDescription('')
    } catch (err) {
      console.error('Payment error:', err)
      setError(err instanceof Error ? err.message : 'Payment failed')
      setPaymentStatus('error')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Make Payment</CardTitle>
          <CardDescription>
            Connect your wallet to make gasless payments
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
        <CardTitle>Make Payment</CardTitle>
        <CardDescription>
          Send USDC gaslessly using your delegation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recipient */}
        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient Address</Label>
          <Input
            id="recipient"
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            disabled={isProcessing}
          />
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (USDC)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="10"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isProcessing}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Input
            id="description"
            placeholder="Payment for..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isProcessing}
          />
        </div>

        <Separator />

        {/* Submit Button */}
        <Button
          onClick={handlePayment}
          disabled={isProcessing || !recipient || !amount}
          className="w-full"
        >
          {isProcessing ? 'Processing Payment...' : 'Send Payment'}
        </Button>

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Success */}
        {paymentStatus === 'success' && txHash && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600">Payment Successful</Badge>
            </div>
            <div>
              <p className="text-sm font-semibold">Transaction Hash:</p>
              <code className="text-xs font-mono break-all">{txHash}</code>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-muted/50 p-3 rounded-md">
          <p className="text-xs text-muted-foreground">
            <strong>Gasless Payment:</strong> This payment will be executed by
            the relayer using your delegation. You don&apos;t need any MON
            tokens for gas fees. Make sure you have created a delegation first.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
