'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Rocket, ShieldCheck, TerminalSquare, Loader2, ExternalLink, CheckCircle2, AlertCircle, Activity, Terminal } from 'lucide-react';
import { useWallet } from '@/lib/wallet-context';
import { 
  rpc, 
  nativeToScVal, 
  Networks, 
  TransactionBuilder, 
  Address, 
  Contract,
  Operation
} from '@stellar/stellar-sdk';
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const HEEKOWAVE_CONTRACT_ID = process.env.NEXT_PUBLIC_HEEKOWAVE_CONTRACT_ID || '';
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://soroban-testnet.stellar.org';

export default function Dashboard() {
  const { publicKey, sign, isConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [userServices, setUserServices] = useState<any[]>([]);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Test Console State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [selectedSvc, setSelectedSvc] = useState<any | null>(null);
  const [testPath, setTestPath] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testResponse, setTestResponse] = useState<any | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    url: '',
    tags: '',
  });

  const fetchUserServices = async () => {
    if (!publicKey) return;
    setFetching(true);
    try {
      const res = await fetch('http://localhost:3002/proxy/registry');
      if (res.ok) {
        const data = await res.json();
        const filtered = data.filter((svc: any) => svc.provider === publicKey);
        setUserServices(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch user services:', err);
    } finally {
      setFetching(false);
    }
  };

  React.useEffect(() => {
    if (isConnected && publicKey) {
      fetchUserServices();
    }
  }, [isConnected, publicKey]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleDeploy = async () => {
    if (!isConnected || !publicKey) {
      setError('Please connect your wallet first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const server = new rpc.Server(RPC_URL);
      
      // 1. Prepare Arguments
      // Price is in stroops (7 decimals)
      const priceInStroops = BigInt(Math.floor(parseFloat(formData.price) * 10_000_000));
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

      // 2. Build Transaction
      const sourceAccount = await server.getAccount(publicKey).catch(() => {
        throw new Error("Account not found on Testnet. Please fund your account via Friendbot.");
      });

      const contract = new Contract(HEEKOWAVE_CONTRACT_ID);
      
      const tx = new TransactionBuilder(sourceAccount, {
        fee: '10000', // Basic fee, will be updated by simulation
        networkPassphrase: Networks.TESTNET,
      })
      .addOperation(
        contract.call(
          'register',
          nativeToScVal(publicKey, { type: 'address' }),
          nativeToScVal(formData.name),
          nativeToScVal(formData.url),
          nativeToScVal(priceInStroops, { type: 'i128' }),
          nativeToScVal(tagsArray)
        )
      )
      .setTimeout(30)
      .build();

      // 3. Simulate Transaction to get resource fees
      console.log("Simulating transaction...");
      const simulation = await server.simulateTransaction(tx);
      
      if (!rpc.Api.isSimulationSuccess(simulation)) {
        throw new Error(`Simulation failed. Check if the service name is unique or if you have enough balance.`);
      }

      // 4. Update transaction with simulation results (fees/footprint)
      const finalTx = rpc.assembleTransaction(tx, simulation).build();
      const xdr = finalTx.toXDR();

      // 5. Sign with Freighter
      console.log("Signing transaction...");
      const signedXdr = await sign(xdr, 'TESTNET');

      // 6. Submit to network
      console.log("Submitting transaction...");
      const result = await server.sendTransaction(TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET));

      if (result.status !== 'ERROR') {
        setTxHash(result.hash);
        setShowSuccess(true);
        // Clear form
        setFormData({ name: '', price: '', url: '', tags: '' });
        // Refresh list
        setTimeout(fetchUserServices, 2000); // Small delay for ledger propagation
      } else {
        throw new Error(`Transaction failed with status: ${result.status}`);
      }

    } catch (err: any) {
      console.error('Deployment error:', err);
      setError(err.message || 'An unexpected error occurred during deployment.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestRun = async () => {
    if (!selectedSvc || !publicKey) return;
    setTestLoading(true);
    setTestError(null);
    setTestResponse(null);

    try {
      const server = new rpc.Server(RPC_URL);
      const sourceAccount = await server.getAccount(publicKey);
      
      // Build a no-op (sequence bump) to prove ownership in the bypass check
      const tx = new TransactionBuilder(sourceAccount, {
        fee: '100',
        networkPassphrase: Networks.TESTNET,
      })
      .addOperation(Operation.bumpSequence({ bumpTo: "0" })) // Placeholder no-op
      .setTimeout(30)
      .build();

      const signedXdr = await sign(tx.toXDR(), 'TESTNET');

      const res = await fetch(`http://localhost:3002/proxy/${selectedSvc.id}/${testPath}`, {
        method: 'GET',
        headers: {
          'x-heeko-test-xdr': signedXdr
        }
      });
      
      const data = await res.json();
      setTestResponse(data);
      if (!res.ok) {
        setTestError(data.message || 'Gateway rejected the test request');
      }
    } catch (err: any) {
      console.error('Test Error:', err);
      setTestError(err.message || 'Failed to reach gateway');
    } finally {
      setTestLoading(false);
    }
  };

  const getExplorerLink = () => `https://stellar.expert/explorer/testnet/tx/${txHash}`;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Dashboard Header */}
      <div className="border-b border-border/40 bg-zinc-950/50">
        <div className="container mx-auto px-6 py-12 max-w-7xl">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-4">Developer Dashboard</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Monetize your AI agent APIs directly on Stellar. Register your endpoint to the decentralized Heekowave directory and start receiving x402 auto-payments.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Registration Form */}
        <div className="lg:col-span-2">
          <Card className="bg-background/50 border-border/50 backdrop-blur shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Service Name</Label>
                    <Input 
                      id="name" 
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Trading Alpha Bot" 
                      className="bg-black/50 border-white/10 focus:border-indigo-500/50" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price per Request (XLM)</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.25" 
                      className="bg-black/50 border-white/10 focus:border-indigo-500/50" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">Origin Server URL (Underlying API)</Label>
                  <Input 
                    id="url" 
                    value={formData.url}
                    onChange={handleInputChange}
                    placeholder="https://api.yourdomain.com/v1" 
                    className="bg-black/50 border-white/10 focus:border-indigo-500/50" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Discovery Tags (comma separated)</Label>
                  <Input 
                    id="tags" 
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="Finance, Trading, Alpha" 
                    className="bg-black/50 border-white/10 focus:border-indigo-500/50" 
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-sm flex items-start gap-4">
                <ShieldCheck className="w-5 h-5 shrink-0 text-indigo-400 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1 text-white">Smart Contract Authorization</p>
                  Deploying this service requires an on-chain transaction. Ensure your Freighter wallet is on **Testnet**.
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                size="lg" 
                onClick={handleDeploy}
                disabled={loading || !isConnected}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 h-12 text-base font-bold transition-all relative overflow-hidden active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Deploying to Network...
                  </>
                ) : (
                  <>
                    <Rocket className="mr-2 h-5 w-5" />
                    Sign & Deploy to Network
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Integration Instructions */}
        <div className="space-y-6">
          <Card className="bg-zinc-950/80 border-border/30 overflow-hidden">
            <CardHeader className="bg-white/5 border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <TerminalSquare className="w-5 h-5 text-purple-400" />
                Gateway Proxy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4 pt-6">
              <p>
                Once registered, route your clients through the Heekowave Gateway:
              </p>
              <div className="p-3 bg-black/80 rounded-lg border border-white/10 font-mono text-[11px] text-green-400 break-all shadow-inner">
                https://gateway.heekowave.com/proxy/your-service-id
              </div>
              <p>
                The gateway will automatically issue a <strong>402 Payment Required</strong> challenge to clients and verify their receipts before passing traffic to your origin.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950/80 border-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Your Active Services</CardTitle>
              {fetching && <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />}
            </CardHeader>
            <CardContent className="pt-4">
              {userServices.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8 border-2 border-dashed border-border/50 rounded-xl bg-white/5">
                  {fetching ? 'Syncing with chain...' : 'No services registered yet.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {userServices.map((svc) => (
                    <div key={svc.id} className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-colors group/item">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-white truncate pr-2">{svc.name}</span>
                        <div className="flex items-center gap-2">
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="h-6 w-6 opacity-0 group-hover/item:opacity-100 transition-opacity bg-white/5 hover:bg-indigo-500/20"
                             onClick={() => {
                               setSelectedSvc(svc);
                               setIsTestModalOpen(true);
                               setTestPath('');
                               setTestResponse(null);
                               setTestError(null);
                             }}
                           >
                             <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                           </Button>
                           <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] px-1.5 h-4">
                             {svc.price} XLM
                           </Badge>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                        <span>ID: {svc.id}</span>
                        <span className="text-green-500/70 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          On-Chain
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="bg-zinc-950 border-indigo-500/30 text-white max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/30">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <DialogTitle className="text-2xl text-center">Registration Successful!</DialogTitle>
            <DialogDescription className="text-center text-zinc-400 pt-2">
              Your API service has been successfully registered on the Stellar Soroban network.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 mt-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-500">Transaction Hash</span>
              <span className="font-mono text-zinc-300">
                {txHash ? `${txHash.slice(0, 10)}...${txHash.slice(-10)}` : ''}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-500">Network</span>
              <Badge variant="outline" className="text-indigo-400 border-indigo-500/30 py-0 h-5">Testnet</Badge>
            </div>
            <p className="text-[10px] text-indigo-400/70 italic text-center pt-2">
              * Propagating to Heekowave Directory... (typically ~30s)
            </p>
          </div>

          <DialogFooter className="mt-6 flex flex-col gap-3 sm:flex-col">
            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              onClick={() => window.open(getExplorerLink(), '_blank')}
            >
              View on Stellar Expert
              <ExternalLink className="ml-2 w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              className="w-full text-zinc-400 hover:text-white"
              onClick={() => setShowSuccess(false)}
            >
              Back to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Console Dialog */}
      <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
         <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-2xl">
           <DialogHeader>
             <div className="flex items-center gap-3">
               <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                 <Terminal className="w-5 h-5 text-indigo-400" />
               </div>
               <div>
                 <DialogTitle>Test Gateway Console</DialogTitle>
                 <DialogDescription>
                   Verify your origin server integration for <strong>{selectedSvc?.name}</strong>. 
                 </DialogDescription>
               </div>
             </div>
           </DialogHeader>

           <div className="py-6 space-y-6">
              <div className="space-y-4">
                 <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-[13px] text-indigo-200">
                   <p className="flex items-center gap-2 mb-1 font-semibold">
                     <ShieldCheck className="w-4 h-4 text-indigo-400" />
                     Provider Bypass Mode
                   </p>
                   You don't need to pay for your own API. The gateway will verify your signed transaction to allow free testing.
                 </div>

                 <div className="flex items-end gap-3">
                   <div className="flex-1 space-y-2">
                     <Label className="text-[11px] text-zinc-500 uppercase tracking-widest">Route Path</Label>
                     <div className="flex items-center gap-2 p-2 bg-black/50 border border-white/10 rounded-lg font-mono text-sm group focus-within:border-indigo-500/50 transition-colors">
                        <span className="text-zinc-600">/proxy/{selectedSvc?.id}/</span>
                        <input 
                          value={testPath}
                          onChange={(e) => setTestPath(e.target.value)}
                          placeholder="v1/search"
                          className="bg-transparent border-none outline-none flex-1 text-white placeholder:text-zinc-700" 
                        />
                     </div>
                   </div>
                   <Button 
                     className="bg-white text-black hover:bg-white/90 h-10 font-bold px-6"
                     onClick={handleTestRun}
                     disabled={testLoading}
                   >
                     {testLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Run Test"}
                   </Button>
                 </div>
              </div>

              {testResponse && (
                <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
                   <div className="flex justify-between items-center px-1">
                     <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Gateway Response</span>
                     <Badge variant="outline" className="text-[9px] border-green-500/30 text-green-400">Proxied via Heekowave</Badge>
                   </div>
                   <pre className="p-4 bg-zinc-900/80 rounded-lg border border-white/5 font-mono text-[11px] text-green-400 overflow-x-auto max-h-[250px] shadow-inner">
                     {JSON.stringify(testResponse, null, 2)}
                   </pre>
                </div>
              )}

              {testError && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                   <AlertCircle className="w-4 h-4 shrink-0" />
                   {testError}
                </div>
              )}
           </div>

           <DialogFooter className="border-t border-white/5 pt-4">
              <Button variant="ghost" className="text-zinc-500 hover:text-white" onClick={() => setIsTestModalOpen(false)}>
                Close Console
              </Button>
           </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}
