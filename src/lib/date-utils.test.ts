import { describe, expect, it } from 'vitest'

import {
  formatMonthLabel,
  formatWeekDayRangeLabel,
  getMonthDates,
  isDateTimeInPast,
  shiftMonth,
} from '@/lib/date-utils'

describe('month date utilities', () => {
  it('shifts months while keeping the day when possible', () => {
    expect(shiftMonth('2026-08-04', -1)).toBe('2026-07-04')
    expect(shiftMonth('2026-08-04', 1)).toBe('2026-09-04')
    expect(shiftMonth('2026-03-31', -1)).toBe('2026-02-28')
  })

  it('formats the visible month in Spanish', () => {
    expect(formatMonthLabel('2026-08-04')).toBe('Agosto de 2026')
  })

  it('formats the visible week as a compact day range', () => {
    expect(formatWeekDayRangeLabel('2026-11-20')).toBe('Semana del 16 al 22')
    expect(formatWeekDayRangeLabel('2026-12-01')).toBe('Semana del 30 al 6')
  })

  it('genera una cuadrícula mensual que comienza en lunes', () => {
    const dates = getMonthDates('2026-11-20')

    expect(dates).toHaveLength(42)
    expect(dates[0]).toBe('2026-10-26')
    expect(dates[5]).toBe('2026-10-31')
    expect(dates[6]).toBe('2026-11-01')
  })

  it('considera pasadas las horas anteriores del día actual', () => {
    const now = new Date('2026-11-20T13:30:00.000Z')

    expect(isDateTimeInPast('2026-11-19', '23:00', now)).toBe(true)
    expect(isDateTimeInPast('2026-11-20', '10:00', now)).toBe(true)
    expect(isDateTimeInPast('2026-11-20', '14:00', now)).toBe(false)
    expect(isDateTimeInPast('2026-11-21', '09:00', now)).toBe(false)
  })
})
