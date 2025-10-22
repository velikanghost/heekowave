'use client'

import DelegationCreator from '../components/DelegationCreator'
import SimplePayment from '../components/SimplePayment'

export default function TestPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Heekowave Test Page</h1>
        <p className="text-muted-foreground">
          Test delegation creation and gasless payments
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Step 1: Create Delegation */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Step 1: Create Delegation
          </h2>
          <DelegationCreator />
        </div>

        {/* Step 2: Make Payment */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Step 2: Make Payment</h2>
          <SimplePayment />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="font-semibold mb-2">Testing Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Connect your wallet (top right)</li>
          <li>
            Create a delegation in Step 1 (set max amount and relayer address)
          </li>
          <li>Wait for delegation to be stored in database</li>
          <li>
            Make a payment in Step 2 (amount must be within delegation limit)
          </li>
          <li>Check console for detailed logs</li>
        </ol>
      </div>
    </div>
  )
}
