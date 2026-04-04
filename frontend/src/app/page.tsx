import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Cpu, Database, Activity, Code, Layers } from 'lucide-react';

export default function Home() {
  const services = [
    {
      id: "weather",
      name: "Global Weather API",
      provider: "GBAU...7XYZ",
      price: "0.01 USDC",
      tags: ["Data", "Weather", "Live"],
      icon: <Activity className="w-6 h-6 text-blue-400" />
    },
    {
      id: "market",
      name: "Financial Market Signals",
      provider: "GCDJ...9LKP",
      price: "0.25 USDC",
      tags: ["Finance", "Alpha"],
      icon: <Database className="w-6 h-6 text-green-400" />
    },
    {
      id: "inference",
      name: "DeepSeek Inference Node",
      provider: "GBMM...3OOP",
      price: "0.005 USDC",
      tags: ["AI", "Compute", "LLM"],
      icon: <Cpu className="w-6 h-6 text-purple-400" />
    },
    {
      id: "scraper",
      name: "Dynamic Web Scraper",
      provider: "GDBA...2QQA",
      price: "0.05 USDC",
      tags: ["Data", "Automation"],
      icon: <Code className="w-6 h-6 text-orange-400" />
    }
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-24 pb-32">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        <div className="absolute -top-48 -left-48 w-96 h-96 bg-indigo-500/20 rounded-full blur-[128px]" />
        
        <div className="container relative z-10 mx-auto px-6 max-w-7xl flex flex-col items-center text-center">
          <Badge variant="outline" className="mb-8 border-indigo-500/30 text-indigo-300 bg-indigo-500/10 px-4 py-1.5 rounded-full text-sm font-medium">
            Powered by Stellar x402 🚀
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            The Agentic <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Economy</span> is Here
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            Heekowave is building The Bazaar: a decentralized registry of AI agent services and API tools. Buy, sell, and build autonomous workflows natively monetized with USDC.
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="h-12 px-8 bg-white text-black hover:bg-white/90 rounded-full text-base font-semibold transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)]">
              Explore Services
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 rounded-full text-base font-medium border-border/50 hover:bg-white/5 transition-all">
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
              <p className="text-muted-foreground mt-2">Discover and integrate live AI services directly into your dApps and Agents.</p>
            </div>
            
            <div className="hidden md:flex gap-4">
              {/* Optional search/filter tools */}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc) => (
              <Card key={svc.id} className="group relative overflow-hidden bg-background/40 border-border/50 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(99,102,241,0.2)]">
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <CardHeader>
                  <div className="mb-4 w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                    {svc.icon}
                  </div>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-semibold">{svc.name}</CardTitle>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-400 border border-green-500/20">{svc.price}</Badge>
                  </div>
                  <CardDescription className="font-mono text-xs opacity-60 mt-1">Provider: {svc.provider}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {svc.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 rounded-md bg-white/5 text-muted-foreground border border-white/5">
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full justify-between group/btn text-muted-foreground hover:text-white">
                    Integrate API
                    <ArrowRight className="w-4 h-4 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
