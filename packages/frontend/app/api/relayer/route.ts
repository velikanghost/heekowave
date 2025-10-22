import { NextRequest, NextResponse } from 'next/server'
import { RelayerService } from '@/app/lib/relayer'
import { parseUnits } from 'viem'

/**
 * POST /api/relayer - Execute a payment using Account Abstraction
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, recipient, amount, description } = await request.json()

    // Validate inputs
    if (!userId || !recipient || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, recipient, amount' },
        { status: 400 },
      )
    }

    // Parse amount (assuming 6 decimals for USDC)
    const amountWei =
      typeof amount === 'string' ? parseUnits(amount, 6) : BigInt(amount)

    // Execute payment using Account Abstraction
    const result = await RelayerService.executePayment(
      userId, // EOA address
      recipient,
      amountWei,
      description,
    )

    console.log('Payment executed:', result)

    return NextResponse.json({
      success: true,
      txHash: result.txHash,
      status: result.status,
    })
  } catch (error) {
    console.error('Payment execution failed:', error)
    return NextResponse.json(
      {
        error: 'Payment failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

/**
 * GET /api/relayer?userId=xxx - Get payment history (simplified - no DB)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Return empty array since we're not tracking payments in DB anymore
    return NextResponse.json({
      payments: [],
      message: 'Payment history not available (no database tracking)',
    })
  } catch (error) {
    console.error('Failed to get payment history:', error)
    return NextResponse.json(
      {
        error: 'Failed to get payment history',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
