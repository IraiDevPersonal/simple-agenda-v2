import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { AgendaSlotCard } from '@/features/agenda/components/agenda-slot-card'
import type { AgendaSlot } from '@/types/agenda'

const slot = (status: AgendaSlot['status']): AgendaSlot => ({
  date: '2026-08-04',
  endTime: '10:45',
  id: `slot-${status}`,
  serviceMode: 'in-person',
  startTime: '10:00',
  status,
  appointment:
    status === 'pending' || status === 'confirmed'
      ? {
          clientName: 'Ana Pérez',
          date: '2026-08-04',
          id: 'appointment-test',
          serviceName: 'Sesión de prueba',
          startTime: '10:00',
          status,
          proofFileName: status === 'pending' ? 'comprobante.pdf' : undefined,
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
        <AgendaSlotCard slot={slot('pending')} />
        <AgendaSlotCard slot={slot('confirmed')} />
        <AgendaSlotCard slot={slot('blocked')} />
      </ul>,
    )

    expect(screen.getByText('Disponible')).toBeInTheDocument()
    expect(screen.getAllByText('Ana Pérez')).toHaveLength(2)
    expect(screen.getByText('No disponible')).toBeInTheDocument()
    expect(screen.queryByText('Pausa personal')).not.toBeInTheDocument()
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
    expect(screen.getByText('Confirmada')).toBeInTheDocument()
    expect(screen.getByText('Bloqueado')).toBeInTheDocument()
  })

  it('muestra la acción de agenda disponible y la modalidad', async () => {
    const user = userEvent.setup()
    const onBlock = vi.fn()
    const onReserve = vi.fn()

    render(
      <ul>
        <AgendaSlotCard onBlock={onBlock} onReserve={onReserve} slot={slot('available')} />
        <AgendaSlotCard slot={slot('pending')} />
      </ul>,
    )

    const reserveButton = screen.getByRole('button', {
      name: 'Agendar paciente para el bloque de 10:00',
    })
    const availableCard = reserveButton.closest<HTMLElement>('[data-slot="agenda-slot-card"]')

    expect(availableCard).not.toBeNull()

    if (!availableCard) {
      return
    }

    expect(availableCard).toHaveTextContent('Presencial')
    expect(availableCard).toHaveTextContent('Termina a las 10:45')
    expect(availableCard.querySelector('[data-card-section="header"]')).toBeInTheDocument()
    expect(availableCard.querySelector('[data-card-section="body"]')).toBeInTheDocument()
    expect(availableCard.querySelector('[data-card-section="footer"]')).toBeInTheDocument()
    expect(availableCard.querySelector('[data-card-section="footer"]')).toHaveClass('mt-auto')
    expect(availableCard.querySelector('[data-card-section="body"]')).toHaveClass('pb-4')
    expect(reserveButton).toHaveAttribute('title', 'Agendar paciente')
    expect(reserveButton).not.toHaveTextContent('Agendar paciente')
    expect(availableCard).not.toHaveTextContent('Espacio listo para reservar')
    expect(screen.getAllByText('AP')).toHaveLength(1)

    const blockButton = screen.getByRole('button', {
      name: 'Bloquear bloque de 10:00',
    })

    await user.click(blockButton)
    await user.click(reserveButton)

    expect(onBlock).toHaveBeenCalledWith(expect.objectContaining({ status: 'available' }))
    expect(onReserve).toHaveBeenCalledWith(expect.objectContaining({ status: 'available' }))
  })

  it('expone las acciones mínimas para gestionar una reserva', () => {
    render(
      <ul>
        <AgendaSlotCard
          onCancel={() => undefined}
          onConfirm={() => undefined}
          onReschedule={() => undefined}
          onReserve={() => undefined}
          slot={slot('available')}
        />
        <AgendaSlotCard
          onCancel={() => undefined}
          onConfirm={() => undefined}
          onReserve={() => undefined}
          slot={slot('pending')}
        />
        <AgendaSlotCard
          onReschedule={() => undefined}
          slot={slot('confirmed')}
        />
      </ul>,
    )

    expect(
      screen.getByRole('button', { name: 'Agendar paciente para el bloque de 10:00' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirmar comprobante de Ana Pérez' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar reserva de Ana Pérez' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reagendar cita de Ana Pérez' })).toBeInTheDocument()
  })

  it('ofrece desbloquear los bloqueos creados desde la agenda', async () => {
    const user = userEvent.setup()
    const blockedSlot = {
      ...slot('blocked'),
      appointment: {
        ...slot('blocked').appointment!,
        id: 'blocked-slot-2026-08-04-10-00',
      },
    }
    const onUnblock = vi.fn()

    render(
      <ul>
        <AgendaSlotCard onUnblock={onUnblock} slot={blockedSlot} />
      </ul>,
    )

    const unblockButton = screen.getByRole('button', {
      name: 'Desbloquear bloque de 10:00',
    })

    await user.click(unblockButton)

    expect(onUnblock).toHaveBeenCalledWith(blockedSlot)
  })

  it('ofrece revisar el comprobante adjunto', () => {
    const pendingSlot = slot('pending')

    pendingSlot.appointment = {
      ...pendingSlot.appointment!,
      proofFileUrl: '/demo/comprobante-transferencia.svg',
    }

    render(
      <ul>
        <AgendaSlotCard slot={pendingSlot} />
      </ul>,
    )

    expect(
      screen.getByRole('link', { name: 'Descargar comprobante de Ana Pérez' }),
    ).toHaveAttribute('href', '/demo/comprobante-transferencia.svg')
    expect(screen.getByTitle('Descargar comprobante')).toHaveAttribute('download', 'comprobante.pdf')
  })
})
