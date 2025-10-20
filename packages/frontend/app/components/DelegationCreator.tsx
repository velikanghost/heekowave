'use client'

import { useState } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
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
import { createERC20TransferDelegation } from '../lib/delegation'
import { createSmartAccount } from '../lib/smartAccount'
import { parseUnits, isAddress } from 'viem'
import { MONAD_TESTNET_ADDRESSES } from '@heekowave/shared'
import {
  validateDelegateAddress,
  validateTokenAddress,
} from '../lib/addressUtils'

export default function DelegationCreator() {
  const { address: eoaAddress, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [delegateAddress, setDelegateAddress] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createdDelegation, setCreatedDelegation] = useState<any>(null)
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(
    null,
  )
  const [error, setError] = useState<string | null>(null)

  const handleCreateDelegation = async () => {
    console.log('=== DelegationCreator: handleCreateDelegation called ===')
    console.log('Input validation:', {
      eoaAddress,
      delegateAddress,
      maxAmount,
      walletClient: !!walletClient,
    })

    if (!eoaAddress || !delegateAddress || !maxAmount) {
      console.log('Validation failed: missing fields')
      setError('Please fill in all fields')
      return
    }

    if (!walletClient) {
      console.log('Validation failed: no wallet client')
      setError('Wallet client not available')
      return
    }

    // Validate addresses using viem's isAddress
    if (!isAddress(delegateAddress)) {
      console.log('Validation failed: invalid delegate address')
      setError('Invalid delegate address format')
      return
    }

    const tokenAddress = MONAD_TESTNET_ADDRESSES.MOCK_USDC
    console.log('Token address validation check:', {
      tokenAddress,
      typeofTokenAddress: typeof tokenAddress,
      isAddressResult: isAddress(tokenAddress),
      MONAD_TESTNET_ADDRESSES,
    })

    if (!tokenAddress || !isAddress(tokenAddress)) {
      console.error('Validation failed: invalid token address', {
        tokenAddress,
        isValid: isAddress(tokenAddress),
      })
      setError(`Invalid token address format: ${tokenAddress}`)
      return
    }

    console.log('All validations passed, starting delegation creation...')
    setIsCreating(true)
    setError(null)

    try {
      console.log('Creating smart account...')
      // Create smart account for the user using wallet client
      const smartAccount = await createSmartAccount(walletClient)
      console.log('Smart account created:', smartAccount.address)

      // Store smart account address for display
      setSmartAccountAddress(smartAccount.address)

      // Parse amount (assuming 6 decimals for USDC)
      const amountWei = parseUnits(maxAmount, 6)

      console.log('Creating delegation with parameters:', {
        smartAccountAddress: smartAccount.address,
        delegateAddress,
        tokenAddress,
        amountWei: amountWei.toString(),
        maxAmount,
      })

      // Create delegation with validated addresses
      const delegation = await createERC20TransferDelegation(
        smartAccount,
        delegateAddress as `0x${string}`,
        tokenAddress as `0x${string}`,
        amountWei,
      )

      console.log('Delegation created successfully:', delegation)
      setCreatedDelegation(delegation)
    } catch (error) {
      console.error('Error creating delegation:', error)
      setError(
        `Failed to create delegation: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      )
    } finally {
      setIsCreating(false)
    }
  }

  const handleCopyDelegation = async () => {
    if (!createdDelegation) return

    try {
      await navigator.clipboard.writeText(
        JSON.stringify(createdDelegation.delegation, null, 2),
      )
    } catch (error) {
      console.error('Failed to copy delegation:', error)
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Delegation Creator</CardTitle>
          <CardDescription>
            Connect your wallet to create delegations
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
        <CardTitle>Delegation Creator</CardTitle>
        <CardDescription>
          Create delegations to allow relayer to execute payments on your behalf
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Token Info */}
        <div className="space-y-2">
          <Label>Token</Label>
          <div className="flex items-center gap-2">
            <Badge variant="outline">USDC</Badge>
            <span className="text-sm text-muted-foreground">
              {MONAD_TESTNET_ADDRESSES.MOCK_USDC}
            </span>
          </div>
        </div>

        <Separator />

        {/* Delegate Address */}
        <div className="space-y-2">
          <Label htmlFor="delegate">Delegate Address (Relayer)</Label>
          <Input
            id="delegate"
            placeholder="0x..."
            value={delegateAddress}
            onChange={(e) => setDelegateAddress(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Address of the relayer/backend that will execute payments
          </p>
        </div>

        {/* Max Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Maximum Amount (USDC)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="100"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Maximum amount the delegate can spend on your behalf
          </p>
        </div>

        {/* Create Button */}
        <Button
          onClick={() => {
            console.log('=== Button clicked ===')
            handleCreateDelegation()
          }}
          disabled={
            isCreating || !delegateAddress || !maxAmount || !walletClient
          }
          className="w-full"
        >
          {isCreating ? 'Creating Delegation...' : 'Create Delegation'}
        </Button>

        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Created Delegation */}
        {createdDelegation && (
          <div className="space-y-4">
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="default">Delegation Created</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyDelegation}
                >
                  📋 Copy JSON
                </Button>
              </div>

              <div className="space-y-2">
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-semibold">
                    Delegator (Smart Account):
                  </p>
                  <code className="text-xs font-mono break-all">
                    {smartAccountAddress || createdDelegation.delegator}
                  </code>
                </div>

                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-semibold">Delegate:</p>
                  <code className="text-xs font-mono break-all">
                    {createdDelegation.delegate}
                  </code>
                </div>

                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-semibold">Valid:</p>
                  <Badge
                    variant={
                      createdDelegation.isValid ? 'default' : 'destructive'
                    }
                  >
                    {createdDelegation.isValid ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-muted/50 p-3 rounded-md">
          <p className="text-xs text-muted-foreground">
            This delegation allows the specified address to spend up to{' '}
            {maxAmount || 'X'} USDC from your smart account. The relayer will
            use this delegation to execute payments without requiring your
            signature for each transaction. Your smart account address will be
            created automatically and displayed above.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
