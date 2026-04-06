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
} from 'lucide-react'

export default function Home() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
              className="h-12 px-8 rounded-full text-base font-medium border-border/50 hover:bg-white/5 transition-all"
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

            <div className="hidden md:flex gap-4">
              {/* Optional search/filter tools */}
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
                <Button variant="outline" className="mt-6 rounded-full">
                  Register the first API
                </Button>
              </div>
            ) : (
              services.map((svc) => (
                <Card
                  key={svc.id}
                  className="group relative overflow-hidden bg-background/40 border-border/50 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(99,102,241,0.2)]"
                >
                  {/* Subtle gradient overlay on hover */}
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
    </div>
  )
}
