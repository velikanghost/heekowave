import { getProcessorClient } from '../../../lib/relayer'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, success, message } = body

    // Verify processor authorization
    const authHeader = request.headers.get('authorization')
    const expectedKey = process.env.PROCESSOR_PRIVATE_KEY
    if (!authHeader || authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Process withdrawal via contract
    const processorClient = getProcessorClient()
    const hash = await processorClient.writeContract({
      address: process.env.NEXT_PUBLIC_WITHDRAWAL_CONTRACT as `0x${string}`,
      abi: [
        {
          inputs: [
            { name: 'requestId', type: 'bytes32' },
            { name: 'success', type: 'bool' },
            { name: 'message', type: 'string' },
          ],
          name: 'processWithdrawal',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      functionName: 'processWithdrawal',
      args: [requestId, success, message],
    })

    return NextResponse.json({
      success: true,
      txHash: hash,
    })
  } catch (error) {
    console.error('Withdrawal processing error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
