'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Rocket,
  ShieldCheck,
  TerminalSquare,
  Loader2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Activity,
  Terminal,
  Zap,
} from 'lucide-react'
import { useWallet } from '@/lib/wallet-context'
import {
  rpc,
  nativeToScVal,
  Networks,
  TransactionBuilder,
  Address,
  Contract,
  Operation,
} from '@stellar/stellar-sdk'
import { Badge } from '@/components/ui/badge'
import { useUIStore } from '@/store/ui-store'
import { useServicesStore } from '@/store/services-store'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useSearchParams } from 'next/navigation'

const HEEKOWAVE_CONTRACT_ID =
  process.env.NEXT_PUBLIC_HEEKOWAVE_CONTRACT_ID || ''
const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || 'https://soroban-testnet.stellar.org'

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <DashboardContent />
    </Suspense>
  )
}

function DashboardContent() {
  const { publicKey, sign, isConnected } = useWallet()
  const { openRegistration } = useUIStore()
  const { services, fetchServices, isLoading: fetching } = useServicesStore()
  const [txHash, setTxHash] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const userServices = useMemo(
    () => services.filter((svc: any) => svc.provider === publicKey),
    [services, publicKey],
  )

  // Test Console State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)
  const [selectedSvc, setSelectedSvc] = useState<any | null>(null)
  const [testPath, setTestPath] = useState('')
  const [testLoading, setTestLoading] = useState(false)
  const [testResponse, setTestResponse] = useState<any | null>(null)
  const [testError, setTestError] = useState<string | null>(null)

  useEffect(() => {
    if (isConnected && publicKey) {
      fetchServices()
    }
  }, [isConnected, publicKey, fetchServices])

  const handleTestRun = async () => {
    if (!selectedSvc || !publicKey) return
    setTestLoading(true)
    setTestError(null)
    setTestResponse(null)

    try {
      const server = new rpc.Server(RPC_URL)
      const sourceAccount = await server.getAccount(publicKey)

      // Build a no-op (sequence bump) to prove ownership in the bypass check
      const tx = new TransactionBuilder(sourceAccount, {
        fee: '100',
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(Operation.bumpSequence({ bumpTo: '0' })) // Placeholder no-op
        .setTimeout(30)
        .build()

      const signedXdr = await sign(tx.toXDR(), 'TESTNET')

      const gatewayUrl =
        process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3002'
      const res = await fetch(
        `${gatewayUrl}/proxy/${selectedSvc.id}/${testPath}`,
        {
          method: 'GET',
          headers: {
            'x-heeko-test-xdr': signedXdr,
          },
        },
      )

      const data = await res.json()
      setTestResponse(data)
      if (!res.ok) {
        setTestError(data.message || 'Gateway rejected the test request')
      }
    } catch (err: any) {
      console.error('Test Error:', err)
      setTestError(err.message || 'Failed to reach gateway')
    } finally {
      setTestLoading(false)
    }
  }

  const getExplorerLink = () =>
    `https://stellar.expert/explorer/testnet/tx/${txHash}`

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Dashboard Header */}
      <div className="border-b-2 border-border bg-zinc-950">
        <div className="container mx-auto px-6 py-10 max-w-7xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
              <Activity className="w-8 h-8 text-primary" />
              Registry Console
            </h1>
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest max-w-md leading-relaxed">
              Scale your API reach. Monitor deployments and coordinate
              autonomous settlements across the Stellar network.
            </p>
          </div>
          <Button
            onClick={openRegistration}
            className="bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest h-11 px-8 shrink-0 shadow-lg shadow-primary/20 rounded-none transition-all active:scale-95 border-none"
          >
            <Rocket className="w-5 h-5 mr-2" />
            Deploy new service
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <Card className="bg-zinc-950 border-2 border-border rounded-none shadow-none">
              <CardHeader className="border-b border-border bg-zinc-900/50">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <TerminalSquare className="w-4 h-4 text-primary" />
                  Edge Gateway Proxy
                </CardTitle>
              </CardHeader>
              <CardContent className="text-[11px] font-mono text-zinc-400 space-y-5 pt-6">
                <p className="leading-relaxed">
                  The Heekowave Gateway interceptor handles 402 Payment
                  challenges automatically. Route your agents here:
                </p>
                <div className="p-4 bg-black border border-border text-primary break-all select-all hover:border-primary/50 transition-colors font-bold">
                  http://localhost:3002/proxy/{'{service_id}'}/
                </div>
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <p>
                      402 Verification: Status checked on-chain via Soroban.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <p>
                      L-HTTP Auth: Cryptographic receipts verified per-request.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-7">
            <Card className="bg-zinc-950 border-2 border-border rounded-none shadow-none h-full">
              <CardHeader className="border-b border-border bg-zinc-900/50 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Your On-Chain Services
                </CardTitle>
                {fetching && (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                )}
              </CardHeader>
              <CardContent className="pt-6">
                {userServices.length === 0 ? (
                  <div className="text-[10px] font-mono text-zinc-500 text-center py-20 border border-dashed border-border flex flex-col items-center gap-4 bg-black/20">
                    <Zap className="w-10 h-10 opacity-20 text-primary" />
                    <div className="space-y-1">
                      <p className="font-black">NO ACTIVE REGISTRATIONS</p>
                      <p className="opacity-60">
                        Deploy your first API service to start monetizing.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {userServices.map((svc) => (
                      <div
                        key={svc.id}
                        className="p-5 bg-black border border-border hover:border-primary/50 transition-all group/item relative overflow-hidden"
                      >
                        <div className="flex justify-between items-start mb-4 relative z-10">
                          <div className="space-y-1">
                            <span className="text-sm font-black uppercase tracking-tight text-white">
                              {svc.name}
                            </span>
                            <p className="text-[9px] font-mono text-zinc-500 truncate max-w-[250px]">
                              {svc.endpoint}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 bg-zinc-900 border border-border hover:bg-primary hover:text-black transition-all rounded-none"
                              onClick={() => {
                                setSelectedSvc(svc)
                                setIsTestModalOpen(true)
                                setTestPath('')
                                setTestResponse(null)
                                setTestError(null)
                              }}
                            >
                              <Terminal className="w-4 h-4" />
                            </Button>
                            <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono px-3 h-6 rounded-none font-bold">
                              {svc.price} XLM
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 uppercase tracking-widest relative z-10">
                          <span>Service ID: {svc.id}</span>
                          <span className="text-emerald-500 flex items-center gap-1.5 font-black">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            LIVE ON TESTNET
                          </span>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="bg-zinc-950 border-2 border-primary/30 text-white max-w-md rounded-none">
          <DialogHeader>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/30">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter text-center">
              Registration Success
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-500 font-mono text-[10px] tracking-widest pt-2">
              YOUR SERVICE IS NOW DISCOVERABLE BY AUTONOMOUS AGENTS.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-black rounded-none p-5 border border-border mt-6 space-y-4">
            <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest">
              <span className="text-zinc-500">TX_HASH</span>
              <span className="text-primary font-bold">
                {txHash ? `${txHash.slice(0, 12)}...` : ''}
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest">
              <span className="text-zinc-500">STATUS</span>
              <Badge className="bg-green-500/10 text-green-500 border border-green-500/20 py-0 h-5 font-black rounded-none">
                CONFIRMED
              </Badge>
            </div>
          </div>

          <DialogFooter className="mt-8 flex flex-col gap-3 sm:flex-col">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest h-12 rounded-none"
              onClick={() => window.open(getExplorerLink(), '_blank')}
            >
              EXPLORE LEDGER
              <ExternalLink className="ml-2 w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              className="w-full text-zinc-500 hover:text-white font-mono text-[10px] uppercase tracking-widest"
              onClick={() => setShowSuccess(false)}
            >
              CLOSE_DASHBOARD
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Console Dialog */}
      <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
        <DialogContent className="bg-zinc-950 border-2 border-border text-white max-w-2xl rounded-none">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-none border border-primary/20">
                <Terminal className="w-6 h-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black uppercase tracking-tighter">
                  Gateway Debug Console
                </DialogTitle>
                <DialogDescription className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  Routing for service:{' '}
                  <span className="text-primary">{selectedSvc?.name}</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-8 space-y-8">
            <div className="space-y-4">
              <div className="p-5 bg-primary/5 border border-primary/20 text-[11px] font-mono text-primary flex gap-4 items-start">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-black uppercase tracking-widest mb-1">
                    Provider Bypass Active
                  </p>
                  The gateway will verify your signed transaction to allow free
                  owner-testing on this endpoint.
                </div>
              </div>

              <div className="flex items-end gap-3 pt-2">
                <div className="flex-1 space-y-2">
                  <Label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                    Request Path
                  </Label>
                  <div className="flex items-center gap-3 p-3 bg-black border border-border rounded-none font-mono text-xs group focus-within:border-primary/50 transition-colors">
                    <span className="text-zinc-600">
                      /proxy/{selectedSvc?.id}/
                    </span>
                    <input
                      value={testPath}
                      onChange={(e) => setTestPath(e.target.value)}
                      placeholder="v1/data"
                      className="bg-transparent border-none outline-none flex-1 text-white placeholder:text-zinc-700"
                    />
                  </div>
                </div>
                <Button
                  className="bg-primary text-black hover:bg-white h-11 font-black uppercase tracking-widest px-8 rounded-none transition-all active:scale-[0.97]"
                  onClick={handleTestRun}
                  disabled={testLoading}
                >
                  {testLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'RUN TEST'
                  )}
                </Button>
              </div>
            </div>

            {testResponse && (
              <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                    Gateway Payload
                  </span>
                  <Badge className="text-[9px] bg-green-500/10 border-green-500/30 text-green-500 font-black rounded-none">
                    200 OK
                  </Badge>
                </div>
                <pre className="p-6 bg-black border-2 border-border font-mono text-[11px] text-primary overflow-x-auto max-h-[300px] shadow-inner custom-scrollbar">
                  {JSON.stringify(testResponse, null, 2)}
                </pre>
              </div>
            )}

            {testError && (
              <div className="p-5 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-mono uppercase tracking-widest flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {testError}
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-border pt-6">
            <Button
              variant="ghost"
              className="text-zinc-500 hover:text-white font-mono text-[10px] uppercase tracking-widest"
              onClick={() => setIsTestModalOpen(false)}
            >
              TERMINATE_SESSION
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
