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
  AlertCircle,
  LayoutGrid,
  List,
  ChevronRight,
  ArrowUpRight,
  Settings,
} from 'lucide-react'
import { useWallet } from '@/lib/wallet-context'
import { useServicesStore } from '@/store/services-store'
import { IntegrationDrawer } from '@/components/integration-drawer'
import { useUIStore } from '@/store/ui-store'

const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || 'https://soroban-testnet.stellar.org'

export default function Registry() {
  const { isConnected, publicKey, sign } = useWallet()
  const { openRegistration, openIntegration } = useUIStore()
  const {
    services,
    fetchServices,
    isLoading: loading,
    error,
  } = useServicesStore()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const getIcon = (tags: string[]) => {
    const t = tags.map((tag) => tag.toLowerCase())
    if (t.includes('ai') || t.includes('compute') || t.includes('llm'))
      return <Cpu className="w-5 h-5 text-primary" />
    if (t.includes('data') || t.includes('database'))
      return <Database className="w-5 h-5 text-blue-400" />
    if (t.includes('weather') || t.includes('live'))
      return <Activity className="w-5 h-5 text-emerald-400" />
    if (t.includes('finance') || t.includes('alpha'))
      return <Layers className="w-5 h-5 text-primary" />
    return <Code className="w-5 h-5 text-zinc-400" />
  }

  const formatAddress = (addr: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : 'Unknown'

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-500 pb-12">
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
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase font-black text-zinc-500">
              INITIALIZING_REGISTRY...
            </p>
          </div>
        ) : error ? (
          <div className="py-20 text-center border-2 border-primary/20 bg-primary/5 rounded-none">
            <AlertCircle className="w-10 h-10 text-primary mx-auto mb-4" />
            <p className="text-primary font-black uppercase tracking-widest text-xs">
              REGISTRY_FAILURE: {error}
            </p>
            <Button
              variant="link"
              onClick={() => window.location.reload()}
              className="text-primary mt-4 font-mono text-[10px] tracking-widest uppercase hover:underline decoration-2"
            >
              RETRY_CONNECTION
            </Button>
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-border bg-zinc-900/10 space-y-6 animate-in fade-in zoom-in-95 duration-700">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-black uppercase tracking-tighter text-white">
                No services yet
              </h3>
              <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
                No autonomous service protocols have been broadcasted to this
                network node yet.
              </p>
            </div>
            <Button
              onClick={openRegistration}
              className="bg-primary hover:bg-white text-black font-black uppercase tracking-widest text-[10px] h-11 px-8 rounded-none transition-all shadow-lg shadow-primary/10"
            >
              Deploy a Service
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
                        className="group hover:bg-white/2 transition-colors cursor-pointer"
                        onClick={() => openIntegration(svc)}
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
                        onClick={() => openIntegration(svc)}
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
      <IntegrationDrawer />
    </div>
  )
}
