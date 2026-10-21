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

  it('no desplaza la tira cuando todos los días caben', async () => {
    const scrollTo = vi.fn()
    const originalScrollTo = HTMLElement.prototype.scrollTo

    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: scrollTo,
    })

    try {
      render(
        <DateStrip
          dates={getWeekDates('2026-08-04')}
          onSelect={vi.fn()}
          onShift={vi.fn()}
          selectedDate="2026-08-04"
        />,
      )

      const dateStrip = screen
        .getByRole('region', { name: 'Días de la semana' })
        .querySelector('div > div')

      expect(dateStrip).not.toBeNull()

      if (!dateStrip) {
        return
      }

      Object.defineProperties(dateStrip, {
        clientWidth: { configurable: true, value: 600 },
        scrollWidth: { configurable: true, value: 600 },
      })

      await new Promise<void>((resolve) => {
        if (typeof window.requestAnimationFrame === 'function') {
          window.requestAnimationFrame(() => resolve())
          return
        }

        resolve()
      })

      expect(scrollTo).not.toHaveBeenCalled()
    } finally {
      if (originalScrollTo) {
        Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
          configurable: true,
          value: originalScrollTo,
        })
      } else {
        Reflect.deleteProperty(HTMLElement.prototype, 'scrollTo')
      }
    }
  })

  it('centra suavemente el día activo cuando hay espacio para desplazarlo', async () => {
    const scrollTo = vi.fn()
    const originalScrollTo = HTMLElement.prototype.scrollTo

    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: scrollTo,
    })

    try {
      render(
        <DateStrip
          dates={getWeekDates('2026-08-04')}
          onSelect={vi.fn()}
          onShift={vi.fn()}
          selectedDate="2026-08-04"
        />,
      )

      const dateStrip = screen
        .getByRole('region', { name: 'Días de la semana' })
        .querySelector('div > div')
      const selectedButton = screen.getByRole('button', { name: /mar 04/i })

      expect(dateStrip).not.toBeNull()

      if (!dateStrip) {
        return
      }

      Object.defineProperties(dateStrip, {
        clientWidth: { configurable: true, value: 300 },
        scrollLeft: { configurable: true, value: 100 },
        scrollWidth: { configurable: true, value: 600 },
      })

      vi.spyOn(dateStrip, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        width: 300,
      } as DOMRect)
      vi.spyOn(selectedButton, 'getBoundingClientRect').mockReturnValue({
        left: 190,
        width: 60,
      } as DOMRect)

      await new Promise<void>((resolve) => {
        if (typeof window.requestAnimationFrame === 'function') {
          window.requestAnimationFrame(() => resolve())
          return
        }

        resolve()
      })

      expect(scrollTo).toHaveBeenCalledWith({
        left: 170,
        behavior: 'smooth',
      })
    } finally {
      if (originalScrollTo) {
        Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
          configurable: true,
          value: originalScrollTo,
        })
      } else {
        Reflect.deleteProperty(HTMLElement.prototype, 'scrollTo')
      }
    }
  })
})
