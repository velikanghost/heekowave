import { create } from 'zustand'

interface Stats {
  registryCount: number
  totalVolume: string
  activeAgents: number
}

interface StatsState {
  stats: Stats
  isLoading: boolean
  error: string | null
  fetchStats: () => Promise<void>
}

export const useStatsStore = create<StatsState>((set) => ({
  stats: {
    registryCount: 0,
    totalVolume: '0.00',
    activeAgents: 0,
  },
  isLoading: false,
  error: null,
  fetchStats: async () => {
    set({ isLoading: true })
    try {
      const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3002'
      const res = await fetch(`${GATEWAY_URL}/proxy/stats`)
      if (!res.ok) throw new Error('Failed to fetch stats')
      const data = await res.json()
      set({ stats: data, error: null })
    } catch (err: any) {
      set({ error: err.message })
    } finally {
      set({ isLoading: false })
    }
  },
}))
