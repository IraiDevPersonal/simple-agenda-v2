import { create } from 'zustand'

import { demoProfessionalProfile } from '@/data/profile-data'
import type { ProfessionalProfile } from '@/types/profile'

type ProfileStore = {
  profile: ProfessionalProfile
  updateProfile: (update: Partial<ProfessionalProfile>) => void
  resetProfile: () => void
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: demoProfessionalProfile,
  updateProfile: (update) =>
    set((state) => ({
      profile: { ...state.profile, ...update },
    })),
  resetProfile: () => set({ profile: demoProfessionalProfile }),
}))
