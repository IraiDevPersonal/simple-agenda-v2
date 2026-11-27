import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import { routeTree } from '@/routeTree.gen'
import { useAgendaStore } from '@/stores/agenda-store'
import { usePaymentStore } from '@/stores/payment-store'

describe('AgendaPage', () => {
  beforeEach(() => {
    useAgendaStore.getState().resetDemoData()
    usePaymentStore.getState().resetPaymentSettings()
  })

  it('crea, confirma y reagenda una reserva desde la agenda', async () => {
    const user = userEvent.setup()
    const router = createRouter({
      history: createMemoryHistory({
        initialEntries: ['/agenda?date=2026-08-04'],
      }),
      routeTree,
    })

    render(<RouterProvider router={router} />)

    expect(await screen.findByRole('heading', { name: 'Mi agenda' })).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Agendar paciente para el bloque de 12:00' }),
    )
    await user.type(screen.getByLabelText('RUT'), '12.345.678-5')
    await user.click(screen.getByRole('button', { name: 'Buscar paciente por RUT' }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByRole('button', { name: 'Reservar cita' }))

    const file = new File(['comprobante'], 'sofia-comprobante.pdf', { type: 'application/pdf' })
    await user.upload(screen.getByLabelText('Archivo de comprobante'), file)
    await user.click(screen.getByRole('button', { name: 'Listo' }))

    expect(screen.getAllByText('Camila Rojas').length).toBeGreaterThan(0)
    expect(
      screen.getByRole('button', { name: 'Confirmar comprobante de Camila Rojas' }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Confirmar comprobante de Camila Rojas' }),
    )
    expect(screen.getAllByText('Confirmada').length).toBeGreaterThan(0)

    const rescheduleButtons = screen.getAllByRole('button', {
      name: 'Reagendar cita de Camila Rojas',
    })
    await user.click(rescheduleButtons.at(-1)!)

    const dateInput = screen.getByLabelText('Nueva fecha')
    await user.click(dateInput)

    const datePicker = screen.getByRole('dialog', { name: 'Selector de fecha' })
    await user.click(within(datePicker).getByRole('button', { name: 'Mes siguiente' }))
    await user.click(
      within(datePicker).getByRole('button', { name: /martes, 1 de diciembre/i }),
    )
    await user.click(screen.getByRole('button', { name: /09:00.*Termina a las 09:45/ }))
    await user.click(screen.getByRole('button', { name: 'Confirmar horario' }))

    expect(await screen.findByText('Camila Rojas')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reagendar cita de Camila Rojas' })).toBeInTheDocument()
  }, 10000)

  it('filtra la agenda por estado y permite volver a mostrar todos los bloques', async () => {
    const user = userEvent.setup()
    const router = createRouter({
      history: createMemoryHistory({
        initialEntries: ['/agenda?date=2026-11-20'],
      }),
      routeTree,
    })

    render(<RouterProvider router={router} />)

    expect(await screen.findByRole('heading', { name: 'Mi agenda' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Filtrar por pendiente/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    )

    await user.click(screen.getByRole('button', { name: /Filtrar por pendiente/ }))

    expect(screen.getByText('Diego Morales')).toBeInTheDocument()
    expect(screen.queryByText('Valentina Soto')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Quitar filtro de pendiente/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    await user.click(screen.getByRole('button', { name: /Quitar filtro de pendiente/ }))

    expect(screen.getByText('Valentina Soto')).toBeInTheDocument()
    expect(screen.getByText('Paula Muñoz')).toBeInTheDocument()
  })

  it('deshabilita en el selector los días sin bloques configurados', async () => {
    const router = createRouter({
      history: createMemoryHistory({
        initialEntries: ['/agenda?date=2026-11-20'],
      }),
      routeTree,
    })

    render(<RouterProvider router={router} />)

    expect(await screen.findByRole('heading', { name: 'Mi agenda' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sáb 21 de nov/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /dom 22 de nov/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /lun 16 de nov/i })).toBeEnabled()
  })

  it('bloquea el día como una excepción de disponibilidad reversible', async () => {
    const user = userEvent.setup()
    const router = createRouter({
      history: createMemoryHistory({
        initialEntries: ['/agenda?date=2026-11-20'],
      }),
      routeTree,
    })

    render(<RouterProvider router={router} />)

    const blockDayButton = await screen.findByRole('button', { name: 'Bloquear día' })
    expect(screen.getByRole('button', { name: 'Agendar paciente para el bloque de 11:45' })).toBeInTheDocument()

    await user.click(blockDayButton)

    expect(screen.getByRole('button', { name: 'Desbloquear día' })).toBeInTheDocument()
    expect(screen.getByText('Día bloqueado para nuevas reservas')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Agendar paciente para el bloque de 11:45' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Desbloquear día' }))

    expect(screen.getByRole('button', { name: 'Bloquear día' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Agendar paciente para el bloque de 11:45' })).toBeInTheDocument()
  })

  it('bloquea un bloque disponible desde su propia card', async () => {
    const user = userEvent.setup()
    const router = createRouter({
      history: createMemoryHistory({
        initialEntries: ['/agenda?date=2026-11-20'],
      }),
      routeTree,
    })

    render(<RouterProvider router={router} />)

    const blockSlotButton = await screen.findByRole('button', {
      name: 'Bloquear bloque de 11:45',
    })

    await user.click(blockSlotButton)

    expect(screen.getByText('No disponible')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Agendar paciente para el bloque de 11:45' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Desbloquear bloque de 11:45' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Filtrar por bloqueada\. 1 bloque/ })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Desbloquear bloque de 11:45' }))

    expect(screen.getByRole('button', { name: 'Agendar paciente para el bloque de 11:45' })).toBeInTheDocument()
  })
})
