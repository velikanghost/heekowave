import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Rocket, ShieldCheck, TerminalSquare } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="flex-1 bg-black pb-24">
      {/* Dashboard Header */}
      <div className="border-b border-border/40 bg-zinc-950/50">
        <div className="container mx-auto px-6 py-12 max-w-7xl">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-4">Developer Dashboard</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Monetize your AI agent APIs directly on Stellar. Register your endpoint to the decentralized Bazaar registry and start receiving x402 auto-payments.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Registration Form */}
        <div className="lg:col-span-2">
          <Card className="bg-background/50 border-border/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Rocket className="w-6 h-6 text-indigo-400" />
                Register New API Service
              </CardTitle>
              <CardDescription>
                This will deploy your endpoint details to the Soroban smart contract, making it discoverable for autonomous agents.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Service Name</Label>
                    <Input id="name" placeholder="e.g. Trading Alpha Bot" className="bg-black/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price per Request (USDC)</Label>
                    <Input id="price" type="number" placeholder="0.25" className="bg-black/50" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">Origin Server URL (Underlying API)</Label>
                  <Input id="url" placeholder="https://api.yourdomain.com/v1" className="bg-black/50" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Discovery Tags (comma separated)</Label>
                  <Input id="tags" placeholder="Finance, Trading, Alpha" className="bg-black/50" />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-sm flex items-start gap-4">
                <ShieldCheck className="w-5 h-5 shrink-0 text-indigo-400 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Smart Contract Authorization</p>
                  Deploying this service requires an on-chain transaction to the Bazaar registry. Make sure your wallet is connected.
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                Sign & Deploy to Network
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Integration Instructions */}
        <div className="space-y-6">
          <Card className="bg-zinc-950/80 border-border/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TerminalSquare className="w-5 h-5 text-purple-400" />
                Gateway Proxy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <p>
                Once registered, do not expose your origin URL. Instead, route your clients through the Heekowave Gateway:
              </p>
              <div className="p-3 bg-black rounded border border-white/5 font-mono text-xs text-green-400 break-all">
                https://gateway.heekowave.com/proxy/your-service-id
              </div>
              <p>
                The gateway will automatically issue a <strong>402 Payment Required</strong> challenge to clients and verify their L-HTTP Stellar receipt before passing traffic to your origin.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950/80 border-border/30">
            <CardHeader>
              <CardTitle className="text-lg">Your Active Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground text-center py-6 border-2 border-dashed border-border/50 rounded-lg">
                No services registered yet.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
