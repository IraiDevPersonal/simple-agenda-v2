import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { DatePicker } from '@/components/ui/date-picker'

describe('DatePicker', () => {
  it('deshabilita fechas anteriores o no disponibles y se cierra al hacer clic afuera', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <DatePicker
        id="reschedule-date"
        isDateDisabled={(date) => date === '2026-11-21'}
        minDate="2026-11-20"
        onSelect={onSelect}
        selectedDate="2026-11-20"
      />,
    )

    expect(screen.getByDisplayValue('20/11/2026')).toBeInTheDocument()

    await user.click(screen.getByDisplayValue('20/11/2026'))

    const picker = screen.getByRole('dialog', { name: 'Selector de fecha' })
    expect(picker.parentElement).toBe(document.body)
    expect(picker).toHaveTextContent('Noviembre de 2026')
    expect(screen.getByRole('button', { name: /jueves, 19 de noviembre/i })).toBeDisabled()
    const selectedDateButton = screen.getByRole('button', {
      name: /viernes, 20 de noviembre/i,
    })
    expect(selectedDateButton).toBeEnabled()
    expect(selectedDateButton).toHaveClass('rounded-sm', 'shadow-action-accent')
    expect(selectedDateButton).not.toHaveClass('border-ink')
    expect(screen.getByRole('button', { name: /sábado, 21 de noviembre/i })).toBeDisabled()

    await user.click(document.body)

    expect(screen.queryByRole('dialog', { name: 'Selector de fecha' })).not.toBeInTheDocument()
  })

  it('selecciona una fecha habilitada', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <DatePicker
        id="reschedule-date"
        isDateDisabled={(date) => date === '2026-11-21'}
        minDate="2026-11-20"
        onSelect={onSelect}
        selectedDate="2026-11-20"
      />,
    )

    await user.click(screen.getByDisplayValue('20/11/2026'))
    await user.click(screen.getByRole('button', { name: /martes, 1 de diciembre/i }))

    expect(onSelect).toHaveBeenCalledWith('2026-12-01')
    expect(screen.queryByRole('dialog', { name: 'Selector de fecha' })).not.toBeInTheDocument()
  })
})
