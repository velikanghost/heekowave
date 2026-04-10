'use client'

import { useEffect } from 'react'
import { useUIStore } from '@/store/ui-store'
import { useStatsStore } from '@/store/stats-store'
import { Button } from './ui/button'
import { useWallet } from '@/lib/wallet-context'
import { LogOut, Loader2, Wallet } from 'lucide-react'

export function Navbar() {
  const { publicKey, connect, disconnect, isConnecting, isConnected } =
    useWallet()
  const { openRegistration } = useUIStore()
  const { stats, fetchStats } = useStatsStore()

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 10000)
    return () => clearInterval(interval)
  }, [fetchStats])

  const truncateKey = (key: string) => {
    return `${key.slice(0, 4)}...${key.slice(-4)}`
  }

  return (
    <header className="sticky top-0 z-40 bg-black border-b border-border">
      <div className="flex h-16 items-center px-6">
        {/* Global Stats */}
        <div className="hidden md:flex items-center gap-6 font-mono text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="uppercase tracking-widest text-zinc-500 font-bold">
              Registry:
            </span>
            <span className="text-primary font-bold">
              {stats.registryCount}
            </span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="uppercase tracking-widest text-zinc-500 font-bold">
              Total Volume:
            </span>
            <span className="text-white">{stats.totalVolume} XLM</span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="uppercase tracking-widest text-zinc-500 font-bold">
              Active Agents:
            </span>
            <span className="text-white">{stats.activeAgents}</span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <Button
            onClick={openRegistration}
            className="bg-primary text-black hover:bg-primary/90 font-black uppercase tracking-widest text-[10px] h-11 px-8 rounded-none"
          >
            Deploy a Service
          </Button>

          <div className="h-10 w-px bg-border mx-2 hidden sm:block" />

          {isConnected ? (
            <div className="flex items-center gap-3 bg-zinc-900 border border-border px-3 h-10 rounded-none group hover:border-primary/50 transition-colors">
              <div className="flex flex-col items-end">
                <span className="text-[9px] uppercase tracking-widest text-primary font-black leading-none">
                  SECURE_SESSION
                </span>
                <span className="text-[11px] font-mono text-white leading-none mt-1">
                  {truncateKey(publicKey!)}
                </span>
              </div>
              <button
                onClick={disconnect}
                className="ml-2 text-zinc-500 hover:text-red-500 transition-colors"
                title="Disconnect"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="h-10 px-6 inline-flex items-center justify-center bg-primary text-black font-black text-xs tracking-widest uppercase hover:bg-white transition-all disabled:opacity-50 rounded-none"
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
