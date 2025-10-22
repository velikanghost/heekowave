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
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function DelegationCreator() {
  const { address: eoaAddress, isConnected } = useAccount()
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSetupAccount = async () => {
    if (!eoaAddress) {
      setError('Please connect your wallet first')
      return
    }

    setIsSettingUp(true)
    setError(null)

    try {
      // No database setup needed - just mark as complete
      setSetupComplete(true)
    } catch (err) {
      console.error('Account setup error:', err)
      setError(err instanceof Error ? err.message : 'Account setup failed')
    } finally {
      setIsSettingUp(false)
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Setup Account</CardTitle>
          <CardDescription>
            Connect your wallet to set up gasless payments
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
        <CardTitle>Setup Account</CardTitle>
        <CardDescription>
          Initialize your account for gasless payments using Account Abstraction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {setupComplete ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600">Account Ready</Badge>
            </div>
            <p className="text-sm text-green-800">
              Your account is now set up for gasless payments! You can start
              making payments immediately.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Account Abstraction Setup:</strong> This will create
                your MetaMask Smart Account and initialize it for gasless
                payments. No delegation or complex setup required.
              </p>
            </div>

            <Separator />

            <Button
              onClick={handleSetupAccount}
              disabled={isSettingUp}
              className="w-full"
            >
              {isSettingUp ? 'Setting up Account...' : 'Setup Account'}
            </Button>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </>
        )}

        <div className="bg-muted/50 p-3 rounded-md">
          <p className="text-xs text-muted-foreground">
            <strong>How it works:</strong> Your MetaMask Smart Account will be
            created automatically when you make your first payment. All payments
            are gasless thanks to paymaster sponsorship.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
