'use client'

import Link from 'next/link'
import { useWallet } from '@/lib/wallet-context'
import { LogOut, Wallet, Loader2 } from 'lucide-react'

export function Navbar() {
  const { publicKey, connect, disconnect, isConnecting, isConnected } =
    useWallet()

  const truncateKey = (key: string) => {
    return `${key.slice(0, 4)}...${key.slice(-4)}`
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center mx-auto px-6 max-w-7xl">
        <Link
          href="/"
          className="flex gap-2 items-center font-bold text-xl tracking-tight text-white hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M2 12h4l3-9 5 18 3-9h5" />
            </svg>
          </div>
          Heekowave
        </Link>

        <nav className="flex items-center ml-auto gap-6">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-indigo-400 text-foreground/60"
          >
            Directory
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium transition-colors hover:text-indigo-400 text-foreground/60"
          >
            Dashboard
          </Link>

          {isConnected ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end mr-1">
                <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold">
                  Connected
                </span>
                <span className="text-xs font-mono text-foreground/80">
                  {truncateKey(publicKey!)}
                </span>
              </div>
              <button
                onClick={disconnect}
                className="group h-9 w-9 inline-flex items-center justify-center rounded-full border border-border/40 bg-background hover:bg-red-500/10 hover:border-red-500/50 transition-all duration-300"
                title="Disconnect Wallet"
              >
                <LogOut className="h-4 w-4 text-foreground/60 group-hover:text-red-500 transition-colors" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={connect}
                disabled={isConnecting}
                className="relative h-10 px-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 hover:shadow-indigo-500/40 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none group overflow-hidden"
              >
                <div className="absolute inset-x-0 bottom-0 h-px bg-white/20 translate-y-px group-hover:translate-y-0 transition-transform" />
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                    Connect Wallet
                  </>
                )}
              </button>
              {useWallet().error && (
                <span className="text-[10px] text-red-500 font-medium px-1 animate-pulse">
                  {useWallet().error}
                </span>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
