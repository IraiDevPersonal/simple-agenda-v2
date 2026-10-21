import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { SchedulePage } from '@/features/schedule/components/schedule-page'
import { useAgendaStore } from '@/stores/agenda-store'

describe('SchedulePage', () => {
  beforeEach(() => {
    useAgendaStore.getState().resetDemoData()
  })

  it('bloquea guardar cuando un tramo cruza medianoche', () => {
    render(<SchedulePage />)
    const saveButton = screen.getByRole('button', { name: 'Guardar horarios' })

    expect(saveButton).toBeEnabled()

    fireEvent.change(screen.getAllByLabelText('Hora de inicio')[2], {
      target: { value: '23:30' },
    })

    expect(saveButton).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Corrige los tramos marcados antes de guardar tu disponibilidad.',
    )
  })

  it('permite configurar la separación entre citas', () => {
    render(<SchedulePage />)

    const bufferSelect = screen.getByRole('combobox', { name: 'Tiempo entre citas' })

    expect(bufferSelect).toHaveValue('0')
    fireEvent.change(bufferSelect, { target: { value: '10' } })

    expect(bufferSelect).toHaveValue('10')
    expect(useAgendaStore.getState().appointmentBufferMinutes).toBe(10)
    expect(screen.getAllByText('10:55').length).toBeGreaterThan(0)
  })
})
