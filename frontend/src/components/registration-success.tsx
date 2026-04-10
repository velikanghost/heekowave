'use client'

import { ExternalLink, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RegistrationSuccessProps {
  txHash: string
  onClose: () => void
}

export function RegistrationSuccess({
  txHash,
  onClose,
}: RegistrationSuccessProps) {
  const truncatedHash = `${txHash.slice(0, 8)}...${txHash.slice(-8)}`

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-12 p-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Decorative background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
          <div className="relative w-24 h-24 bg-black border-2 border-primary flex items-center justify-center rounded-full shadow-[0_0_50px_rgba(0,163,255,0.2)]">
            <Check className="w-12 h-12 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-white/80 font-mono text-[10px] uppercase tracking-[0.3em]">
            Service successfully deployed on-chain
          </p>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-4">
        <div className="bg-black border border-border p-5 space-y-3 group hover:border-primary/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              Transaction Hash
            </span>
          </div>
          <div className="flex items-center gap-1">
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs font-mono text-white hover:text-primary transition-colors truncate"
            >
              {txHash}
            </a>
            <ExternalLink className="w-5 h-5 text-zinc-700 group-hover:text-primary transition-colors" />
          </div>
        </div>

        <div className="p-4 bg-primary/5 border border-primary/20 flex items-center gap-3">
          <p className="text-[10px] font-medium text-center text-primary leading-tight uppercase tracking-wider">
            Your service is now discoverable by autonomous agents across the
            network.
          </p>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-6 pt-4">
        <Button
          onClick={onClose}
          className="w-full h-14 bg-white hover:bg-primary text-black font-black uppercase tracking-widest rounded-none transition-all group"
        >
          Return to Marketplace
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  )
}
