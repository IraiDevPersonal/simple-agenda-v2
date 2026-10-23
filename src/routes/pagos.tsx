import { createFileRoute } from '@tanstack/react-router'

import { PaymentPage } from '@/features/payments/components/payment-page'

export const Route = createFileRoute('/pagos')({
  component: PaymentPage,
})
