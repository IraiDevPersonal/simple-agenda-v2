import { describe, expect, it } from 'vitest'

import { formatMonthLabel, shiftMonth } from '@/lib/date-utils'

describe('month date utilities', () => {
  it('shifts months while keeping the day when possible', () => {
    expect(shiftMonth('2026-08-04', -1)).toBe('2026-07-04')
    expect(shiftMonth('2026-08-04', 1)).toBe('2026-09-04')
    expect(shiftMonth('2026-03-31', -1)).toBe('2026-02-28')
  })

  it('formats the visible month in Spanish', () => {
    expect(formatMonthLabel('2026-08-04')).toBe('Agosto de 2026')
  })
})
