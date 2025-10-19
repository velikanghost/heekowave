import type { Metadata } from 'next'

import Web3Auth from './components/Web3Auth'
import SmartAccountManager from './components/SmartAccountManager'
import DelegationCreator from './components/DelegationCreator'
import PaymentInterface from './components/PaymentInterface'
import WithdrawalInterface from './components/WithdrawalInterface'
import ContractAddresses from './components/ContractAddresses'
import { InstallPWA } from './components/InstallPWA'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const metadata: Metadata = {
  title: 'Heekowave - Smart Account Payments',
}

export default function Page() {
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            Heekowave
          </h1>
          <p className="text-lg text-muted-foreground">
            Smart Account Payments with Delegation
          </p>
        </div>

        <div className="space-y-8">
          {/* Wallet Connection */}
          <Web3Auth />

          {/* Smart Account Management */}
          <SmartAccountManager />

          {/* Delegation Creation */}
          <DelegationCreator />

          {/* Contract Interactions */}
          <Tabs defaultValue="payments" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            </TabsList>

            <TabsContent value="payments">
              <PaymentInterface />
            </TabsContent>

            <TabsContent value="withdrawals">
              <WithdrawalInterface />
            </TabsContent>
          </Tabs>

          {/* Contract Addresses Reference */}
          <ContractAddresses />
        </div>
      </div>
      <InstallPWA />
    </div>
  )
}
