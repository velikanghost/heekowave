import { NextRequest, NextResponse } from 'next/server'
import { getRelayerClient } from '../../../lib/relayer'
import { verifyMessage, parseAbi } from 'viem'

const WITHDRAWAL_ABI = parseAbi([
  'function requestWithdrawal(uint256 amount, string memory currency, string memory bankDetails) external returns (bytes32)',
])

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency, bankDetails, signature, userAddress } = body

    // Verify user signature
    const message = `Withdraw ${amount} ${currency} to ${bankDetails}`
    const isValidSignature = await verifyMessage({
      address: userAddress as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    })

    if (!isValidSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Submit withdrawal request via relayer
    const relayerClient = getRelayerClient()
    const hash = await relayerClient.writeContract({
      address: process.env.NEXT_PUBLIC_WITHDRAWAL_CONTRACT as `0x${string}`,
      abi: WITHDRAWAL_ABI,
      functionName: 'requestWithdrawal',
      args: [BigInt(amount), currency, bankDetails],
    })

    return NextResponse.json({
      success: true,
      txHash: hash,
    })
  } catch (error) {
    console.error('Withdrawal request error:', error)
    return NextResponse.json(
      { error: 'Withdrawal request failed' },
      { status: 500 },
    )
  }
}
