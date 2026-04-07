'use client'
import { useState, useEffect } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  Cpu,
  Database,
  Activity,
  Code,
  Layers,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react'
import { useWallet } from '@/lib/wallet-context'
import { 
  rpc, 
  Networks, 
  TransactionBuilder, 
  Operation, 
  Asset
} from '@stellar/stellar-sdk'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

const RPC_URL = 'https://soroban-testnet.stellar.org';

export default function Home() {
  const { isConnected, publicKey, sign } = useWallet();
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Integration Modal State
  const [selectedService, setSelectedService] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
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
    setIsModalOpen(true)
    setPaymentTxHash(null)
    setReceipt(null)
    setTestResponse(null)
    setTestError(null)
  }

  const handlePay = async () => {
    if (!isConnected || !publicKey || !selectedService) return;
    
    setPaymentLoading(true);
    setTestError(null);

    try {
      const server = new rpc.Server(RPC_URL);
      const sourceAccount = await server.getAccount(publicKey);
      
      // Build a simple payment transaction to the provider
      const tx = new TransactionBuilder(sourceAccount, {
        fee: '10000',
        networkPassphrase: Networks.TESTNET,
      })
      .addOperation(
        Operation.payment({
          destination: selectedService.provider,
          asset: Asset.native(),
          amount: selectedService.price, // XLM amount
        })
      )
      .setTimeout(30)
      .build();

      const xdr = tx.toXDR();
      const signedXdr = await sign(xdr, 'TESTNET');
      
      const result = await server.sendTransaction(TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET));

      if (result.status !== 'ERROR') {
        setPaymentTxHash(result.hash);
        
        // Generate L-HTTP Receipt (Simple JSON format for the guard)
        const receiptData = {
          hash: result.hash,
          signer: publicKey,
          timestamp: Math.floor(Date.now() / 1000)
        };
        setReceipt(btoa(JSON.stringify(receiptData)));
      } else {
        throw new Error('Payment transaction failed');
      }
    } catch (err: any) {
      console.error('Payment Error:', err);
      setTestError(err.message || 'Payment failed. Use Friendbot to fund your wallet.');
    } finally {
      setPaymentLoading(false);
    }
  }

  const handleTestCall = async () => {
    if (!selectedService || !receipt) return;
    
    setTestLoading(true);
    setTestResponse(null);
    setTestError(null);

    try {
      const res = await fetch(`http://localhost:3002/proxy/${selectedService.id}/`, {
        method: 'GET',
        headers: {
          'l-http': receipt
        }
      });
      
      const data = await res.json();
      setTestResponse(data);
      if (!res.ok) {
        setTestError(data.message || 'Gateway rejected the request');
      }
    } catch (err: any) {
      setTestError(err.message || 'Failed to reach Heekowave Gateway');
    } finally {
      setTestLoading(false);
    }
  }

  const getIcon = (tags: string[]) => {
    const t = tags.map((tag) => tag.toLowerCase())
    if (t.includes('ai') || t.includes('compute') || t.includes('llm'))
      return <Cpu className="w-6 h-6 text-purple-400" />
    if (t.includes('data') || t.includes('database'))
      return <Database className="w-6 h-6 text-green-400" />
    if (t.includes('weather') || t.includes('live'))
      return <Activity className="w-6 h-6 text-blue-400" />
    if (t.includes('finance') || t.includes('alpha'))
      return <Layers className="w-6 h-6 text-indigo-400" />
    return <Code className="w-6 h-6 text-orange-400" />
  }

  const formatAddress = (addr: string) => {
    if (!addr) return 'Unknown'
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-24 pb-32">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[50px_50px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-indigo-500/20 to-transparent" />
        <div className="absolute -top-48 -left-48 w-96 h-96 bg-indigo-500/20 rounded-full blur-[128px]" />

        <div className="container relative z-10 mx-auto px-6 max-w-7xl flex flex-col items-center text-center">
          <Badge
            variant="outline"
            className="mb-8 border-indigo-500/30 text-indigo-300 bg-indigo-500/10 px-4 py-1.5 rounded-full text-sm font-medium"
          >
            Powered by Stellar x402 🚀
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            The Agentic{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-500">
              Economy
            </span>{' '}
            is Here
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            Heekowave is building The Bazaar: a decentralized registry of AI
            agent services and API tools. Buy, sell, and build autonomous
            workflows natively monetized with USDC.
          </p>
          <div className="flex gap-4">
            <Button
              size="lg"
              className="h-12 px-8 bg-white text-black hover:bg-white/90 rounded-full text-base font-semibold transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)]"
            >
              Explore Services
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 rounded-full text-base font-medium border-border/50 hover:bg-white/5 transition-all text-white"
            >
              Read Docs
            </Button>
          </div>
        </div>
      </section>

      {/* Bazaar Registry Grid */}
      <section className="flex-1 bg-black pb-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <Layers className="w-8 h-8 text-indigo-400" />
                The Bazaar Directory
              </h2>
              <p className="text-muted-foreground mt-2">
                Discover and integrate live AI services directly into your dApps
                and Agents.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-24 opacity-50">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
                <p className="text-lg font-medium">Loading The Bazaar...</p>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-24 border border-red-500/20 bg-red-500/5 rounded-3xl">
                <p className="text-red-400 font-medium">
                  Error loading directory: {error}
                </p>
                <Button
                  variant="link"
                  onClick={() => window.location.reload()}
                  className="mt-4 text-indigo-400"
                >
                  Try Again
                </Button>
              </div>
            ) : services.length === 0 ? (
              <div className="col-span-full text-center py-24 opacity-60">
                <p className="text-xl">No services found in the registry.</p>
                <Button variant="outline" className="mt-6 rounded-full text-white">
                  Register the first API
                </Button>
              </div>
            ) : (
              services.map((svc) => (
                <Card
                  key={svc.id}
                  className="group relative overflow-hidden bg-background/40 border-border/50 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(99,102,241,0.2)]"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <CardHeader>
                    <div className="mb-4 w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                      {getIcon(svc.tags)}
                    </div>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-semibold">
                        {svc.name}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="bg-green-500/10 text-green-400 border border-green-500/20"
                      >
                        {svc.price} XLM
                      </Badge>
                    </div>
                    <CardDescription className="font-mono text-xs opacity-60 mt-1">
                      Provider: {formatAddress(svc.provider)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {svc.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded-md bg-white/5 text-muted-foreground border border-white/5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="ghost"
                      className="w-full justify-between group/btn text-muted-foreground hover:text-white"
                      onClick={() => handleIntegrateClick(svc)}
                    >
                      Integrate API
                      <ArrowRight className="w-4 h-4 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Integrate Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
               <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                 {selectedService && getIcon(selectedService.tags)}
               </div>
               <div>
                 <DialogTitle className="text-2xl">{selectedService?.name}</DialogTitle>
                 <DialogDescription className="text-indigo-400">
                   {selectedService?.price} XLM per Request
                 </DialogDescription>
               </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {!paymentTxHash ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                    Payment Required
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    This API is monetized via Heekowave Gateway. To access it, you must perform a Stellar payment of <strong>{selectedService?.price} XLM</strong> to the provider.
                  </p>
                </div>
                
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-500 h-12 text-lg font-bold"
                  onClick={handlePay}
                  disabled={paymentLoading || !isConnected}
                >
                  {paymentLoading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin"/> Processing Payment...</>
                  ) : !isConnected ? (
                    "Connect Wallet to Pay"
                  ) : (
                    <>Pay & Get Receipt <Zap className="ml-2 w-4 h-4" /></>
                  )}
                </Button>
                {testError && <p className="text-red-400 text-xs text-center">{testError}</p>}
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                     <CheckCircle2 className="w-6 h-6" />
                   </div>
                   <div>
                     <p className="font-bold text-green-400">Payment Successful</p>
                     <button 
                       onClick={() => window.open(`https://stellar.expert/explorer/testnet/tx/${paymentTxHash}`, '_blank')}
                       className="text-[10px] text-green-400/70 underline flex items-center gap-1"
                     >
                       View Receipt {paymentTxHash.slice(0, 8)}... <ExternalLink className="w-2.5 h-2.5" />
                     </button>
                   </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    Live API Console
                  </h4>
                  
                  <div className="relative">
                    <div className="flex justify-between items-center mb-2 px-1">
                      <span className="text-[10px] uppercase tracking-widest text-zinc-500">HTTP GET via Heekowave Gateway</span>
                      <Badge variant="outline" className="text-[9px] border-indigo-500/30 text-indigo-400 h-4">Receipt Attached</Badge>
                    </div>
                    <div className="p-3 bg-black rounded-lg border border-white/5 font-mono text-[11px] text-zinc-400 break-all mb-4">
                      GET http://localhost:3002/proxy/{selectedService?.id}/
                    </div>
                    
                    <Button 
                      className="w-full bg-white text-black hover:bg-white/90 font-bold mb-4"
                      onClick={handleTestCall}
                      disabled={testLoading}
                    >
                      {testLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Run Integration Test"}
                    </Button>

                    {testResponse && (
                      <div className="space-y-2 animate-in zoom-in-95 duration-300">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-500">Server Response</span>
                        <pre className="p-4 bg-zinc-900 rounded-lg border border-white/5 font-mono text-[11px] text-green-400 overflow-x-auto">
                          {JSON.stringify(testResponse, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    {testError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {testError}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-white/5 pt-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
