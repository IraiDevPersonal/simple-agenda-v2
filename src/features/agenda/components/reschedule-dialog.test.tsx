import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RescheduleDialog } from '@/features/agenda/components/reschedule-dialog'
import type { Appointment, ScheduleSegment } from '@/types/agenda'
import type { PaymentPricing } from '@/types/payments'

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

const multiModeScheduleSegments: ScheduleSegment[] = [
  ...scheduleSegments,
  {
    blockCount: 1,
    enabled: true,
    id: 'segment-friday-remote-test',
    serviceMode: 'remote',
    startTime: '12:00',
    weekday: 'friday',
  },
]

const pricingOptions: PaymentPricing[] = [
  {
    amounts: {
      'home-visit': 40000,
      'in-person': 35000,
      remote: 30000,
    },
    id: 'pricing-particular',
    name: 'Particular',
    samePriceAmount: 35000,
    samePriceForAll: false,
    serviceModes: ['in-person', 'remote', 'home-visit'],
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
        pricingOptions={pricingOptions}
        proofDeadlineHours={3}
        scheduleSegments={scheduleSegments}
      />,
    )

    expect(screen.getByRole('button', { name: /11:15.*Termina a las 12:00/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /09:45.*Termina a las 10:30/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /10:30.*Termina a las 11:15/ })).not.toBeInTheDocument()
  })

  it('filtra por modalidad y envía el precio de la modalidad elegida', async () => {
    const onSubmit = vi.fn(() => true)

    render(
      <RescheduleDialog
        appointment={appointment}
        appointments={[appointment]}
        appointmentBufferMinutes={0}
        blockedDates={[]}
        onClose={vi.fn()}
        onSubmit={onSubmit}
        pricingOptions={pricingOptions}
        proofDeadlineHours={3}
        scheduleSegments={multiModeScheduleSegments}
      />,
    )

    expect(screen.getByRole('combobox', { name: 'Modalidad' })).toHaveValue('all')
    expect(screen.getByRole('option', { name: 'Todas' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Todas las modalidades' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /12:00.*remoto.*\$30\.000/i })).toBeInTheDocument()

    fireEvent.change(screen.getByRole('combobox', { name: 'Modalidad' }), {
      target: { value: 'remote' },
    })

    expect(screen.queryByRole('button', { name: /11:15.*presencial/i })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /12:00.*remoto.*\$30\.000/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar horario' }))

    expect(onSubmit).toHaveBeenCalledWith({
      date: '2026-11-20',
      keepCurrentPrice: false,
      pricing: {
        amount: 30000,
        id: 'pricing-particular',
        name: 'Particular',
        serviceMode: 'remote',
      },
      proofDeadlineHours: 3,
      startTime: '12:00',
    })
  })

  it('oculta modalidades sin precio configurado', () => {
    render(
      <RescheduleDialog
        appointment={appointment}
        appointments={[appointment]}
        appointmentBufferMinutes={0}
        blockedDates={[]}
        onClose={vi.fn()}
        onSubmit={vi.fn(() => true)}
        pricingOptions={[{ ...pricingOptions[0], serviceModes: ['remote'], amounts: { remote: 30000 } }]}
        proofDeadlineHours={3}
        scheduleSegments={multiModeScheduleSegments}
      />,
    )

    const modeSelect = screen.getByRole('combobox', { name: 'Modalidad' })

    expect(screen.getByRole('option', { name: 'Remoto' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Presencial' })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'A domicilio' })).not.toBeInTheDocument()
    expect(modeSelect).toHaveValue('all')
  })
})
