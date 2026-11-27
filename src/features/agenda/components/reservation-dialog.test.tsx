import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ReservationDialog } from '@/features/agenda/components/reservation-dialog'
import type { AgendaSlot, Patient } from '@/types/agenda'
import type { PaymentPricing } from '@/types/payments'

const slot: AgendaSlot = {
  date: '2026-08-04',
  endTime: '10:45',
  id: '2026-08-04-10:00',
  serviceMode: 'in-person',
  startTime: '10:00',
  status: 'available',
}

const patient: Patient = {
  email: 'camila.rojas@ejemplo.cl',
  firstName: 'Camila',
  id: 'patient-1',
  lastName: 'Rojas',
  phone: '+56 9 8765 4321',
  rut: '12.345.678-5',
}

const pricingOptions: PaymentPricing[] = [
  {
    amounts: { 'in-person': 35000 },
    id: 'pricing-particular',
    name: 'Particular',
    samePriceAmount: 35000,
    samePriceForAll: false,
    serviceModes: ['in-person'],
  },
]

const baseProps = {
  onAttachProof: vi.fn(),
  onClose: vi.fn(),
  patients: [patient],
  pricingOptions,
  slot,
}

describe('ReservationDialog', () => {
  it('busca al paciente, revisa el valor y adjunta un comprobante', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn(() => 'appointment-created')
    const onAttachProof = vi.fn()

    render(
      <ReservationDialog
        {...baseProps}
        onAttachProof={onAttachProof}
        onSubmit={onSubmit}
        proofDeadlineHours={3}
      />,
    )

    expect(screen.getByLabelText('Nombres')).toBeDisabled()
    expect(screen.getByLabelText('Apellidos')).toBeDisabled()

    await user.type(screen.getByLabelText('RUT'), '12.345.678-5')
    await user.click(screen.getByRole('button', { name: 'Buscar paciente por RUT' }))

    expect(screen.getByDisplayValue('Camila')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombres')).not.toBeDisabled()
    expect(screen.getByText(/Paciente encontrado/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByText('$35.000')).toBeInTheDocument()
    expect(screen.getByText('Presencial')).toBeInTheDocument()
    expect(screen.getByText(/3 horas para enviarlo/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reservar cita' }))
    expect(screen.getByText('Esperando comprobante')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Volver' }))
    expect(screen.getByText(/Revisa el valor, la modalidad/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Volver al comprobante' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Volver al comprobante' }))
    expect(screen.getByText('Esperando comprobante')).toBeInTheDocument()
    expect(onSubmit).toHaveBeenCalledTimes(1)

    const file = new File(['comprobante'], 'comprobante.pdf', { type: 'application/pdf' })
    await user.upload(screen.getByLabelText('Archivo de comprobante'), file)

    expect(onSubmit).toHaveBeenCalledWith({
      patient: {
        email: 'camila.rojas@ejemplo.cl',
        firstName: 'Camila',
        lastName: 'Rojas',
        phone: '+56 9 8765 4321',
        rut: '12.345.678-5',
      },
      pricing: {
        amount: 35000,
        id: 'pricing-particular',
        name: 'Particular',
        serviceMode: 'in-person',
      },
      serviceName: 'Consulta general',
    })
    expect(onAttachProof).toHaveBeenCalledWith(
      'appointment-created',
      'comprobante.pdf',
      expect.stringMatching(/^blob:/),
    )
  }, 10000)

  it('habilita el alta de un paciente nuevo después de buscar un RUT válido', async () => {
    const user = userEvent.setup()

    render(
      <ReservationDialog
        {...baseProps}
        onSubmit={vi.fn(() => 'appointment-created')}
        patients={[]}
        proofDeadlineHours={0}
      />,
    )

    await user.type(screen.getByLabelText('RUT'), '1.234.567-4')
    await user.click(screen.getByRole('button', { name: 'Buscar paciente por RUT' }))

    expect(screen.getByText(/No encontramos este RUT/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Nombres')).not.toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(screen.getByText('Ingresa los nombres.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa los apellidos.')).toBeInTheDocument()
  })

  it('explica la confirmación inmediata cuando no se requiere comprobante', () => {
    render(
      <ReservationDialog
        {...baseProps}
        onSubmit={vi.fn(() => 'appointment-created')}
        proofDeadlineHours={0}
      />,
    )

    expect(screen.getByText(/Identifica al paciente/i)).toBeInTheDocument()
    expect(screen.queryByText('Confirmación inmediata')).not.toBeInTheDocument()
  })
})
