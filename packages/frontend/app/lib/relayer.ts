import {
  createWalletClient,
  createPublicClient,
  http,
  type Address,
  encodeFunctionData,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { monadTestnet } from 'viem/chains'
import {
  createBundlerClient,
  createPaymasterClient,
} from 'viem/account-abstraction'
import {
  toMetaMaskSmartAccount,
  Implementation,
} from '@metamask/delegation-toolkit'
import { MONAD_TESTNET_ADDRESSES } from '@heekowave/shared'
import { heekowavePaymentsAbi } from '@/app/hooks/contracts-generated'

// Relayer account (needs MON for gas)
const relayerAccount = privateKeyToAccount(
  (process.env.RELAYER_PRIVATE_KEY || '0x') as `0x${string}`,
)

export const relayerClient = createWalletClient({
  account: relayerAccount,
  chain: monadTestnet,
  transport: http(process.env.NEXT_PUBLIC_MONAD_RPC_URL),
})

export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(process.env.NEXT_PUBLIC_MONAD_RPC_URL),
})

// AA clients
export const bundlerClient = createBundlerClient({
  client: publicClient,
  transport: http(
    `https://monad-testnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  ),
})

export const paymasterClient = createPaymasterClient({
  transport: http(
    `https://monad-testnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  ),
})

export class RelayerService {
  /**
   * Create MetaMask Smart Account for EOA
   */
  static async createSmartAccount(eoaAddress: Address) {
    const walletClient = createWalletClient({
      account: relayerAccount,
      chain: monadTestnet,
      transport: http(process.env.NEXT_PUBLIC_MONAD_RPC_URL),
    })

    const smartAccount = await toMetaMaskSmartAccount({
      client: publicClient,
      implementation: Implementation.Hybrid,
      deployParams: [eoaAddress, [], [], []],
      deploySalt: '0x',
      signer: { walletClient },
    })

    return smartAccount
  }

  /**
   * Execute a payment using Account Abstraction
   * This sends USDC transfer + logs payment in a single UserOperation
   */
  static async executePayment(
    eoaAddress: string,
    recipient: string,
    amount: bigint,
    description?: string,
  ): Promise<{ txHash: string; status: 'SUCCESS' }> {
    try {
      // Create smart account for user's EOA
      const smartAccount = await this.createSmartAccount(eoaAddress as Address)

      // ERC20 transfer ABI
      const erc20Abi = [
        {
          inputs: [
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'amount', type: 'uint256' },
          ],
          name: 'transfer',
          outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ] as const

      // Build UserOperation calls: USDC transfer + logPayment
      const calls = [
        {
          to: MONAD_TESTNET_ADDRESSES.MOCK_USDC as Address,
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: 'transfer',
            args: [recipient as Address, amount],
          }),
        },
        {
          to: MONAD_TESTNET_ADDRESSES.HEKOWAVE_PAYMENTS as Address,
          data: encodeFunctionData({
            abi: heekowavePaymentsAbi,
            functionName: 'logPayment',
            args: [
              smartAccount.address,
              recipient as Address,
              amount,
              MONAD_TESTNET_ADDRESSES.MOCK_USDC as Address,
            ],
          }),
        },
      ]

      // Send UserOperation with paymaster sponsorship
      const userOpHash = await bundlerClient.sendUserOperation({
        account: smartAccount,
        calls,
        paymaster: paymasterClient,
        paymasterContext: {
          policyId: process.env.ALCHEMY_POLICY_ID!,
        },
      })

      // Wait for UserOperation receipt
      const userOpReceipt = await bundlerClient.waitForUserOperationReceipt({
        hash: userOpHash,
      })

      const txHash = userOpReceipt.receipt.transactionHash

      return { txHash, status: 'SUCCESS' }
    } catch (error) {
      throw error
    }
  }

  /**
   * Get relayer wallet balance
   */
  static async getRelayerBalance(): Promise<bigint> {
    try {
      const balance = await publicClient.getBalance({
        address: relayerAccount.address,
      })
      return balance
    } catch (error) {
      console.error('Failed to get relayer balance:', error)
      return BigInt(0)
    }
  }

  /**
   * Get relayer address
   */
  static getRelayerAddress(): Address {
    return relayerAccount.address
  }
}

export default RelayerService
