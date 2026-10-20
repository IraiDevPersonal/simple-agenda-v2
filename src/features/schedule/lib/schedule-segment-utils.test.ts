import { describe, expect, it } from 'vitest'

import {
  DEFAULT_SCHEDULE_START_TIME,
  DEFAULT_SERVICE_MODE,
  getSuggestedSegmentStartTime,
  getSuggestedServiceMode,
} from '@/features/schedule/lib/schedule-segment-utils'
import type { ScheduleSegment } from '@/types/agenda'

const segment = (overrides: Partial<ScheduleSegment> = {}): ScheduleSegment => ({
  blockCount: 3,
  enabled: true,
  id: 'segment-test',
  serviceMode: 'remote',
  startTime: '10:00',
  weekday: 'monday',
  ...overrides,
})

describe('schedule segment utils', () => {
  it('sugiere el fin del último tramo activo como inicio del siguiente', () => {
    expect(getSuggestedSegmentStartTime([segment()])).toBe('12:15')
    expect(getSuggestedServiceMode([segment()])).toBe('remote')
  })

  it('usa valores seguros cuando no existe un tramo previo activo', () => {
    expect(getSuggestedSegmentStartTime([])).toBe(DEFAULT_SCHEDULE_START_TIME)
    expect(getSuggestedServiceMode([])).toBe(DEFAULT_SERVICE_MODE)
  })
})
