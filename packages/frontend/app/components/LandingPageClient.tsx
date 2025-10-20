'use client'

import { useState, useEffect } from 'react'
import { Shield, Zap, Wallet, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useWeb3AuthConnect } from '@web3auth/modal/react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import SendNotification from './SendNotification'
import { InstallPWA } from './InstallPWA'

export default function LandingPageClient() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle')
  
  const { connect } = useWeb3AuthConnect()
  const { address, isConnected } = useAccount()
  const router = useRouter()

  const handleConnect = async () => {
    setIsConnecting(true)
    setConnectionStatus('connecting')
    
    try {
      await connect()
      setConnectionStatus('success')
      
      // Redirect to dashboard after successful connection
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (error) {
      console.error('Connection failed:', error)
      setConnectionStatus('error')
    } finally {
      setIsConnecting(false)
    }
  }

  // Redirect to dashboard when already connected
  useEffect(() => {
    if (isConnected && address) {
      router.push('/dashboard')
    }
  }, [isConnected, address, router])

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm"></div>
          </div>
          <span className="text-xl font-semibold text-gray-900">Heekowave</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</Link>
          <Link href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About</Link>
          <Link href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors">FAQ</Link>
        </div>
        
        <button 
          onClick={handleConnect}
          disabled={isConnecting}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnecting ? 'Connecting...' : 'Get Started'}
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              The Future of<br />
              <span className="text-blue-500">Peer-to-Peer Payments</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Experience fast, secure, and decentralized transactions powered by MetaMask Smart Accounts and Monad.
            </p>
            <button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="inline-flex items-center bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isConnecting ? 'Connecting...' : 'Get Started'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our application leverages the best of decentralized technology to provide a seamless and secure payment experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart & Secure</h3>
              <p className="text-gray-600">
                Utilizing MetaMask Smart Accounts for enhanced security and programmable transactions.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Wallet className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Direct P2P Transfers</h3>
              <p className="text-gray-600">
                Send and receive USDC payments directly between users with instant settlement.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Lightning-Fast Indexing</h3>
              <p className="text-gray-600">
                Envio Indexing ensures that your transactions are recorded and retrieved with unparalleled speed and reliability.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Try It Now</h2>
            <p className="text-xl text-gray-600">
              Connect your wallet and start making P2P payments in seconds.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
            <p className="text-gray-600 mb-6">
              Connect your MetaMask Smart Account and start making P2P payments in seconds.
            </p>
            <button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="inline-flex items-center bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet & Start'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <SendNotification />
      <InstallPWA />
    </div>
  )
}
