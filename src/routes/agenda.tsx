import { createFileRoute } from '@tanstack/react-router'

import { AgendaPage } from '@/features/agenda/components/agenda-page'
import { isValidDateKey } from '@/lib/date-utils'
import type { DateKey } from '@/types/agenda'

type AgendaSearch = {
  date?: DateKey
}

export const Route = createFileRoute('/agenda')({
  validateSearch: (search): AgendaSearch => ({
    date: isValidDateKey(search.date) ? search.date : undefined,
  }),
  component: AgendaPage,
})
