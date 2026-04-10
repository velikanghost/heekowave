import { create } from 'zustand'

interface Service {
  id: string
  name: string
  provider: string
  price: string
  endpoint: string
  tags: string[]
}

interface ServicesState {
  services: Service[]
  isLoading: boolean
  error: string | null
  fetchServices: () => Promise<void>
}

export const useServicesStore = create<ServicesState>((set) => ({
  services: [],
  isLoading: false,
  error: null,
  fetchServices: async () => {
    set({ isLoading: true })
    try {
      const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3002'
      const res = await fetch(`${GATEWAY_URL}/proxy/registry`)
      if (!res.ok) throw new Error('Failed to fetch services')
      const data = await res.json()
      set({ services: data, error: null })
    } catch (err: any) {
      set({ error: err.message })
    } finally {
      set({ isLoading: false })
    }
  },
}))
