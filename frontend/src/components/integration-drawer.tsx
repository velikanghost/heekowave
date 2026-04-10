'use client'

import { useState, useEffect } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Cpu,
  Database,
  Activity,
  Layers,
  Code,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react'
import { useWallet } from '@/lib/wallet-context'
import { useUIStore } from '@/store/ui-store'
import {
  rpc,
  Networks,
  TransactionBuilder,
  Operation,
  Asset,
} from '@stellar/stellar-sdk'

const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || 'https://soroban-testnet.stellar.org'

export function IntegrationDrawer() {
  const { isConnected, publicKey, sign } = useWallet()
  const {
    isIntegrationOpen,
    closeIntegration,
    selectedSvcForIntegration: svc,
  } = useUIStore()

  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentTxHash, setPaymentTxHash] = useState<string | null>(null)
  const [receipt, setReceipt] = useState<string | null>(null)
  const [testLoading, setTestLoading] = useState(false)
  const [testResponse, setTestResponse] = useState<any | null>(null)
  const [testError, setTestError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (!isIntegrationOpen) {
      setPaymentTxHash(null)
      setReceipt(null)
      setTestResponse(null)
      setTestError(null)
      setCountdown(0)
    }
  }, [isIntegrationOpen])

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handlePay = async () => {
    if (!isConnected || !publicKey || !svc) return

    setPaymentLoading(true)
    setTestError(null)

    try {
      const server = new rpc.Server(RPC_URL)
      const sourceAccount = await server.getAccount(publicKey)

      const tx = new TransactionBuilder(sourceAccount, {
        fee: '10000',
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination: svc.provider,
            asset: Asset.native(),
            amount: svc.price,
          }),
        )
        .setTimeout(30)
        .build()

      const xdr = tx.toXDR()
      const signedXdr = await sign(xdr, 'TESTNET')
      const result = await server.sendTransaction(
        TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET),
      )

      if (result.status !== 'ERROR') {
        setPaymentTxHash(result.hash)
        const receiptData = {
          hash: result.hash,
          signer: publicKey,
          timestamp: Math.floor(Date.now() / 1000),
        }
        setReceipt(btoa(JSON.stringify(receiptData)))

        // Start indexing countdown
        setCountdown(5)
      } else {
        throw new Error('Payment failed')
      }
    } catch (err: any) {
      setTestError(err.message || 'Payment failed. Ensure wallet is funded.')
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleTestCall = async () => {
    if (!svc || !receipt) return
    setTestLoading(true)
    setTestResponse(null)
    setTestError(null)

    const gatewayUrl =
      process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3002'

    // Use shortAddr/slug format
    // Use shortAddr/slug format (no ellipsis: SGHYAHS)
    const shortAddr = `${svc.provider.slice(0, 3)}${svc.provider.slice(-4)}`

    try {
      const res = await fetch(`${gatewayUrl}/proxy/${shortAddr}/${svc.slug}/`, {
        method: 'GET',
        headers: { 'l-http': receipt },
      })
      const data = await res.json()
      console.log(data)
      setTestResponse(data)
      if (!res.ok) setTestError(data.message || 'Gateway rejected request')
    } catch (err: any) {
      setTestError(err.message || 'Gateway unreachable')
    } finally {
      setTestLoading(false)
    }
  }

  const getIcon = (tags: string[]) => {
    if (!tags) return <Code className="w-5 h-5 text-zinc-400" />
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

  return (
    <Drawer
      open={isIntegrationOpen}
      onOpenChange={closeIntegration}
      direction="right"
    >
      <DrawerContent className="bg-black border-l border-zinc-800 h-full w-full max-w-xl sm:rounded-none m-0 shadow-2xl outline-none">
        <div className="h-full flex flex-col pt-8">
          <DrawerHeader className="px-8 border-b border-border pb-6">
            <div className="flex items-center gap-5 mb-4">
              <div className="w-14 h-14 bg-zinc-900 border border-primary/20 flex items-center justify-center rounded-none shadow-[0_0_20px_rgba(0,163,255,0.1)]">
                {svc && getIcon(svc.tags)}
              </div>
              <div className="text-left">
                <DrawerTitle className="text-2xl font-black uppercase tracking-tighter text-white leading-none">
                  {svc?.name}
                </DrawerTitle>
                <DrawerDescription className="font-mono text-[10px] tracking-[0.2em] text-primary font-black mt-3 uppercase">
                  {svc?.slug} | {svc?.price} XLM / CALL
                </DrawerDescription>
                <p className="text-[9px] font-mono text-zinc-500 mt-2 break-all opacity-80 italic">
                  Url:{' '}
                  {process.env.NEXT_PUBLIC_GATEWAY_URL ||
                    'http://localhost:3002'}
                  /proxy/{svc?.provider.slice(0, 3)}
                  {svc?.provider.slice(-4)}/{svc?.slug}/
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/5 text-primary border-primary/20 text-[9px] uppercase font-black px-2 py-0.5 rounded-none">
                Developer Test Mode
              </Badge>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-8 py-8 space-y-10">
            {!paymentTxHash ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-primary text-black flex items-center justify-center font-black text-xs rounded-none italic">
                    01
                  </span>
                  <h3 className="text-xs uppercase tracking-widest font-black text-white text-left">
                    Payment Verification
                  </h3>
                </div>
                <div className="bg-zinc-900 border border-border p-6 rounded-none space-y-4">
                  <p className="text-zinc-400 text-sm font-medium leading-relaxed text-left">
                    To authenticate with this API provider, you must initiate a
                    signed Stellar transaction for{' '}
                    <span className="text-primary font-bold">
                      {svc?.price} XLM
                    </span>
                    . This serves as your cryptographically verifiable receipt.
                  </p>
                  <div className="p-4 bg-black border border-border font-mono text-[10px] text-zinc-500 break-all text-left">
                    PROVIDER: {svc?.provider}
                  </div>
                  <Button
                    className="w-full bg-primary text-black font-black uppercase tracking-widest text-xs h-12 rounded-none hover:bg-white transition-colors"
                    onClick={handlePay}
                    disabled={paymentLoading || !isConnected}
                  >
                    {paymentLoading ? (
                      <>
                        <Loader2 className="mr-3 h-4 w-4 animate-spin" />{' '}
                        PROCESSING...
                      </>
                    ) : !isConnected ? (
                      'WAITING_FOR_WALLET'
                    ) : (
                      <>
                        AUTHORIZE PAYMENT{' '}
                        <Zap className="ml-2 w-4 h-4 fill-current" />
                      </>
                    )}
                  </Button>
                  {testError && (
                    <div className="p-3 border border-red-500/30 bg-red-500/5 text-red-500 text-[10px] font-mono text-center">
                      ERROR
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-10 animate-in slide-in-from-right-8 duration-500 text-left">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                    <h3 className="text-xs uppercase tracking-widest font-black text-white">
                      Receipt Validated
                    </h3>
                  </div>
                  <div className="bg-green-500/5 border border-green-500/20 p-5 flex items-center justify-between group">
                    <div>
                      <p className="text-[10px] font-mono text-green-500 font-black uppercase">
                        Transaction_ID
                      </p>
                      <p className="text-xs font-mono text-green-200 mt-1">
                        {paymentTxHash.slice(0, 24)}...
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-500 hover:bg-green-500 hover:text-white rounded-none h-8 px-4 font-black uppercase text-[10px] tracking-widest"
                      onClick={() =>
                        window.open(
                          `https://stellar.expert/explorer/testnet/tx/${paymentTxHash}`,
                          '_blank',
                        )
                      }
                    >
                      View
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-primary text-black flex items-center justify-center font-black text-xs rounded-none italic">
                      02
                    </span>
                    <h3 className="text-xs uppercase tracking-widest font-black text-white">
                      Integration Console
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-none overflow-hidden text-left">
                      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 flex items-center justify-between">
                        <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-tighter">
                          Terminal_v1.0.0
                        </span>
                        <div className="flex gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                        </div>
                      </div>
                      <div className="p-5 font-mono text-[11px] leading-relaxed break-all">
                        <div className="flex gap-2">
                          <span className="text-primary">$</span>
                          <span className="text-zinc-300 italic">
                            GET /proxy/{svc?.provider.slice(0, 3)}...
                            {svc?.provider.slice(-4)}/{svc?.slug}/
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-zinc-500">
                          <span>[HEADER]</span>
                          <span className="text-primary font-bold">
                            l-http:
                          </span>
                          <span className="text-zinc-600">
                            {receipt?.slice(0, 24)}...
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-white text-black font-black uppercase tracking-widest text-xs h-12 rounded-none hover:bg-primary transition-colors disabled:opacity-50"
                      onClick={handleTestCall}
                      disabled={testLoading || countdown > 0}
                    >
                      {testLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : countdown > 0 ? (
                        `INDEXING... ${countdown}s`
                      ) : (
                        'EXECUTE API CALL'
                      )}
                    </Button>

                    {testResponse && (
                      <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300 mt-6 text-left">
                        <h4 className="text-[10px] font-mono text-zinc-500 font-black uppercase px-2 tracking-widest">
                          Server Response Output
                        </h4>
                        <pre
                          className={`p-5 font-mono text-[11px] overflow-x-auto shadow-inner border ${
                            testError
                              ? 'bg-red-500/5 border-red-500/20 text-red-400'
                              : 'bg-zinc-950 border-border text-zinc-400'
                          }`}
                        >
                          {JSON.stringify(testResponse, null, 2)}
                        </pre>
                      </div>
                    )}

                    {testError && (
                      <div className="p-4 bg-red-500/5 border border-red-500/20 text-red-400 text-[11px] font-mono flex items-start gap-3 text-left">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-black uppercase tracking-tighter">
                            Execution Error
                          </p>
                          <p className="opacity-80">
                            {typeof testError === 'string'
                              ? testError
                              : (testError as any).message || 'Request failed'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-8 border-t border-border mt-auto">
            <Button
              variant="ghost"
              onClick={closeIntegration}
              className="w-full text-zinc-500 hover:text-white font-black uppercase tracking-widest text-[10px] h-10 rounded-none border border-transparent hover:border-zinc-800"
            >
              Close_Session
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
