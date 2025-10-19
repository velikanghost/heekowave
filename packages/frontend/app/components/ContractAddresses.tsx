'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MONAD_TESTNET_ADDRESSES } from '@heekowave/shared'

const contractAddresses = [
  {
    name: 'HeekowavePayments',
    address: MONAD_TESTNET_ADDRESSES.HEKOWAVE_PAYMENTS,
    description: 'Main payment contract for sending and requesting payments',
  },
  {
    name: 'HeekowaveWithdrawal',
    address: MONAD_TESTNET_ADDRESSES.HEKOWAVE_WITHDRAWAL,
    description:
      'Withdrawal contract for requesting and processing withdrawals',
  },
  {
    name: 'MockUSDC',
    address: MONAD_TESTNET_ADDRESSES.MOCK_USDC,
    description: 'Mock USDC token for testing payments',
  },
  {
    name: 'DelegationManager',
    address: MONAD_TESTNET_ADDRESSES.DELEGATION_MANAGER,
    description: 'MetaMask delegation manager for smart account delegations',
  },
]

export default function ContractAddresses() {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(address)
      setTimeout(() => setCopiedAddress(null), 2000)
    } catch (error) {
      console.error('Failed to copy address:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contract Addresses</CardTitle>
        <CardDescription>
          Deployed contract addresses on Monad Testnet (Chain ID: 10143)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {contractAddresses.map((contract) => (
          <div key={contract.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{contract.name}</Badge>
                <span className="text-sm text-muted-foreground">
                  {contract.description}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyAddress(contract.address)}
                className="ml-2"
              >
                {copiedAddress === contract.address ? '✓ Copied' : '📋 Copy'}
              </Button>
            </div>
            <div className="bg-muted p-3 rounded-md">
              <code className="text-sm font-mono break-all">
                {contract.address}
              </code>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
