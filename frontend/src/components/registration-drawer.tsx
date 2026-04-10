'use client'

import React, { useState, useMemo } from 'react'
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
import {
  Rocket,
  Loader2,
  AlertCircle,
  FileCode,
  Layers,
  Globe,
} from 'lucide-react'
import { RegistrationSuccess } from './registration-success'
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
  xdr,
} from '@stellar/stellar-sdk'
import yaml from 'js-yaml'

const HEEKOWAVE_CONTRACT_ID =
  process.env.NEXT_PUBLIC_HEEKOWAVE_CONTRACT_ID || ''
const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || 'https://soroban-testnet.stellar.org'

export function RegistrationDrawer() {
  const { isRegistrationOpen: isOpen, closeRegistration } = useUIStore()
  const { fetchServices, addOptimisticService, setPending, removeService } =
    useServicesStore()
  const { fetchStats } = useStatsStore()
  const { publicKey, sign, isConnected } = useWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'manual' | 'bulk'>('manual')
  const [bulkInput, setBulkInput] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    endpoint: '',
    tags: '',
  })
  const [isSuccess, setIsSuccess] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [showExample, setShowExample] = useState(true)

  const shortAddr = useMemo(() => {
    if (!publicKey) return 'G...'
    return `${publicKey.slice(0, 3)}${publicKey.slice(-4)}`
  }, [publicKey])

  const slug = useMemo(() => {
    return formData.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
  }, [formData.name])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const parseBulkContent = () => {
    try {
      let data: any
      if (
        bulkInput.trim().startsWith('{') ||
        bulkInput.trim().startsWith('[')
      ) {
        data = JSON.parse(bulkInput)
      } else {
        data = yaml.load(bulkInput)
      }

      const services = Array.isArray(data) ? data : data.services || [data]
      return services.map((s: any) => ({
        name: s.name,
        price: s.price.toString(),
        endpoint: s.endpoint,
        tags: Array.isArray(s.tags) ? s.tags.join(', ') : s.tags || '',
      }))
    } catch (e: any) {
      throw new Error(`Parse error: ${e.message}`)
    }
  }

  const handleDeploy = async () => {
    if (!isConnected || !publicKey) {
      setError('Please connect your wallet first.')
      return
    }

    setLoading(true)
    setError(null)

    const tempIds: string[] = []

    try {
      const server = new rpc.Server(RPC_URL)
      const toStroops = (p: string) =>
        BigInt(Math.floor(parseFloat(p) * 10_000_000))
      const toTagsArr = (t: string) =>
        t
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag !== '')

      let servicesToDeploy: any[] = []

      if (mode === 'manual') {
        servicesToDeploy = [formData]
      } else {
        servicesToDeploy = parseBulkContent()
      }

      const sourceAccount = await server.getAccount(publicKey)
      const contract = new Contract(HEEKOWAVE_CONTRACT_ID)

      const txBuilder = new TransactionBuilder(sourceAccount, {
        fee: '10000',
        networkPassphrase: Networks.TESTNET,
      })

      if (servicesToDeploy.length === 1 && mode === 'manual') {
        const s = servicesToDeploy[0]
        txBuilder.addOperation(
          contract.call(
            'register',
            nativeToScVal(publicKey, { type: 'address' }),
            nativeToScVal(s.name),
            nativeToScVal(s.endpoint),
            nativeToScVal(toStroops(s.price), { type: 'i128' }),
            nativeToScVal(toTagsArr(s.tags)),
          ),
        )
      } else {
        // Soroban structs are Maps with Symbol keys. nativeToScVal for objects uses String keys by default,
        // which causes "UnexpectedType" errors in the VM.
        const batchInputsScVal = servicesToDeploy.map((s) => {
          return xdr.ScVal.scvMap([
            new xdr.ScMapEntry({
              key: xdr.ScVal.scvSymbol('endpoint'),
              val: nativeToScVal(s.endpoint),
            }),
            new xdr.ScMapEntry({
              key: xdr.ScVal.scvSymbol('name'),
              val: nativeToScVal(s.name),
            }),
            new xdr.ScMapEntry({
              key: xdr.ScVal.scvSymbol('price'),
              val: nativeToScVal(toStroops(s.price), { type: 'i128' }),
            }),
            new xdr.ScMapEntry({
              key: xdr.ScVal.scvSymbol('tags'),
              val: nativeToScVal(toTagsArr(s.tags)),
            }),
          ])
        })

        txBuilder.addOperation(
          contract.call(
            'batch_register',
            nativeToScVal(publicKey, { type: 'address' }),
            xdr.ScVal.scvVec(batchInputsScVal),
          ),
        )
      }

      const tx = txBuilder.setTimeout(30).build()
      const simulation = await server.simulateTransaction(tx)

      if (!rpc.Api.isSimulationSuccess(simulation)) {
        console.error('Simulation Result:', simulation)
        throw new Error('Simulation failed. Check console for details.')
      }

      // ONLY NOW we are optimistic: Simulation passed, transaction is valid
      servicesToDeploy.forEach((s) => {
        const id = addOptimisticService({
          name: s.name,
          slug: s.name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-'),
          provider: publicKey,
          price: s.price,
          endpoint: s.endpoint,
          tags: toTagsArr(s.tags),
        })
        tempIds.push(id)
      })

      const finalTx = rpc.assembleTransaction(tx, simulation).build()
      const signedXdr = await sign(finalTx.toXDR(), 'TESTNET')
      const result = await server.sendTransaction(
        TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET),
      )

      if (result.status !== 'ERROR') {
        fetchStats()
        fetchServices() // This will eventually overwrite our optimistic state with real DB data
        setTxHash(result.hash)
        setIsSuccess(true)
        setFormData({ name: '', price: '', endpoint: '', tags: '' })
        setBulkInput('')
      } else {
        console.error('Transaction Failed Detail:', result)
        throw new Error(
          `Transaction failed: ${result.status}. Check console for XDR result.`,
        )
      }
    } catch (err: any) {
      // FULL ROLLBACK: Remove the optimistic services from the list entirely
      tempIds.forEach((id) => removeService(id))
      console.error(err)
      setError(err.message || 'Deployment error.')
    } finally {
      setLoading(false)
    }
  }

  const handleDrawerClose = () => {
    closeRegistration()
    setTimeout(() => {
      setIsSuccess(false)
      setTxHash(null)
    }, 300)
  }

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={handleDrawerClose}>
      <DrawerContent className="sm:max-w-3xl p-0 border-l-2 border-border bg-zinc-950 text-white flex flex-col h-full rounded-none before:hidden">
        {isSuccess && txHash ? (
          <RegistrationSuccess
            txHash={txHash || ''}
            onClose={handleDrawerClose}
          />
        ) : (
          <div className="flex-1 overflow-y-auto w-full p-8 space-y-8 animate-in fade-in duration-500">
            <DrawerHeader className="px-0 pt-0 text-left">
              <DrawerTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                <Rocket className="w-7 h-7 text-primary" />
                Deploy Service Protocol
              </DrawerTitle>
              <DrawerDescription className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-2 leading-relaxed">
                Register single or multiple autonomous endpoints to the Soroban
                directory.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex bg-zinc-900/50 p-1 border border-border">
              <button
                onClick={() => setMode('manual')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'manual' ? 'bg-primary text-black' : 'text-zinc-500 hover:text-white'}`}
              >
                <Layers className="w-4 h-4" /> Manual Setup
              </button>
              <button
                onClick={() => setMode('bulk')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'bulk' ? 'bg-primary text-black' : 'text-zinc-500 hover:text-white'}`}
              >
                <FileCode className="w-4 h-4" /> Bulk Import
              </button>
            </div>

            <div className="space-y-6">
              {mode === 'manual' ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest">
                        Service Name
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Trading Alpha"
                        className="bg-black border-border rounded-none focus:border-primary focus:ring-0 text-xs font-mono h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest">
                        Price (XLM)
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="1.00"
                        className="bg-black border-border rounded-none focus:border-primary focus:ring-0 text-xs font-mono h-11"
                      />
                    </div>
                  </div>

                  {formData.name && (
                    <div className="p-4 bg-zinc-900/80 border border-primary/20 flex items-center gap-3">
                      <Globe className="w-4 h-4 text-primary" />
                      <div className="font-mono text-[10px] uppercase tracking-tighter">
                        <span className="text-zinc-500">Preview Endpoint:</span>
                        <span className="text-white ml-2">proxy/</span>
                        <span className="text-primary">{shortAddr}</span>
                        <span className="text-white">/</span>
                        <span className="text-primary">{slug}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest">
                      Origin Server URL
                    </Label>
                    <Input
                      id="endpoint"
                      value={formData.endpoint}
                      onChange={handleInputChange}
                      placeholder="https://api.yourbackend.com/v1"
                      className="bg-black border-border rounded-none focus:border-primary focus:ring-0 text-xs font-mono h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest">
                      Tags (Comma Sep)
                    </Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="DeFi, Analytics, Bot"
                      className="bg-black border-border rounded-none focus:border-primary focus:ring-0 text-xs font-mono h-11"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest">
                      JSON or YAML Content
                    </Label>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setShowExample(!showExample)}
                      className="text-[9px] uppercase font-black tracking-widest text-primary h-auto p-0"
                    >
                      {showExample ? '[ Hide Example ]' : '[ View Example ]'}
                    </Button>
                  </div>

                  {showExample && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-none space-y-2">
                        <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">
                          JSON Format
                        </p>
                        <pre className="text-[9px] font-mono text-primary opacity-80 overflow-x-auto">
                          {`[
  {
    "name": "Weather API",
    "endpoint": "https://api.w.com",
    "price": 0.5,
    "tags": ["live"]
  }
]`}
                        </pre>
                      </div>
                      <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-none space-y-2">
                        <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">
                          YAML Format
                        </p>
                        <pre className="text-[9px] font-mono text-primary opacity-80 overflow-x-auto">
                          {`- name: Weather API
  endpoint: https://api.w.com
  price: 0.5
  tags:
    - live`}
                        </pre>
                      </div>
                    </div>
                  )}

                  <textarea
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    placeholder="Paste your JSON array or YAML multi-document here..."
                    className="w-full min-h-[250px] bg-black border border-border p-4 text-xs font-mono focus:border-primary outline-none text-primary"
                  />
                  <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest text-left">
                    Provide an array of objects or valid YAML syntax.
                  </p>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {typeof error === 'object'
                    ? (error as any).message || JSON.stringify(error)
                    : error}
                </div>
              )}
            </div>

            <div className="mt-auto pt-8">
              <Button
                size="lg"
                onClick={handleDeploy}
                disabled={loading || !isConnected}
                className="w-full bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest h-14 rounded-none transition-all active:scale-[0.97]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    TRANSACTION IN PROGRESS...
                  </>
                ) : (
                  <>
                    {mode === 'manual'
                      ? 'EXECUTE DEPLOYMENT'
                      : 'EXECUTE BULK DEPLOYMENT'}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}
