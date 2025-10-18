'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useWeb3AuthConnect } from '@web3auth/modal/react'
import { useAccount, useSendTransaction } from 'wagmi'
import { createPublicClient, http, formatEther } from 'viem'
import { monadTestnet } from 'viem/chains'
import { QRCodeSVG } from 'qrcode.react'

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
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          MetaMask Embedded Wallet
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Connect and manage your MetaMask wallet
        </p>
      </div>

      {/* Action Buttons Section */}
      <div className="space-y-8">
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => connect()}
            disabled={isConnected}
            className={`font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md ${
              isConnected
                ? 'bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white hover:shadow-lg'
            }`}
          >
            {isConnected ? 'Connected' : 'Connect Wallet'}
          </button>
        </div>

        {/* Wallet Information Section */}
        {isConnected && walletAddress && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center">
              <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                💳
              </span>
              MetaMask Wallet
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  Address
                </label>
                <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-4 flex items-center justify-between gap-3">
                  <span className="font-mono text-sm text-slate-800 dark:text-slate-200 break-all">
                    {walletAddress}
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="flex-shrink-0 p-2 rounded-md bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-300 transition-colors duration-200"
                    title={copied ? 'Copied!' : 'Copy address'}
                  >
                    {copied ? '✓' : '📋'}
                  </button>
                </div>

                {/* QR Code Section */}
                <div className="mt-4 flex flex-col items-center">
                  <div className="bg-white p-4 rounded-xl shadow-md">
                    <QRCodeSVG
                      value={walletAddress || ''}
                      size={200}
                      level="H"
                      includeMargin={true}
                      className="w-full h-full"
                    />
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Scan to send funds to this wallet
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
                    Balance
                  </label>
                  <button
                    onClick={fetchBalance}
                    disabled={balanceLoading}
                    title="Refresh balance"
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      balanceLoading
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span className={balanceLoading ? 'animate-spin' : ''}>
                      {balanceLoading ? '⟳' : '↻'}
                    </span>
                  </button>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {balanceLoading ? (
                      <span className="text-slate-500 dark:text-slate-400">
                        Loading...
                      </span>
                    ) : balanceError ? (
                      <span className="text-red-600 dark:text-red-400">
                        Error loading balance
                      </span>
                    ) : (
                      `${parseFloat(balance || '0').toFixed(4)} MON`
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Section */}
        {isConnected && walletAddress && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center">
              <span className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                💸
              </span>
              Send Transaction
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  Recipient Address
                </label>
                <input
                  value={userAddress || ''}
                  onChange={(e) => setUserAddress(e.target.value)}
                  placeholder="Enter recipient address"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 font-mono text-sm"
                />
              </div>

              <button
                onClick={onSendTransaction}
                disabled={
                  !isConnected ||
                  !userAddress ||
                  transactionStatus === 'pending'
                }
                className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors duration-200 ${
                  !isConnected ||
                  !userAddress ||
                  transactionStatus === 'pending'
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white shadow-md hover:shadow-lg'
                }`}
              >
                {!isConnected
                  ? 'Please connect wallet first'
                  : transactionStatus === 'pending'
                  ? 'Sending...'
                  : 'Send 0.001 MON'}
              </button>

              {/* Transaction Status */}
              {transactionStatus !== 'idle' && (
                <div className="mt-4 space-y-2">
                  {transactionStatus === 'pending' && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="animate-spin mr-3 w-5 h-5 border-2 border-yellow-500 dark:border-yellow-400 border-t-transparent rounded-full"></div>
                        <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                          Transaction pending...
                        </span>
                      </div>
                    </div>
                  )}

                  {transactionStatus === 'success' && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="text-green-800 dark:text-green-200 font-medium mr-2">
                            ✅ Transaction successful!
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {transactionStatus === 'error' && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-center">
                        <span className="text-red-800 dark:text-red-200 font-medium">
                          ❌ Transaction failed. Please try again.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
