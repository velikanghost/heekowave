import { create } from 'zustand'

interface Service {
  id: string
  name: string
  slug: string
  provider: string
  price: string
  endpoint: string
  tags: string[]
  isPending?: boolean
}

interface ServicesState {
  services: Service[]
  isLoading: boolean
  error: string | null
  fetchServices: () => Promise<void>
  addOptimisticService: (service: Omit<Service, 'id'>) => string
  setPending: (tempId: string, isPending: boolean) => void
  removeService: (id: string) => void
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
      
      set((state) => {
        // Keep optimistic services that aren't in the new data yet
        const incomingSlugs = new Set(data.map((s: any) => s.slug));
        const pendingToKeep = state.services.filter(
          (s) => s.isPending && !incomingSlugs.has(s.slug)
        );
        
        return { 
          services: [...pendingToKeep, ...data], 
          error: null 
        };
      })
    } catch (err: any) {
      set({ error: err.message })
    } finally {
      set({ isLoading: false })
    }
  },
  addOptimisticService: (service) => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    set((state) => ({
      services: [{ ...service, id: tempId, isPending: true }, ...state.services],
    }))
    return tempId
  },
  setPending: (tempId, isPending) => {
    set((state) => ({
      services: state.services.map((s) =>
        s.id === tempId ? { ...s, isPending } : s,
      ),
    }))
  },
  removeService: (id) => {
    set((state) => ({
      services: state.services.filter((s) => s.id !== id),
    }))
  },
}))
