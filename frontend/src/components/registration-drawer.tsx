'use client'

import React, { useState } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Rocket, ShieldCheck, Loader2, AlertCircle } from 'lucide-react'
import { useWallet } from '@/lib/wallet-context'
import { useUIStore } from '@/store/ui-store'
import { useServicesStore } from '@/store/services-store'
import { useStatsStore } from '@/store/stats-store'
import {
  rpc,
  nativeToScVal,
  Networks,
  TransactionBuilder,
  Contract,
} from '@stellar/stellar-sdk'

const HEEKOWAVE_CONTRACT_ID =
  process.env.NEXT_PUBLIC_HEEKOWAVE_CONTRACT_ID || ''
const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || 'https://soroban-testnet.stellar.org'

export function RegistrationDrawer() {
  const { isRegistrationOpen: isOpen, closeRegistration } = useUIStore()
  const { fetchServices } = useServicesStore()
  const { fetchStats } = useStatsStore()
  const { publicKey, sign, isConnected } = useWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    endpoint: '',
    tags: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleDeploy = async () => {
    if (!isConnected || !publicKey) {
      setError('Please connect your wallet first.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const server = new rpc.Server(RPC_URL)

      // Price is in stroops (7 decimals)
      const priceInStroops = BigInt(
        Math.floor(parseFloat(formData.price) * 10_000_000),
      )
      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag !== '')

      const sourceAccount = await server.getAccount(publicKey).catch(() => {
        throw new Error(
          'Account not found on Testnet. Please fund your account via Friendbot.',
        )
      })

      const contract = new Contract(HEEKOWAVE_CONTRACT_ID)

      const tx = new TransactionBuilder(sourceAccount, {
        fee: '10000',
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          contract.call(
            'register',
            nativeToScVal(publicKey, { type: 'address' }),
            nativeToScVal(formData.name),
            nativeToScVal(formData.endpoint),
            nativeToScVal(priceInStroops, { type: 'i128' }),
            nativeToScVal(tagsArray),
          ),
        )
        .setTimeout(30)
        .build()

      const simulation = await server.simulateTransaction(tx)
      if (!rpc.Api.isSimulationSuccess(simulation)) {
        throw new Error(
          'Simulation failed. Check if name is unique or balance is sufficient.',
        )
      }

      const finalTx = rpc.assembleTransaction(tx, simulation).build()
      const signedXdr = await sign(finalTx.toXDR(), 'TESTNET')
      const result = await server.sendTransaction(
        TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET),
      )

      if (result.status !== 'ERROR') {
        // Clear form and close
        setFormData({ name: '', price: '', endpoint: '', tags: '' })
        closeRegistration()

        // Refresh stores via Zustand
        fetchServices()
        fetchStats()
      } else {
        throw new Error(`Transaction failed with status: ${result.status}`)
      }
    } catch (err: any) {
      console.error('Deployment error:', err)
      setError(err.message || 'An unexpected error occurred during deployment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={closeRegistration}>
      <DrawerContent className="sm:max-w-3xl p-0 border-l-2 border-border bg-zinc-950 text-white flex flex-col h-full rounded-none before:hidden">
        <div className="flex-1 overflow-y-auto w-full p-8 space-y-8">
          <DrawerHeader className="px-0 pt-0 text-left">
            <DrawerTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Rocket className="w-7 h-7 text-primary" />
              Register Service
            </DrawerTitle>
            <DrawerDescription className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-2 leading-relaxed">
              Define your API endpoints and pricing model on the Stellar chain.
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest"
                >
                  Service Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Trading Alpha"
                  className="bg-black border-border rounded-none focus:border-primary focus:ring-0 text-xs font-mono h-11 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="price"
                  className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest"
                >
                  Price (XLM)
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="1.00"
                  className="bg-black border-border rounded-none focus:border-primary focus:ring-0 text-xs font-mono h-11 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="endpoint"
                className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest"
              >
                Origin Server URL
              </Label>
              <Input
                id="endpoint"
                value={formData.endpoint}
                onChange={handleInputChange}
                placeholder="https://api.yourbackend.com/v1"
                className="bg-black border-border rounded-none focus:border-primary focus:ring-0 text-xs font-mono h-11 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="tags"
                className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest"
              >
                Tags (Comma Sep)
              </Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="DeFi, Analytics, Bot"
                className="bg-black border-border rounded-none focus:border-primary focus:ring-0 text-xs font-mono h-11 text-white"
              />
            </div>

            <div className="p-5 bg-primary/5 border border-primary/20 text-primary text-[10px] font-mono leading-relaxed space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-black uppercase tracking-widest text-[11px]">
                  Contract Auth Required
                </span>
              </div>
              <p className="opacity-80">
                Deploying this service broadcasts your configuration to the
                Soroban directory. Fees will be paid in XLM from your connected
                wallet.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-mono uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 inline mr-2 -mt-0.5" />
                {error}
              </div>
            )}
          </div>

          <div className="mt-auto pt-8">
            <Button
              size="lg"
              onClick={handleDeploy}
              disabled={loading || !isConnected}
              className="w-full bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest h-14 rounded-none transition-all active:scale-[0.97] border-none shadow-xl shadow-primary/10"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  TRANSACTION IN PROGRESS...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-6 w-6" />
                  EXECUTE ON-CHAIN DEPLOY
                </>
              )}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
