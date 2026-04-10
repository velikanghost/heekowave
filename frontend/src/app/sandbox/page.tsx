'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Keypair,
  rpc,
  Networks,
  TransactionBuilder,
  Operation,
  Asset,
} from '@stellar/stellar-sdk'
import {
  Terminal,
  Cpu,
  Play,
  Database,
  Lock,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
} from 'lucide-react'
import { useServicesStore } from '@/store/services-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || 'https://soroban-testnet.stellar.org'

export default function AgentSandbox() {
  // Config State
  const [apiKey, setApiKey] = useState('')
  const [provider, setProvider] = useState<'openai' | 'anthropic'>('openai')
  const [agentPrompt, setAgentPrompt] = useState(
    'Analyze the current data and recommend an actionable insight.',
  )
  const { services, fetchServices } = useServicesStore()
  const [selectedService, setSelectedService] = useState<any | null>(null)

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  useEffect(() => {
    if (services.length > 0 && !selectedService) {
      setSelectedService(services[0])
      setAgentPrompt(
        `Analyze the current data from ${services[0].name} and recommend an actionable insight.`,
      )
    }
  }, [services, selectedService])

  // Wallet State
  const [keypair, setKeypair] = useState<Keypair | null>(null)
  const [funding, setFunding] = useState(false)
  const [balance, setBalance] = useState<string | null>(null)

  // Execution State
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<
    {
      id: string
      type: 'info' | 'success' | 'error' | 'agent'
      text: string
      time: string
    }[]
  >([])
  const logsEndRef = useRef<HTMLDivElement>(null)

  const addLog = (
    text: string,
    type: 'info' | 'success' | 'error' | 'agent' = 'info',
  ) => {
    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        type,
        text,
        time: new Date().toLocaleTimeString([], { hour12: false }),
      },
    ])
  }

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const handleBootSandbox = async () => {
    try {
      setFunding(true)
      addLog('Initializing Agent Sandbox environment...', 'info')

      const newKeypair = Keypair.random()
      addLog(`Generated ephemeral wallet: ${newKeypair.publicKey()}`, 'info')
      setKeypair(newKeypair)

      addLog('Requesting funds from Testnet Friendbot...', 'info')
      const res = await fetch(
        `https://friendbot.stellar.org/?addr=${newKeypair.publicKey()}`,
      )

      if (!res.ok) throw new Error('Friendbot funding failed')

      addLog('Ephemeral wallet successfully funded with 10,000 XLM.', 'success')
      setBalance('10000.0000000')
    } catch (err: any) {
      addLog(`Wallet Error: ${err.message}`, 'error')
      setKeypair(null)
    } finally {
      setFunding(false)
    }
  }

  const runAgentTask = async () => {
    if (!keypair) {
      addLog('Cannot start execution: No ephemeral wallet booted.', 'error')
      return
    }
    if (!apiKey) {
      addLog('Cannot start execution: No AI API Key provided.', 'error')
      return
    }
    if (!selectedService) {
      addLog('Cannot start execution: No target service selected.', 'error')
      return
    }

    const gatewayUrl =
      process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3002'
    const targetUrl = `${gatewayUrl}/proxy/${selectedService.id}/`

    setIsRunning(true)
    setLogs([]) // Clear old logs
    addLog(`Agent executing User Prompt: "${agentPrompt}"`, 'agent')
    addLog(
      'Agent deciding to fetch live data from Heekowave Gateway...',
      'info',
    )

    try {
      // 1. Initial Attempt
      addLog(`GET ${targetUrl}`, 'info')
      let response = await fetch(targetUrl)

      let apiData = null

      if (response.status === 402) {
        addLog(
          '402 Payment Required intercepted. Parsing x402 requirements...',
          'error',
        )
        const { requirements } = await response.json()
        addLog(
          `Requirements: ${requirements.maxAmountRequired} XLM to ${requirements.payTo.slice(0, 8)}...`,
          'info',
        )

        // 2. Perform On-chain Payment Autonomous
        addLog(
          'Agent autonomously constructing Stellar payment transaction...',
          'agent',
        )
        const server = new rpc.Server(RPC_URL)
        const sourceAccount = await server.getAccount(keypair.publicKey())

        const tx = new TransactionBuilder(sourceAccount, {
          fee: '10000',
          networkPassphrase: Networks.TESTNET,
        })
          .addOperation(
            Operation.payment({
              destination: requirements.payTo,
              asset: Asset.native(),
              amount: requirements.maxAmountRequired,
            }),
          )
          .setTimeout(30)
          .build()

        addLog(
          'Agent signing transaction with ephemeral private key...',
          'info',
        )
        tx.sign(keypair)

        addLog('Submitting transaction to Stellar Testnet...', 'info')
        const result = await server.sendTransaction(tx)

        if (result.status !== 'ERROR') {
          addLog(`Payment confirmed! Hash: ${result.hash}`, 'success')
          setBalance((prev) =>
            prev
              ? (
                  parseFloat(prev) - parseFloat(requirements.maxAmountRequired)
                ).toFixed(7)
              : null,
          )

          // 3. Generate L-HTTP Receipt Header
          addLog('Generating L-HTTP Cryptographic Receipt...', 'info')
          const receiptData = btoa(
            JSON.stringify({
              x402Version: 1,
              payload: {
                hash: result.hash,
                signer: keypair.publicKey(),
                timestamp: Math.floor(Date.now() / 1000),
              },
              accepted: {
                scheme: requirements.scheme,
                network: requirements.network,
                payTo: requirements.payTo,
                amount: requirements.maxAmountRequired,
                asset: requirements.asset,
                maxTimeoutSeconds: requirements.maxTimeoutSeconds,
                extra: {},
              },
            }),
          )

          // 4. Final Attempt with Receipt
          addLog(
            'Waiting 4 seconds for Network to index transaction...',
            'info',
          )
          await new Promise((r) => setTimeout(r, 4000))

          addLog(
            'Retrying Gateway request with L-HTTP Receipt attached...',
            'info',
          )
          const finalRes = await fetch(targetUrl, {
            headers: { 'l-http': receiptData },
          })

          if (!finalRes.ok) throw new Error('Gateway rejected the receipt')

          apiData = await finalRes.json()
          addLog('Secure data successfully retrieved from Gateway!', 'success')
        } else {
          throw new Error('Transaction rejected by Stellar network')
        }
      } else if (response.ok) {
        apiData = await response.json()
        addLog('Data retrieved without payment.', 'success')
      } else {
        throw new Error(`Unexpected status Code: ${response.status}`)
      }

      // 5. Final LLM Synthesis
      addLog('Agent synthesising data via external LLM...', 'agent')

      const llmSystemPrompt = `You are an AI Agent that has just successfully retrieved live data using an autonomous 402 crypto transaction on the Stellar network.
      The secure API returned this JSON data: ${JSON.stringify(apiData)}
      Summarize the data and achieve the user's objective intelligently.`

      const llmRes = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey,
          messages: [
            { role: 'system', content: llmSystemPrompt },
            { role: 'user', content: agentPrompt },
          ],
        }),
      })

      const llmData = await llmRes.json()

      if (!llmRes.ok) {
        throw new Error(llmData.error || 'Failed to communicate with LLM Proxy')
      }

      addLog('LLM Synthesis Complete.', 'success')
      addLog(`Final Output: \n\n${llmData.text}`, 'agent')
    } catch (err: any) {
      addLog(`Execution Error: ${err.message}`, 'error')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-6rem)]">
      <div className="w-full lg:w-96 flex flex-col gap-6 shrink-0 h-full overflow-y-auto pr-2 pb-6">
        <div className="space-y-1">
          <h1 className="text-xl font-black uppercase text-white tracking-widest flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            Agent Workspace
          </h1>
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
            Local Execution Environment
          </p>
        </div>

        <Card className="bg-zinc-950 border border-border rounded-none shadow-none">
          <CardContent className="p-5 space-y-5">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Lock className="w-4 h-4 text-zinc-400" />
              <h2 className="text-xs font-black uppercase tracking-widest text-white">
                LLM Configuration
              </h2>
            </div>

            <div className="space-y-1 flex flex-col">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                Target Service
              </label>
              <select
                className="w-full bg-black border border-border p-2.5 text-xs font-mono focus:outline-none focus:border-primary text-white"
                onChange={(e) => {
                  const svc = services.find(
                    (s) => s.id.toString() === e.target.value,
                  )
                  setSelectedService(svc)
                  if (svc) {
                    setAgentPrompt(
                      `Analyze the current data from ${svc.name} and recommend an actionable insight.`,
                    )
                  }
                }}
                value={selectedService?.id || ''}
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.price} XLM)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                Model Provider
              </label>
              <div className="flex gap-2 bg-black border border-border p-1">
                <button
                  onClick={() => setProvider('openai')}
                  className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${provider === 'openai' ? 'bg-primary text-black' : 'text-zinc-500 hover:text-white'}`}
                >
                  OpenAI
                </button>
                <button
                  onClick={() => setProvider('anthropic')}
                  className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${provider === 'anthropic' ? 'bg-primary text-black' : 'text-zinc-500 hover:text-white'}`}
                >
                  Anthropic
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  API Key
                </label>
                <span className="text-[9px] text-zinc-700 font-medium">
                  Memory Only
                </span>
              </div>
              <input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-black border border-border p-2.5 text-xs font-mono focus:outline-none focus:border-primary text-white"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border border-border rounded-none shadow-none overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
            <Wallet className="w-24 h-24 text-primary" />
          </div>
          <CardContent className="p-5 space-y-4 relative z-10">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Wallet className="w-4 h-4 text-zinc-400" />
              <h2 className="text-xs font-black uppercase tracking-widest text-white">
                Ephemeral Wallet
              </h2>
            </div>

            {keypair ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="bg-black border border-border p-3 space-y-2">
                  <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono">
                    Public Key
                  </p>
                  <p className="text-[10px] font-mono text-primary break-all whitespace-normal">
                    {keypair.publicKey()}
                  </p>
                </div>
                <div className="bg-black border border-border p-3 flex justify-between items-center">
                  <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono">
                    Balance
                  </p>
                  <p className="text-xs font-mono font-black text-white">
                    {balance} XLM
                  </p>
                </div>
                <BudgetBadge />
              </div>
            ) : (
              <>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium whitespace-normal wrap-break-word">
                  Generate a temporary Stellar wallet funded by Friendbot to
                  allow the agent to execute 402 payments autonomously.
                </p>
                <Button
                  onClick={handleBootSandbox}
                  disabled={funding}
                  className="w-full bg-white text-black font-black uppercase tracking-widest text-[10px] h-10 rounded-none hover:bg-primary transition-all"
                >
                  {funding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Boot Agent Toolbox'
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 flex flex-col border border-border bg-black relative">
        <div className="h-12 border-b border-border bg-zinc-900/50 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <Terminal className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-bold">
              Execution_Visualizer_v1
            </span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-zinc-700" />
            <div className="w-2 h-2 rounded-full bg-zinc-700" />
            <div className="w-2 h-2 bg-green-500/50 rounded-full animate-pulse" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
          {logs.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-30">
              <Zap className="w-8 h-8 text-zinc-500 mb-3" />
              <p className="uppercase tracking-widest text-[10px]">
                Awaiting Instructions
              </p>
            </div>
          )}

          {logs.map((log) => (
            <div key={log.id} className="flex gap-3 text-left w-full">
              <span className="text-zinc-600 shrink-0 select-none">
                [{log.time}]
              </span>

              <div className="flex-1 min-w-0">
                {log.type === 'agent' ? (
                  <div className="border-l-2 border-primary pl-3 bg-primary/5 py-2 pr-4 whitespace-pre-wrap wrap-break-word">
                    <span className="text-primary font-bold mr-2">
                      AGENT_SYS:
                    </span>
                    <span className="text-white">{log.text}</span>
                  </div>
                ) : log.type === 'error' ? (
                  <div className="text-red-400 break-all whitespace-pre-wrap">
                    <AlertCircle className="w-3 h-3 inline mr-2 -mt-0.5" />
                    {log.text}
                  </div>
                ) : log.type === 'success' ? (
                  <div className="text-green-400 wrap-break-word whitespace-pre-wrap">
                    <CheckCircle2 className="w-3 h-3 inline mr-2 -mt-0.5" />
                    {log.text}
                  </div>
                ) : (
                  <div className="text-zinc-400 break-all whitespace-pre-wrap">
                    <span className="text-zinc-500 mr-2">.</span>
                    {log.text}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>

        <div className="border-t border-border bg-zinc-950 p-4 shrink-0">
          <div className="space-y-3 max-w-3xl">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Database className="w-3 h-3" /> Objective
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={agentPrompt}
                onChange={(e) => setAgentPrompt(e.target.value)}
                placeholder="Instruct the agent..."
                disabled={isRunning}
                className="flex-1 bg-black border border-border px-3 text-xs font-mono text-white focus:outline-none focus:border-primary disabled:opacity-50"
              />
              <Button
                onClick={runAgentTask}
                disabled={isRunning || !keypair || !apiKey}
                className="bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-none h-10 px-6 hover:bg-white transition-all disabled:opacity-50 shrink-0"
              >
                {isRunning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Execute <Play className="w-3 h-3 ml-2 fill-current" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BudgetBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-[9px] uppercase tracking-widest text-green-500 font-bold">
      <CheckCircle2 className="w-3 h-3" />
      Ready
    </div>
  )
}
