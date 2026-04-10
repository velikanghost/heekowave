'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Rocket,
  CheckCircle2,
  Activity,
  Zap,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { IntegrationDrawer } from '@/components/integration-drawer'
import { useWallet } from '@/lib/wallet-context'
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

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <DashboardContent />
    </Suspense>
  )
}

function DashboardContent() {
  const { publicKey, isConnected } = useWallet()
  const { openRegistration, openIntegration } = useUIStore()
  const { services, fetchServices, isLoading: fetching } = useServicesStore()
  const [txHash, setTxHash] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const gatewayUrl =
    process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3002'

  const userServices = useMemo(
    () => services.filter((svc: any) => svc.provider === publicKey),
    [services, publicKey],
  )

  useEffect(() => {
    if (isConnected && publicKey) {
      fetchServices()
    }
  }, [isConnected, publicKey, fetchServices])

  const getExplorerLink = () =>
    `https://stellar.expert/explorer/testnet/tx/${txHash}`

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <div className="border-b-2 border-border bg-zinc-950">
        <div className="container mx-auto px-6 py-10 max-w-7xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
              Dashboard
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
                  <Activity className="w-4 h-4 text-primary" />
                  Gateway Proxy
                </CardTitle>
              </CardHeader>
              <CardContent className="text-[11px] font-mono text-zinc-400 space-y-5 pt-6">
                <p className="leading-relaxed whitespace-normal wrap-break-word">
                  The Heekowave Gateway interceptor handles 402 Payment
                  challenges automatically. Route your agents here:
                </p>
                <div className="p-4 bg-black border border-border text-primary break-all select-all hover:border-primary/50 transition-colors font-bold overflow-hidden">
                  {gatewayUrl}/proxy/{'{service_id}'}/
                </div>
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <p className="wrap-break-word">
                      402 Verification: Status checked on-chain via Soroban.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <p className="wrap-break-word">
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
                        onClick={() => openIntegration(svc)}
                        className="p-5 bg-black border border-border hover:border-primary/50 transition-all group/item relative overflow-hidden cursor-pointer active:scale-[0.99]"
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
      <IntegrationDrawer />
    </div>
  )
}
