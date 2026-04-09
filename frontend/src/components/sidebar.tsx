'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  List,
  LayoutDashboard,
  Database,
  FileText,
  Activity,
  Zap,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Directory', href: '/', icon: List },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Registry', href: '/registry', icon: Database },
  { name: 'Docs', href: '/docs', icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden lg:flex w-64 flex-col fixed inset-y-0 z-50 bg-black border-r border-border">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary flex items-center justify-center rounded-sm">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white uppercase italic">
            Heekowave
          </span>
        </Link>
      </div>

      <nav className="flex-1 flex flex-col px-4 py-8 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-3 py-2.5 text-sm font-medium transition-all duration-200 border-l-2',
                isActive
                  ? 'bg-primary/10 text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-white hover:bg-white/5',
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 shrink-0 transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground group-hover:text-white',
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-6 border-t border-border space-y-6">
        <div className="px-3 py-3 bg-zinc-900/50 border border-border rounded-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">
              Network status
            </span>
            <Activity className="w-3 h-3 text-green-500 animate-pulse" />
          </div>
          <p className="text-[11px] font-mono text-green-500/80">
            Stellar Testnet: UP
          </p>
        </div>
      </div>
    </div>
  )
}
