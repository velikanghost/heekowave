'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
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
import {
  createSmartAccount,
  getExistingSmartAccount,
} from '../lib/smartAccount'
import { createPublicClient, http, formatEther } from 'viem'
import { monadTestnet } from 'viem/chains'

const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
})

export default function SmartAccountManager() {
  const { address: eoaAddress, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(
    null,
  )
  const [smartAccountBalance, setSmartAccountBalance] = useState<string | null>(
    null,
  )
  const [isDeployed, setIsDeployed] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateSmartAccount = async () => {
    if (!walletClient) {
      setError('Wallet client not available')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const smartAccount = await createSmartAccount(walletClient)
      setSmartAccountAddress(smartAccount.address)
      setIsDeployed(true)

      // Refresh info
    } catch (error) {
      console.error('Error creating smart account:', error)
      setError('Failed to create smart account')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Smart Account Manager</CardTitle>
          <CardDescription>
            Connect your wallet to manage your smart account
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
        <CardTitle>Smart Account Manager</CardTitle>
        <CardDescription>
          Manage your MetaMask Smart Account for gasless transactions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* EOA Address */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">EOA Address</Badge>
          </div>
          <div className="bg-muted p-3 rounded-md">
            <code className="text-sm font-mono break-all">{eoaAddress}</code>
          </div>
        </div>

        <Separator />

        {/* Smart Account Address */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={smartAccountAddress ? 'default' : 'outline'}>
              Smart Account
            </Badge>
            {isDeployed !== null && (
              <Badge variant={isDeployed ? 'default' : 'secondary'}>
                {isDeployed ? 'Deployed' : 'Not Deployed'}
              </Badge>
            )}
          </div>
          {smartAccountAddress ? (
            <div className="bg-muted p-3 rounded-md">
              <code className="text-sm font-mono break-all">
                {smartAccountAddress}
              </code>
            </div>
          ) : (
            <p className="text-muted-foreground">No smart account found</p>
          )}
        </div>

        {/* Balance */}
        {smartAccountBalance !== null && (
          <div className="space-y-2">
            <Badge variant="outline">Balance</Badge>
            <div className="bg-muted p-3 rounded-md">
              <span className="text-sm font-mono">
                {smartAccountBalance} MON
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <Button
            onClick={handleCreateSmartAccount}
            disabled={isLoading || isDeployed === true || !walletClient}
            className="w-full"
          >
            {isLoading
              ? 'Creating...'
              : isDeployed
              ? 'Smart Account Created'
              : 'Create Smart Account'}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Info */}
        <div className="bg-muted/50 p-3 rounded-md">
          <p className="text-xs text-muted-foreground">
            Smart accounts enable gasless transactions through delegation. The
            address is deterministic based on your EOA address.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
