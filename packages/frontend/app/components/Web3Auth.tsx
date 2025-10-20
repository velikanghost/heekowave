'use client'

import { useState, useCallback, useEffect } from 'react'
import { useWeb3AuthConnect } from '@web3auth/modal/react'
import { useAccount, useSendTransaction } from 'wagmi'
import { createPublicClient, http, formatEther } from 'viem'
import { monadTestnet } from 'viem/chains'
import { QRCodeSVG } from 'qrcode.react'
import { Wallet, Copy, Check, ArrowRight, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
})

export default function Web3Auth() {
  const [userAddress, setUserAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [balanceError, setBalanceError] = useState(false)
  const [copied, setCopied] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState<
    'idle' | 'pending' | 'success' | 'error'
  >('idle')

  const { connect } = useWeb3AuthConnect()
  const { address, isConnected } = useAccount()
  const { sendTransaction } = useSendTransaction()
  const router = useRouter()

  const walletAddress = address

  const fetchBalance = useCallback(async () => {
    if (!walletAddress) return

    setBalanceLoading(true)
    setBalanceError(false)

    try {
      const balanceWei = await publicClient.getBalance({
        address: walletAddress as `0x${string}`,
      })
      const balanceEth = formatEther(balanceWei)
      setBalance(balanceEth)
    } catch (error) {
      console.error('Error fetching balance:', error)
      setBalanceError(true)
    } finally {
      setBalanceLoading(false)
    }
  }, [walletAddress])

  const copyToClipboard = useCallback(async () => {
    if (!walletAddress) return

    try {
      await navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy address:', error)
    }
  }, [walletAddress])

  useEffect(() => {
    if (walletAddress) {
      fetchBalance()
    }
  }, [walletAddress, fetchBalance])

  // Redirect to dashboard when connected
  useEffect(() => {
    if (isConnected && walletAddress) {
      // Small delay to ensure connection is fully established
      const timer = setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [isConnected, walletAddress, router])

  const onSendTransaction = async () => {
    if (!userAddress) return

    setTransactionStatus('pending')

    try {
      const result = await sendTransaction({
        to: userAddress as `0x${string}`,
        value: BigInt(1000000000000000),
      })

      setTransactionStatus('success')

      // Refresh balance after successful transaction
      setTimeout(() => {
        fetchBalance()
      }, 3000)
    } catch (error) {
      console.error('Transaction failed:', error)
      setTransactionStatus('error')
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Connect Your Wallet
        </h1>
        <p className="text-lg text-gray-600">
          Connect your MetaMask wallet to start making P2P payments
        </p>
      </div>

      {/* Action Buttons Section */}
      <div className="space-y-8">
        {!isConnected ? (
          <div className="text-center">
            <button
              onClick={() => connect()}
              className="w-full bg-blue-500 text-white py-4 px-8 rounded-xl text-lg font-medium hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
            >
              <Wallet className="w-5 h-5 mr-2" />
              Get Started
            </button>
            <p className="text-sm text-gray-500 mt-4">
              Secure connection powered by MetaMask
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Wallet Connected!</h3>
              <p className="text-sm text-gray-600">You're ready to start making payments</p>
            </div>
          </div>
        )}

        {/* Wallet Information Section */}
        {isConnected && walletAddress && (
          <div className="space-y-6">
            {/* Address Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Wallet Address</h3>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span className="text-sm font-medium">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="font-mono text-sm text-gray-800 break-all">
                  {walletAddress}
                </p>
              </div>
              
              {/* QR Code */}
              <div className="mt-4 flex flex-col items-center">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <QRCodeSVG
                    value={walletAddress || ''}
                    size={160}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Scan to send funds to this wallet
                </p>
              </div>
            </div>

            {/* Balance Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Balance</h3>
                <button
                  onClick={fetchBalance}
                  disabled={balanceLoading}
                  className="p-2 rounded-lg bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <span className={balanceLoading ? 'animate-spin' : ''}>
                    {balanceLoading ? '⟳' : '↻'}
                  </span>
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {balanceLoading ? (
                      <span className="text-gray-400">Loading...</span>
                    ) : balanceError ? (
                      <span className="text-red-600">Error</span>
                    ) : (
                      `${parseFloat(balance || '0').toFixed(4)} MON`
                    )}
                  </p>
                  <p className="text-sm text-gray-600">Native Token Balance</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Link 
                href="/dashboard"
                className="flex items-center justify-center space-x-2 bg-blue-500 text-white py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors"
              >
                <span className="font-medium">Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors">
                <span className="font-medium">View Transactions</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
