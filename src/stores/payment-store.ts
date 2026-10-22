import { create } from 'zustand'

import { demoPaymentSettings } from '@/data/payment-data'
import type {
  PaymentPricing,
  PaymentProofDeadlineHours,
  PaymentSettings,
  TransferDetails,
} from '@/types/payments'

type PaymentPricingUpdate = Partial<
  Pick<PaymentPricing, 'name' | 'serviceModes' | 'amounts' | 'samePriceForAll' | 'samePriceAmount'>
>

type PaymentStore = {
  settings: PaymentSettings
  addPricingOption: () => void
  removePricingOption: (pricingId: string) => void
  updatePricingOption: (pricingId: string, update: PaymentPricingUpdate) => void
  setProofDeadlineHours: (hours: PaymentProofDeadlineHours) => void
  updateTransferDetails: (update: Partial<TransferDetails>) => void
  resetPaymentSettings: () => void
}

function createPricingId() {
  return `pricing-${Date.now()}`
}

export const usePaymentStore = create<PaymentStore>((set) => ({
  settings: demoPaymentSettings,
  addPricingOption: () =>
    set((state) => ({
      settings: {
        ...state.settings,
        pricingOptions: [
          ...state.settings.pricingOptions,
          {
            id: createPricingId(),
            name: 'Nueva tarifa',
            serviceModes: ['in-person'],
            amounts: { 'in-person': 0 },
            samePriceForAll: false,
            samePriceAmount: 0,
          },
        ],
      },
    })),
  removePricingOption: (pricingId) =>
    set((state) => ({
      settings: {
        ...state.settings,
        pricingOptions: state.settings.pricingOptions.filter(
          (pricing) => pricing.id !== pricingId,
        ),
      },
    })),
  updatePricingOption: (pricingId, update) =>
    set((state) => ({
      settings: {
        ...state.settings,
        pricingOptions: state.settings.pricingOptions.map((pricing) =>
          pricing.id === pricingId ? { ...pricing, ...update } : pricing,
        ),
      },
    })),
  setProofDeadlineHours: (hours) =>
    set((state) => ({
      settings: { ...state.settings, proofDeadlineHours: hours },
    })),
  updateTransferDetails: (update) =>
    set((state) => ({
      settings: {
        ...state.settings,
        transferDetails: { ...state.settings.transferDetails, ...update },
      },
    })),
  resetPaymentSettings: () => set({ settings: demoPaymentSettings }),
}))
