import { NextRequest, NextResponse } from 'next/server'
import { getRelayerClient } from '../../lib/relayer'
import { delegationManagerContract } from '../../lib/contracts'
import { DELEGATION_MANAGER_ABI } from '@heekowave/shared'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { delegation, transaction } = body

    // Validate delegation and transaction
    if (!delegation || !transaction) {
      return NextResponse.json(
        { error: 'Missing delegation or transaction data' },
        { status: 400 },
      )
    }

    // Execute transaction via DelegationManager
    const relayerClient = getRelayerClient()
    const delegationManager = delegationManagerContract()

    // Execute delegation through the DelegationManager
    const hash = await relayerClient.writeContract({
      address: delegationManager.address,
      abi: DELEGATION_MANAGER_ABI,
      functionName: 'executeDelegation',
      args: [delegation.delegator, delegation.delegate, delegation.caveatHash],
    })

    return NextResponse.json({ success: true, txHash: hash })
  } catch (error) {
    console.error('Relayer error:', error)
    return NextResponse.json({ error: 'Transaction failed' }, { status: 500 })
  }
}
