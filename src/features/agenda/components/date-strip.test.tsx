import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { DateStrip } from '@/features/agenda/components/date-strip'
import { getWeekDates } from '@/lib/date-utils'

describe('DateStrip', () => {
  it('expone la fecha activa y permite seleccionar otro día', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <DateStrip
        dates={getWeekDates('2026-08-04')}
        onSelect={onSelect}
        onShift={vi.fn()}
        selectedDate="2026-08-04"
      />,
    )

    expect(screen.getByRole('button', { name: /mar 04/i })).toHaveAttribute(
      'aria-current',
      'date',
    )

    await user.click(screen.getByRole('button', { name: /mié 05/i }))
    expect(onSelect).toHaveBeenCalledWith('2026-08-05')
  })
})
