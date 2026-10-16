import { createFileRoute } from '@tanstack/react-router'

import { SchedulePage } from '@/features/schedule/components/schedule-page'

export const Route = createFileRoute('/horarios')({
  component: SchedulePage,
})
