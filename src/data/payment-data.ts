import type { PaymentSettings } from '@/types/payments'

export const demoPaymentSettings: PaymentSettings = {
  pricingOptions: [
    {
      id: 'pricing-particular',
      name: 'Particular',
      serviceModes: ['in-person', 'remote', 'home-visit'],
      amounts: {
        'in-person': 35000,
        remote: 30000,
        'home-visit': 40000,
      },
      samePriceForAll: false,
      samePriceAmount: 35000,
    },
    {
      id: 'pricing-fonasa',
      name: 'Fonasa',
      serviceModes: ['in-person', 'remote', 'home-visit'],
      amounts: {
        'in-person': 25000,
        remote: 25000,
        'home-visit': 25000,
      },
      samePriceForAll: true,
      samePriceAmount: 25000,
    },
    {
      id: 'pricing-online',
      name: 'Consulta online',
      serviceModes: ['remote'],
      amounts: { remote: 30000 },
      samePriceForAll: true,
      samePriceAmount: 30000,
    },
  ],
  proofDeadlineHours: 3,
  transferDetails: {
    bank: 'Banco de Chile',
    accountType: 'checking',
    accountNumber: '123456789',
    rut: '12.345.678-9',
    email: 'pagos@ejemplo.cl',
  },
}
