import { create } from 'zustand'

interface UIState {
  isRegistrationOpen: boolean
  openRegistration: () => void
  closeRegistration: () => void
  toggleRegistration: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isRegistrationOpen: false,
  openRegistration: () => set({ isRegistrationOpen: true }),
  closeRegistration: () => set({ isRegistrationOpen: false }),
  toggleRegistration: () => set((state) => ({ isRegistrationOpen: !state.isRegistrationOpen })),
}))
