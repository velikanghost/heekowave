'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Zap, ChevronRight, Globe, ShieldCheck } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,163,255,0.08)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <main className="relative z-10 container mx-auto px-6 flex flex-col items-center text-center space-y-12">
        <div className="flex flex-col items-center space-y-5 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center gap-4">
            <span className="text-4xl font-black text-white uppercase italic tracking-tighter">
              Heekowave
            </span>
          </div>
        </div>

        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase italic leading-[0.9]">
            Autonomous <br />
            <span className="text-primary italic">Settlement Gateway</span>
          </h1>
          <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            The discovery and monetization layer for the autonomous economy.
            Powered by Stellar x402 micro-payments and Soroban smart contracts.
          </p>
        </div>

        <div className="flex flex-col items-center space-y-6 animate-in fade-in zoom-in-95 duration-1000 delay-500">
          <Link href="/registry">
            <Button className="group bg-primary hover:bg-white text-black font-black uppercase tracking-[0.2em] text-xs h-16 px-12 rounded-none transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(0,163,255,0.2)]">
              Launch Application
              <ChevronRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <div className="flex items-center gap-8 text-[10px] font-mono uppercase tracking-widest text-zinc-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3 h-3" />
              Secure Settlement
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-3 h-3" />
              Global Registry
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
