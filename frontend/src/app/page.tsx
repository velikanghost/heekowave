'use client'
import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Cpu,
  Database,
  Activity,
  Code,
  Layers,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Zap,
  LayoutGrid,
  List,
  ChevronRight,
  ArrowUpRight,
  Globe,
  Settings,
  Search,
} from 'lucide-react'
import { useWallet } from '@/lib/wallet-context'
import {
  rpc,
  Networks,
  TransactionBuilder,
  Operation,
  Asset,
} from '@stellar/stellar-sdk'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || 'https://soroban-testnet.stellar.org'

export default function Home() {
  const { isConnected, publicKey, sign } = useWallet()
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  // Integration Drawer State
  const [selectedService, setSelectedService] = useState<any | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentTxHash, setPaymentTxHash] = useState<string | null>(null)
  const [receipt, setReceipt] = useState<string | null>(null)

  // Test Console State
  const [testLoading, setTestLoading] = useState(false)
  const [testResponse, setTestResponse] = useState<any | null>(null)
  const [testError, setTestError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch('http://localhost:3002/proxy/registry')
        if (!res.ok) throw new Error('Failed to fetch services')
        const data = await res.json()
        setServices(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  const handleIntegrateClick = (svc: any) => {
    setSelectedService(svc)
    setIsDrawerOpen(true)
    setPaymentTxHash(null)
    setReceipt(null)
    setTestResponse(null)
    setTestError(null)
  }

  const handlePay = async () => {
    if (!isConnected || !publicKey || !selectedService) return

    setPaymentLoading(true)
    setTestError(null)

    try {
      const server = new rpc.Server(RPC_URL)
      const sourceAccount = await server.getAccount(publicKey)

      const tx = new TransactionBuilder(sourceAccount, {
        fee: '10000',
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination: selectedService.provider,
            asset: Asset.native(),
            amount: selectedService.price,
          }),
        )
        .setTimeout(30)
        .build()

      const xdr = tx.toXDR()
      const signedXdr = await sign(xdr, 'TESTNET')
      const result = await server.sendTransaction(
        TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET),
      )

      if (result.status !== 'ERROR') {
        setPaymentTxHash(result.hash)
        const receiptData = {
          hash: result.hash,
          signer: publicKey,
          timestamp: Math.floor(Date.now() / 1000),
        }
        setReceipt(btoa(JSON.stringify(receiptData)))
      } else {
        throw new Error('Payment failed')
      }
    } catch (err: any) {
      setTestError(err.message || 'Payment failed. Ensure wallet is funded.')
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleTestCall = async () => {
    if (!selectedService || !receipt) return
    setTestLoading(true)
    setTestResponse(null)
    setTestError(null)

    try {
      const res = await fetch(
        `http://localhost:3002/proxy/${selectedService.id}/`,
        {
          method: 'GET',
          headers: { 'l-http': receipt },
        },
      )
      const data = await res.json()
      setTestResponse(data)
      if (!res.ok) setTestError(data.message || 'Gateway rejected request')
    } catch (err: any) {
      setTestError(err.message || 'Gateway unreachable')
    } finally {
      setTestLoading(false)
    }
  }

  const getIcon = (tags: string[]) => {
    const t = tags.map((tag) => tag.toLowerCase())
    if (t.includes('ai') || t.includes('compute') || t.includes('llm'))
      return <Cpu className="w-5 h-5 text-indigo-400" />
    if (t.includes('data') || t.includes('database'))
      return <Database className="w-5 h-5 text-green-400" />
    if (t.includes('weather') || t.includes('live'))
      return <Activity className="w-5 h-5 text-blue-400" />
    if (t.includes('finance') || t.includes('alpha'))
      return <Layers className="w-5 h-5 text-purple-400" />
    return <Code className="w-5 h-5 text-zinc-400" />
  }

  const formatAddress = (addr: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : 'Unknown'

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Hero / Header Section */}
      <section className="bg-zinc-900/30 border border-border p-8 rounded-none overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Globe className="w-32 h-32 text-primary" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <Badge className="bg-primary/10 text-primary border-primary/20 rounded-none px-3 py-1 font-mono text-[10px] uppercase font-black tracking-widest">
              Live Registry_v2.4
            </Badge>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              SYSTEM_READY
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4 uppercase italic">
            Agentic Ecosystem{' '}
            <span className="text-primary italic">Protocol</span>
          </h1>
          <p className="text-zinc-400 text-lg mb-8 leading-relaxed font-medium">
            Discover, integrate, and monetize AI capabilities through the x402
            payment primitive. The high-performance layer for autonomous agent
            transactions.
          </p>
          <div className="flex gap-4">
            <Button className="bg-primary text-black font-black uppercase tracking-widest text-xs h-11 px-8 hover:bg-white rounded-none">
              Deploy Service
            </Button>
            <Button
              variant="outline"
              className="border-zinc-800 text-zinc-400 font-bold text-xs h-11 px-8 hover:bg-white/5 rounded-none"
            >
              Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Directory Section */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-border pb-6">
          <div className="space-y-1">
            <h2 className="text-xs uppercase tracking-[0.3em] font-black text-primary flex items-center gap-2">
              <Settings className="w-3 h-3" /> Services Directory
            </h2>
            <p className="text-zinc-500 text-sm font-medium">
              Browse available monetized APIs and Agent tools.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-zinc-900 border border-border p-1 rounded-none">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-black' : 'text-zinc-500 hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-black' : 'text-zinc-500 hover:text-white'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-30">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="font-mono text-xs tracking-widest uppercase">
              Initializing Registry...
            </p>
          </div>
        ) : error ? (
          <div className="py-20 text-center border border-red-900/50 bg-red-950/20 rounded-none">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
            <p className="text-red-400 font-bold">REGISTRY_FAILURE: {error}</p>
            <Button
              variant="link"
              onClick={() => window.location.reload()}
              className="text-primary mt-4"
            >
              RETRY_CONNECTION
            </Button>
          </div>
        ) : (
          <>
            {viewMode === 'list' ? (
              <div className="overflow-x-auto border border-border">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-900/50 border-b border-border text-[10px] uppercase tracking-widest text-zinc-500 font-black">
                      <th className="px-6 py-4">Service Name</th>
                      <th className="px-6 py-4">Cost/Req</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Provider</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {services.map((svc) => (
                      <tr
                        key={svc.id}
                        className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                        onClick={() => handleIntegrateClick(svc)}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-zinc-900 border border-border flex items-center justify-center rounded-none group-hover:border-primary/50 transition-colors">
                              {getIcon(svc.tags)}
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm uppercase tracking-tight">
                                {svc.name}
                              </p>
                              <div className="flex gap-1 mt-1">
                                {svc.tags.slice(0, 2).map((t: string) => (
                                  <span
                                    key={t}
                                    className="text-[9px] px-1 bg-zinc-800 text-zinc-500 rounded-none"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-mono text-xs text-primary font-bold">
                            {svc.price} XLM
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 rounded-none text-[9px] uppercase font-black font-mono">
                            Stable
                          </Badge>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-mono text-[10px] text-zinc-500">
                            {formatAddress(svc.provider)}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 text-zinc-500 group-hover:text-primary transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {services.map((svc) => (
                  <Card
                    key={svc.id}
                    className="bg-zinc-900/20 border border-border rounded-none hover:border-primary/50 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-primary">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-zinc-900 border border-border flex items-center justify-center group-hover:border-primary transition-colors">
                          {getIcon(svc.tags)}
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-mono text-primary font-black uppercase tracking-widest">
                            {svc.price} XLM
                          </p>
                          <CardTitle className="text-lg font-black uppercase italic tracking-tight leading-none mt-1">
                            {svc.name}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {svc.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="text-[9px] px-2 py-0.5 bg-zinc-800 text-zinc-400 font-mono border border-border"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Button
                        className="w-full bg-zinc-900 border border-border hover:bg-primary hover:text-black font-black uppercase text-[10px] tracking-[0.2em] h-10 rounded-none transition-all"
                        onClick={() => handleIntegrateClick(svc)}
                      >
                        INTEGRATE_API
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* Integration Drawer */}
      <Drawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        direction="right"
      >
        <DrawerContent className="bg-black border-l border-zinc-800 h-full w-full max-w-xl sm:rounded-none m-0 shadow-2xl outline-none">
          <div className="h-full flex flex-col pt-8">
            <DrawerHeader className="px-8 border-b border-border pb-6">
              <div className="flex items-center gap-5 mb-4">
                <div className="w-14 h-14 bg-zinc-900 border border-primary/20 flex items-center justify-center rounded-none shadow-[0_0_20px_rgba(0,163,255,0.1)]">
                  {selectedService && getIcon(selectedService.tags)}
                </div>
                <div>
                  <DrawerTitle className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">
                    {selectedService?.name}
                  </DrawerTitle>
                  <DrawerDescription className="font-mono text-[10px] tracking-widest text-primary font-bold mt-2 uppercase">
                    ID: {selectedService?.id} | {selectedService?.price} XLM /
                    CALL
                  </DrawerDescription>
                </div>
              </div>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-10">
              {/* Step 1: Payment */}
              {!paymentTxHash ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-primary text-black flex items-center justify-center font-black text-xs rounded-none italic">
                      01
                    </span>
                    <h3 className="text-xs uppercase tracking-widest font-black text-white text-left">
                      Payment Verification
                    </h3>
                  </div>
                  <div className="bg-zinc-900 border border-border p-6 rounded-none space-y-4">
                    <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                      To authenticate with this API provider, you must initiate
                      a signed Stellar transaction for{' '}
                      <span className="text-primary font-bold">
                        {selectedService?.price} XLM
                      </span>
                      . This serves as your cryptographically verifiable
                      receipt.
                    </p>
                    <div className="p-4 bg-black border border-border font-mono text-[10px] text-zinc-500 break-all">
                      PROVIDER_PUBKEY: {selectedService?.provider}
                    </div>
                    <Button
                      className="w-full bg-primary text-black font-black uppercase tracking-widest text-xs h-12 rounded-none hover:bg-white transition-colors"
                      onClick={handlePay}
                      disabled={paymentLoading || !isConnected}
                    >
                      {paymentLoading ? (
                        <>
                          <Loader2 className="mr-3 h-4 w-4 animate-spin" />{' '}
                          PROCESSING_TRANS
                        </>
                      ) : !isConnected ? (
                        'WAITING_FOR_WALLET'
                      ) : (
                        <>
                          AUTHORIZE_PAYMENT{' '}
                          <Zap className="ml-2 w-4 h-4 fill-current" />
                        </>
                      )}
                    </Button>
                    {testError && (
                      <div className="p-3 border border-red-500/30 bg-red-500/5 text-red-500 text-[10px] font-mono text-center">
                        ERROR: {testError}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-10 animate-in slide-in-from-right-8 duration-500 text-left">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                      <h3 className="text-xs uppercase tracking-widest font-black text-white">
                        Receipt_Validated
                      </h3>
                    </div>
                    <div className="bg-green-500/5 border border-green-500/20 p-5 flex items-center justify-between group">
                      <div>
                        <p className="text-[10px] font-mono text-green-500 font-black uppercase">
                          Transaction_ID
                        </p>
                        <p className="text-xs font-mono text-green-200 mt-1">
                          {paymentTxHash.slice(0, 24)}...
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-500 hover:bg-green-500 hover:text-black rounded-none h-8 px-4 font-black uppercase text-[10px] tracking-widest"
                        onClick={() =>
                          window.open(
                            `https://stellar.expert/explorer/testnet/tx/${paymentTxHash}`,
                            '_blank',
                          )
                        }
                      >
                        Verify
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-primary text-black flex items-center justify-center font-black text-xs rounded-none italic">
                        02
                      </span>
                      <h3 className="text-xs uppercase tracking-widest font-black text-white">
                        Integration Console
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-zinc-950 border border-zinc-800 rounded-none overflow-hidden text-left">
                        <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 flex items-center justify-between">
                          <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-tighter">
                            Terminal_v1.0.0
                          </span>
                          <div className="flex gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                          </div>
                        </div>
                        <div className="p-5 font-mono text-[11px] leading-relaxed break-all">
                          <div className="flex gap-2">
                            <span className="text-primary">$</span>
                            <span className="text-zinc-300 italic">
                              GET /proxy/{selectedService?.id}/
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-zinc-500">
                            <span>[HEADER]</span>
                            <span className="text-indigo-400">l-http:</span>
                            <span className="text-zinc-600">
                              {receipt?.slice(0, 24)}...
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-white text-black font-black uppercase tracking-widest text-xs h-12 rounded-none hover:bg-primary transition-colors"
                        onClick={handleTestCall}
                        disabled={testLoading}
                      >
                        {testLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'EXECUTE_API_CALL'
                        )}
                      </Button>

                      {testResponse && (
                        <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300 mt-6 text-left">
                          <h4 className="text-[10px] font-mono text-zinc-500 font-black uppercase px-2 tracking-widest">
                            Server_Response_Output
                          </h4>
                          <pre className="p-5 bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-green-400 overflow-x-auto shadow-inner">
                            {JSON.stringify(testResponse, null, 2)}
                          </pre>
                        </div>
                      )}

                      {testError && (
                        <div className="p-4 bg-red-500/5 border border-red-500/20 text-red-400 text-[11px] font-mono flex items-start gap-3 text-left">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="font-black uppercase tracking-tighter">
                              Execution_Error
                            </p>
                            <p className="opacity-80">{testError}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-border mt-auto">
              <Button
                variant="ghost"
                onClick={() => setIsDrawerOpen(false)}
                className="w-full text-zinc-500 hover:text-white font-black uppercase tracking-widest text-[10px] h-10 rounded-none border border-transparent hover:border-zinc-800"
              >
                Close_Session
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
