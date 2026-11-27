import { SERVICE_MODE_OPTIONS } from '@/lib/service-mode-utils'
import type {
  Appointment,
  AppointmentPricing,
  ServiceMode,
} from '@/types/agenda'
import type { PaymentPricing } from '@/types/payments'

export function getPricingAmount(
  pricing: PaymentPricing,
  serviceMode: ServiceMode,
): number | null {
  if (!pricing.serviceModes.includes(serviceMode)) {
    return null
  }

  return pricing.samePriceForAll
    ? pricing.samePriceAmount
    : pricing.amounts[serviceMode] ?? 0
}

export function hasConfiguredPricingAmount(
  pricing: PaymentPricing,
  serviceMode: ServiceMode,
) {
  const amount = getPricingAmount(pricing, serviceMode)

  return amount !== null && Number.isFinite(amount) && amount > 0
}

export function getConfiguredServiceModes(
  pricing: PaymentPricing | undefined,
): ServiceMode[] {
  if (!pricing) {
    return []
  }

  return SERVICE_MODE_OPTIONS.flatMap(({ value }) =>
    hasConfiguredPricingAmount(pricing, value) ? [value] : [],
  )
}

export function toAppointmentPricing(
  pricing: PaymentPricing,
  serviceMode: ServiceMode,
): AppointmentPricing | null {
  const amount = getPricingAmount(pricing, serviceMode)

  return amount === null
    ? null
    : {
        amount,
        id: pricing.id,
        name: pricing.name,
        serviceMode,
      }
}

export function findPricingForAppointment(
  appointment: Appointment,
  pricingOptions: PaymentPricing[],
): PaymentPricing | undefined {
  const appointmentPricing = appointment.pricing

  if (!appointmentPricing) {
    return undefined
  }

  const matchingId = pricingOptions.find((pricing) => pricing.id === appointmentPricing.id)

  if (matchingId) {
    return matchingId
  }

  const appointmentName = appointmentPricing.name.trim().toLocaleLowerCase()

  return pricingOptions.find(
    (pricing) => pricing.name.trim().toLocaleLowerCase() === appointmentName,
  )
}
