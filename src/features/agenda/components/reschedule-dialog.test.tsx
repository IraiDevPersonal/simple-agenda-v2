import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RescheduleDialog } from '@/features/agenda/components/reschedule-dialog'
import type { Appointment, ScheduleSegment } from '@/types/agenda'

const appointment: Appointment = {
  clientName: 'Valentina Soto',
  date: '2026-11-20',
  id: 'appointment-current',
  pricing: {
    amount: 35000,
    id: 'pricing-in-person',
    name: 'Particular',
    serviceMode: 'in-person',
  },
  startTime: '09:00',
  status: 'confirmed',
}

const scheduleSegments: ScheduleSegment[] = [
  {
    blockCount: 4,
    enabled: true,
    id: 'segment-friday-test',
    serviceMode: 'in-person',
    startTime: '09:00',
    weekday: 'friday',
  },
]

describe('RescheduleDialog', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-20T13:30:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('muestra sólo los horarios futuros del día actual', () => {
    render(
      <RescheduleDialog
        appointment={appointment}
        appointments={[appointment]}
        appointmentBufferMinutes={0}
        blockedDates={[]}
        onClose={vi.fn()}
        onSubmit={vi.fn(() => true)}
        scheduleSegments={scheduleSegments}
        serviceMode="in-person"
      />,
    )

    expect(screen.getByRole('button', { name: /11:15.*Termina a las 12:00/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /09:45.*Termina a las 10:30/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /10:30.*Termina a las 11:15/ })).not.toBeInTheDocument()
  })
})
