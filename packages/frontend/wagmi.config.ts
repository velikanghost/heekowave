import { defineConfig } from '@wagmi/cli'
import { foundry, react } from '@wagmi/cli/plugins'
import {
  DELEGATION_MANAGER_ABI,
  MONAD_TESTNET_ADDRESSES,
} from '@heekowave/shared'

export default defineConfig({
  out: 'app/hooks/contracts-generated.ts',
  contracts: [
    {
      name: 'DelegationManager',
      address: MONAD_TESTNET_ADDRESSES.DELEGATION_MANAGER,
      abi: DELEGATION_MANAGER_ABI,
    },
  ],
  plugins: [
    foundry({
      project: '../contracts',
      artifacts: 'out',
      include: ['HeekowavePayments.json', 'HeekowaveWithdrawal.json'],
    }),
    react(),
  ],
})
