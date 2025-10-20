'use client'

import { useState } from 'react'
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  ArrowLeft,
  ArrowRight,
  Clock,
  DollarSign,
  User,
  Building2,
  Zap,
  Lock
} from 'lucide-react'
import Link from 'next/link'

export default function ApprovePage() {
  const [step, setStep] = useState(1)
  const [isApproved, setIsApproved] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const transactionDetails = {
    amount: '1000 USDC',
    recipient: 'John Doe',
    bankAccount: 'First Bank Nigeria - ****1234',
    conversionRate: '1 USDC = 1,683.80 NGN',
    estimatedAmount: '1,683,800 NGN',
    fee: '0.5%',
    totalFee: '5 USDC',
    netAmount: '995 USDC'
  }

  const securityChecks = [
    { id: 1, name: 'Identity Verification', status: 'completed', description: 'User identity verified through KYC' },
    { id: 2, name: 'Bank Account Verification', status: 'completed', description: 'Bank account ownership confirmed' },
    { id: 3, name: 'Transaction Limits', status: 'completed', description: 'Transaction within daily limits' },
    { id: 4, name: 'Anti-Money Laundering', status: 'pending', description: 'AML checks in progress' },
    { id: 5, name: 'Regulatory Compliance', status: 'pending', description: 'Regulatory approval required' }
  ]

  const handleApprove = async () => {
    setIsProcessing(true)
    // Simulate approval process
    setTimeout(() => {
      setIsApproved(true)
      setIsProcessing(false)
      setStep(3)
    }, 3000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'failed':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/convert" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Approve Release</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Security Review</p>
                <p className="text-xs text-gray-500">Verify transaction details</p>
              </div>
            </div>
            
            <div className="w-16 h-0.5 bg-gray-200"></div>
            
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Approve Release</p>
                <p className="text-xs text-gray-500">Confirm token release</p>
              </div>
            </div>
            
            <div className="w-16 h-0.5 bg-gray-200"></div>
            
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Complete</p>
                <p className="text-xs text-gray-500">Transaction processed</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              {/* Step 1: Security Review */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Shield className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Security Review</h2>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-4">Transaction Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount</span>
                        <span className="font-medium">{transactionDetails.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Recipient</span>
                        <span className="font-medium">{transactionDetails.recipient}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bank Account</span>
                        <span className="font-medium">{transactionDetails.bankAccount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Exchange Rate</span>
                        <span className="font-medium">{transactionDetails.conversionRate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estimated Amount</span>
                        <span className="font-medium text-blue-600">{transactionDetails.estimatedAmount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Security Checks</h3>
                    {securityChecks.map((check) => (
                      <div key={check.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(check.status)}
                          <div>
                            <p className="font-medium text-gray-900">{check.name}</p>
                            <p className="text-sm text-gray-600">{check.description}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(check.status)}`}>
                          {check.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => setStep(2)}
                    className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
                  >
                    Continue to Approval
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              )}

              {/* Step 2: Approve Release */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Lock className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Approve Release</h2>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-6 h-6 text-yellow-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-yellow-800 mb-2">Important Notice</h3>
                        <p className="text-sm text-yellow-700 mb-4">
                          You are about to release {transactionDetails.amount} for conversion to local currency. 
                          This action cannot be undone. Please review all details carefully.
                        </p>
                        <div className="space-y-2 text-sm text-yellow-700">
                          <p>• Funds will be converted at the current exchange rate</p>
                          <p>• Processing time: 1-3 business days</p>
                          <p>• A fee of {transactionDetails.fee} will be deducted</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Final Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Original Amount</span>
                        <span className="font-medium">{transactionDetails.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fee ({transactionDetails.fee})</span>
                        <span className="font-medium">{transactionDetails.totalFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Net Amount</span>
                        <span className="font-medium">{transactionDetails.netAmount}</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between">
                          <span className="text-lg font-semibold">You will receive</span>
                          <span className="text-lg font-bold text-blue-600">{transactionDetails.estimatedAmount}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" required />
                      <span className="text-sm text-gray-700">I understand this action cannot be undone</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" required />
                      <span className="text-sm text-gray-700">I confirm the exchange rate and fees</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" required />
                      <span className="text-sm text-gray-700">I agree to the terms and conditions</span>
                    </label>
                  </div>

                  <div className="flex space-x-4">
                    <button 
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleApprove}
                      disabled={isProcessing}
                      className="flex-1 bg-green-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 mr-2" />
                          Approve Release
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Complete */}
              {step === 3 && (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Release Approved!</h2>
                    <p className="text-gray-600">
                      Your {transactionDetails.amount} has been approved for conversion to {transactionDetails.estimatedAmount}
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Transaction ID</span>
                      <span className="text-sm font-mono text-gray-900">0x1234...5678</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className="text-sm font-medium text-green-600 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approved
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Processing Time</span>
                      <span className="text-sm font-medium text-gray-900">1-3 business days</span>
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
            {/* Transaction Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Amount</span>
                  <span className="text-sm font-medium">{transactionDetails.amount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Recipient</span>
                  <span className="text-sm font-medium">{transactionDetails.recipient}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Exchange Rate</span>
                  <span className="text-sm font-medium">{transactionDetails.conversionRate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Fee</span>
                  <span className="text-sm font-medium">{transactionDetails.fee}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-blue-600">{transactionDetails.estimatedAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Features */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Features</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">End-to-end encryption</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Lock className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">Multi-factor authentication</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">Regulatory compliance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
