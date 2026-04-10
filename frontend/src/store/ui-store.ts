import { create } from 'zustand'

interface UIState {
  isRegistrationOpen: boolean
  openRegistration: () => void
  closeRegistration: () => void
  toggleRegistration: () => void

  // Integration Drawer
  isIntegrationOpen: boolean
  selectedSvcForIntegration: any | null
  openIntegration: (svc: any) => void
  closeIntegration: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isRegistrationOpen: false,
  openRegistration: () => set({ isRegistrationOpen: true }),
  closeRegistration: () => set({ isRegistrationOpen: false }),
  toggleRegistration: () =>
    set((state) => ({ isRegistrationOpen: !state.isRegistrationOpen })),

  isIntegrationOpen: false,
  selectedSvcForIntegration: null,
  openIntegration: (svc) =>
    set({ isIntegrationOpen: true, selectedSvcForIntegration: svc }),
  closeIntegration: () =>
    set({ isIntegrationOpen: false, selectedSvcForIntegration: null }),
}))
