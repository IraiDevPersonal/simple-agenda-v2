import { describe, expect, it } from 'vitest'

import {
  getSegmentEndTime,
  getSegmentPreview,
  validateScheduleSegment,
  validateScheduleSegments,
} from '@/features/schedule/lib/schedule-validation'
import type { ScheduleSegment } from '@/types/agenda'

const segment = (overrides: Partial<ScheduleSegment> = {}): ScheduleSegment => ({
  blockCount: 3,
  enabled: true,
  id: 'segment-test',
  startTime: '15:00',
  weekday: 'wednesday',
  ...overrides,
})

describe('schedule validation', () => {
  it('calcula el fin y la vista previa usando bloques de 45 minutos', () => {
    expect(getSegmentEndTime(segment())).toBe('17:15')
    expect(getSegmentPreview(segment())).toEqual(['15:00', '15:45', '16:30'])
  })

  it('rechaza cantidades inválidas y tramos que cruzan medianoche', () => {
    expect(validateScheduleSegment(segment({ blockCount: 0 }))).toContain(
      'Añade al menos un bloque de 45 minutos.',
    )
    expect(validateScheduleSegment(segment({ blockCount: 2, startTime: '23:30' }))).toContain(
      'El tramo no puede terminar después de medianoche.',
    )
    expect(getSegmentEndTime(segment({ blockCount: 2, startTime: '23:30' }))).toBeNull()
  })

  it('detecta solapamientos del mismo día', () => {
    const first = segment({ blockCount: 3, id: 'first', startTime: '10:00' })
    const second = segment({ blockCount: 2, id: 'second', startTime: '11:00' })

    expect(validateScheduleSegment(second, [first])).toContain(
      'Este tramo se cruza con otro del mismo día.',
    )
  })

  it('ignora los tramos desactivados y expone errores por id', () => {
    const disabled = segment({ enabled: false, id: 'disabled', blockCount: 0 })
    const errors = validateScheduleSegments([disabled])

    expect(errors).toEqual({ disabled: [] })
  })
})
