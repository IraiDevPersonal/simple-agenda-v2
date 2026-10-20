import { SLOT_DURATION_MINUTES, type ScheduleSegment, type ServiceMode } from '@/types/agenda'
import { MINUTES_PER_DAY, minutesToTime, timeToMinutes } from '@/lib/time-utils'

export const DEFAULT_SCHEDULE_START_TIME = '09:00'
export const DEFAULT_SERVICE_MODE: ServiceMode = 'in-person'

export function getSuggestedSegmentStartTime(segments: ScheduleSegment[]): string {
  const previousSegment = segments.filter((segment) => segment.enabled).at(-1)

  if (!previousSegment) {
    return DEFAULT_SCHEDULE_START_TIME
  }

  const previousStartMinutes = timeToMinutes(previousSegment.startTime)

  if (
    previousStartMinutes === null ||
    !Number.isInteger(previousSegment.blockCount) ||
    previousSegment.blockCount < 1
  ) {
    return DEFAULT_SCHEDULE_START_TIME
  }

  const nextStartMinutes =
    previousStartMinutes + previousSegment.blockCount * SLOT_DURATION_MINUTES

  if (nextStartMinutes > MINUTES_PER_DAY) {
    return DEFAULT_SCHEDULE_START_TIME
  }

  return nextStartMinutes === MINUTES_PER_DAY
    ? '00:00'
    : minutesToTime(nextStartMinutes)
}

export function getSuggestedServiceMode(segments: ScheduleSegment[]): ServiceMode {
  return segments.filter((segment) => segment.enabled).at(-1)?.serviceMode ?? DEFAULT_SERVICE_MODE
}
