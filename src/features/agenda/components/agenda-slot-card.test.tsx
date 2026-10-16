import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AgendaSlotCard } from '@/features/agenda/components/agenda-slot-card'
import type { AgendaSlot } from '@/types/agenda'

const slot = (status: AgendaSlot['status']): AgendaSlot => ({
  date: '2026-08-04',
  endTime: '10:45',
  id: `slot-${status}`,
  startTime: '10:00',
  status,
  appointment:
    status === 'reserved'
      ? {
          clientName: 'Ana Pérez',
          date: '2026-08-04',
          id: 'appointment-test',
          serviceName: 'Sesión de prueba',
          startTime: '10:00',
          status: 'reserved',
        }
      : status === 'blocked'
        ? {
            date: '2026-08-04',
            id: 'break-test',
            label: 'Pausa personal',
            startTime: '10:00',
            status: 'blocked',
          }
        : undefined,
})

describe('AgendaSlotCard', () => {
  it('diferencia visual y textualmente los estados del bloque', () => {
    render(
      <ul>
        <AgendaSlotCard slot={slot('available')} />
        <AgendaSlotCard slot={slot('reserved')} />
        <AgendaSlotCard slot={slot('blocked')} />
      </ul>,
    )

    expect(screen.getByText('Disponible')).toBeInTheDocument()
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument()
    expect(screen.getByText('Pausa personal')).toBeInTheDocument()
    expect(screen.getByText('Reservada')).toBeInTheDocument()
    expect(screen.getByText('Bloqueado')).toBeInTheDocument()
  })
})
