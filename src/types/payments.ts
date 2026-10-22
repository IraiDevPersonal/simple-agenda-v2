import type { ServiceMode } from '@/types/agenda'

export const PAYMENT_PROOF_DEADLINE_OPTIONS = [
  { value: 0, label: 'No requiere comprobante' },
  { value: 1, label: '1 hora' },
  { value: 3, label: '3 horas' },
  { value: 6, label: '6 horas' },
  { value: 12, label: '12 horas' },
  { value: 24, label: '1 día' },
] as const

export type PaymentProofDeadlineHours =
  (typeof PAYMENT_PROOF_DEADLINE_OPTIONS)[number]['value']

export const BANK_ACCOUNT_TYPE_OPTIONS = [
  { value: 'checking', label: 'Cuenta corriente' },
  { value: 'sight', label: 'Cuenta vista' },
  { value: 'rut', label: 'Cuenta RUT' },
  { value: 'savings', label: 'Cuenta de ahorro' },
] as const

export type BankAccountType = (typeof BANK_ACCOUNT_TYPE_OPTIONS)[number]['value']

export type PaymentPricing = {
  id: string
  name: string
  serviceModes: ServiceMode[]
  amounts: Partial<Record<ServiceMode, number>>
  samePriceForAll: boolean
  samePriceAmount: number
}

export type TransferDetails = {
  bank: string
  accountType: BankAccountType
  accountNumber: string
  rut: string
  email: string
}

export type PaymentSettings = {
  pricingOptions: PaymentPricing[]
  proofDeadlineHours: PaymentProofDeadlineHours
  transferDetails: TransferDetails
}
