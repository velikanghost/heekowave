'use client'

import { useState } from 'react'
import { 
  ArrowUpDown, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  TrendingUp,
  ArrowLeft,
  ArrowRight,
  Shield,
  Zap
} from 'lucide-react'
import Link from 'next/link'

export default function ConvertPage() {
  const [step, setStep] = useState(1)
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [fromCurrency, setFromCurrency] = useState('USDC')
  const [toCurrency, setToCurrency] = useState('NGN')
  const [bankAccount, setBankAccount] = useState('')

  const conversionRate = 1683.80
  const estimatedAmount = fromAmount ? (parseFloat(fromAmount) * conversionRate).toFixed(2) : '0.00'

  const steps = [
    { id: 1, title: 'Select Amount', description: 'Choose how much you want to convert' },
    { id: 2, title: 'Review Details', description: 'Confirm your conversion details' },
    { id: 3, title: 'Approve Release', description: 'Approve the token release' },
    { id: 4, title: 'Complete', description: 'Your conversion is complete' }
  ]

  const bankAccounts = [
    { id: 1, name: 'First Bank Nigeria', account: '****1234', type: 'Savings' },
    { id: 2, name: 'Access Bank', account: '****5678', type: 'Current' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Convert Currency</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((stepItem, index) => (
              <div key={stepItem.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= stepItem.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {step > stepItem.id ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{stepItem.id}</span>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    step >= stepItem.id ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {stepItem.title}
                  </p>
                  <p className="text-xs text-gray-500">{stepItem.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step > stepItem.id ? 'bg-blue-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              {/* Step 1: Select Amount */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Amount</h2>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From
                      </label>
                      <div className="space-y-3">
                        <select 
                          value={fromCurrency}
                          onChange={(e) => setFromCurrency(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="USDC">USDC</option>
                          <option value="ETH">ETH</option>
                        </select>
                        <input
                          type="number"
                          value={fromAmount}
                          onChange={(e) => setFromAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        To
                      </label>
                      <div className="space-y-3">
                        <select 
                          value={toCurrency}
                          onChange={(e) => setToCurrency(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="NGN">NGN</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                        </select>
                        <input
                          type="number"
                          value={toAmount}
                          onChange={(e) => setToAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Exchange Rate</span>
                      <span className="text-sm font-medium text-gray-900">1 USDC = {conversionRate} NGN</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-600">Estimated Amount</span>
                      <span className="text-lg font-bold text-blue-600">{estimatedAmount} NGN</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setStep(2)}
                    className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              )}

              {/* Step 2: Review Details */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Details</h2>
                  
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Converting</span>
                      <span className="font-medium">{fromAmount} {fromCurrency}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">To</span>
                      <span className="font-medium">{estimatedAmount} {toCurrency}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Exchange Rate</span>
                      <span className="font-medium">1 {fromCurrency} = {conversionRate} {toCurrency}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Fee</span>
                      <span className="font-medium">0.5%</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-lg font-bold text-blue-600">{estimatedAmount} {toCurrency}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button 
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => setStep(3)}
                      className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                    >
                      Approve Release
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Approve Release */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Approve Release</h2>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-6 h-6 text-yellow-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-yellow-800 mb-2">Security Notice</h3>
                        <p className="text-sm text-yellow-700">
                          You are about to release {fromAmount} {fromCurrency} for conversion to {toCurrency}. 
                          This action cannot be undone. Please review all details carefully.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                      <span className="text-sm text-gray-700">I understand the conversion rate and fees</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                      <span className="text-sm text-gray-700">I confirm this conversion is correct</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                      <span className="text-sm text-gray-700">I agree to the terms and conditions</span>
                    </label>
                  </div>

                  <div className="flex space-x-4">
                    <button 
                      onClick={() => setStep(2)}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => setStep(4)}
                      className="flex-1 bg-green-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Approve & Convert
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Complete */}
              {step === 4 && (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Conversion Complete!</h2>
                    <p className="text-gray-600">
                      Your {fromAmount} {fromCurrency} has been successfully converted to {estimatedAmount} {toCurrency}
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Transaction ID</span>
                      <span className="text-sm font-mono text-gray-900">0x1234...5678</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className="text-sm font-medium text-green-600 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Completed
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Link 
                      href="/dashboard"
                      className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
                    >
                      Back to Dashboard
                    </Link>
                    <button className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors">
                      View Transaction
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Conversion Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">From</span>
                  <span className="text-sm font-medium">{fromAmount} {fromCurrency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">To</span>
                  <span className="text-sm font-medium">{estimatedAmount} {toCurrency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rate</span>
                  <span className="text-sm font-medium">1 {fromCurrency} = {conversionRate} {toCurrency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Fee</span>
                  <span className="text-sm font-medium">0.5%</span>
                </div>
              </div>
            </div>

            {/* Bank Accounts */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Accounts</h3>
              <div className="space-y-3">
                {bankAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{account.name}</p>
                      <p className="text-xs text-gray-500">{account.account} • {account.type}</p>
                    </div>
                    <button className="text-blue-600 text-sm font-medium">Select</button>
                  </div>
                ))}
                <button className="w-full flex items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors">
                  <span className="text-sm font-medium">Add New Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
