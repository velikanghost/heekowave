'use client'

import { useState } from 'react'
import { 
  Send, 
  ArrowUpDown, 
  CreditCard, 
  History, 
  Settings, 
  Wallet,
  Plus,
  ArrowRight,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  LogOut
} from 'lucide-react'
import Web3Auth from '../components/Web3Auth'
import { useAccount, useDisconnect } from 'wagmi'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('send')
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  
  const { address, isConnected: wagmiConnected } = useAccount()
  const { disconnect } = useDisconnect()

  const handleLogout = () => {
    disconnect()
    setIsConnected(false)
  }

  const recentTransactions = [
    { id: 1, type: 'sent', amount: '100 USDC', to: '0x1234...5678', time: '2 min ago', status: 'completed' },
    { id: 2, type: 'received', amount: '50 USDC', from: '0x9876...5432', time: '1 hour ago', status: 'completed' },
    { id: 3, type: 'conversion', amount: '200 USDC → NGN', time: '3 hours ago', status: 'pending' },
  ]

  const stats = [
    { label: 'Total Balance', value: '1,250 USDC', icon: DollarSign, color: 'text-green-600' },
    { label: 'This Month', value: '+$2,450', icon: TrendingUp, color: 'text-blue-600' },
    { label: 'Transactions', value: '24', icon: History, color: 'text-purple-600' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {wagmiConnected && address && (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </p>
                    <p className="text-xs text-gray-500">Connected</p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              )}
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              {wagmiConnected && (
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              )}
              {!wagmiConnected && (
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Wallet Connection */}
        {!wagmiConnected && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Wallet className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-6">
                Connect your MetaMask Smart Account to access your dashboard and start making P2P payments.
              </p>
              <Web3Auth />
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {wagmiConnected && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {wagmiConnected && (
          <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              
              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
                <button
                  onClick={() => setActiveTab('send')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'send' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Send Payment
                </button>
                <button
                  onClick={() => setActiveTab('convert')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'convert' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Convert Currency
                </button>
                <button
                  onClick={() => setActiveTab('withdraw')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'withdraw' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Withdraw
                </button>
              </div>

              {/* Send Payment Form */}
              {activeTab === 'send' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipient Address
                    </label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="0x..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (USDC)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <button className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center">
                    <Send className="w-5 h-5 mr-2" />
                    Send Payment
                  </button>
                </div>
              )}

              {/* Convert Currency Form */}
              {activeTab === 'convert' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From
                      </label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option>USDC</option>
                        <option>ETH</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        To
                      </label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option>NGN</option>
                        <option>USD</option>
                        <option>EUR</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <button className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center">
                    <ArrowUpDown className="w-5 h-5 mr-2" />
                    Convert Currency
                  </button>
                </div>
              )}

              {/* Withdraw Form */}
              {activeTab === 'withdraw' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Account
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option>Select Bank Account</option>
                      <option>Add New Account</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (USDC)
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <button className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-600 transition-colors flex items-center justify-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Request Withdrawal
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
              <div className="space-y-4">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'sent' ? 'bg-red-100' : 
                      tx.type === 'received' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {tx.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{tx.amount}</p>
                      <p className="text-xs text-gray-500">{tx.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <span className="text-sm font-medium text-gray-900">Add Bank Account</span>
                  <Plus className="w-4 h-4 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <span className="text-sm font-medium text-gray-900">View All Transactions</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <span className="text-sm font-medium text-gray-900">Settings</span>
                  <Settings className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
