'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { Navbar } from '@/components/navbar'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLandingPage = pathname === '/'

  if (isLandingPage) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-black overflow-hidden truncate">
      <Sidebar />
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen max-h-screen">
        <Navbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
