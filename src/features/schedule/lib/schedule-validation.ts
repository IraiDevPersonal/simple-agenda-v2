import {
  SLOT_DURATION_MINUTES,
  type AppointmentBufferMinutes,
  type ScheduleSegment,
} from '@/types/agenda'
import { MINUTES_PER_DAY, timeToMinutes } from '@/lib/time-utils'
import { getScheduleBlocks } from '@/lib/schedule-block-utils'

export type ScheduleValidationErrors = Record<string, string[]>

function segmentEndMinutes(
  segment: ScheduleSegment,
  bufferMinutes: AppointmentBufferMinutes = 0,
): number | null {
  const startMinutes = timeToMinutes(segment.startTime)

  if (startMinutes === null || !Number.isInteger(segment.blockCount)) {
    return null
  }

  return (
    startMinutes +
    segment.blockCount * SLOT_DURATION_MINUTES +
    Math.max(0, segment.blockCount - 1) * bufferMinutes
  )
}

export function getSegmentEndTime(
  segment: ScheduleSegment,
  bufferMinutes: AppointmentBufferMinutes = 0,
): string | null {
  const endMinutes = segmentEndMinutes(segment, bufferMinutes)

  if (endMinutes === null || endMinutes > MINUTES_PER_DAY || endMinutes <= 0) {
    return null
  }

  const hours = Math.floor(endMinutes / 60)
  const minutes = endMinutes % 60

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function getSegmentPreview(
  segment: ScheduleSegment,
  bufferMinutes: AppointmentBufferMinutes = 0,
): string[] {
  return getScheduleBlocks(segment, bufferMinutes).map((block) => block.startTime)
}

export function validateScheduleSegment(
  segment: ScheduleSegment,
  siblings: ScheduleSegment[] = [],
  bufferMinutes: AppointmentBufferMinutes = 0,
): string[] {
  if (!segment.enabled) {
    return []
  }

  const errors: string[] = []
  const startMinutes = timeToMinutes(segment.startTime)
  const endMinutes = segmentEndMinutes(segment, bufferMinutes)

  if (startMinutes === null) {
    errors.push('Elige una hora de inicio válida.')
  }

  if (!Number.isInteger(segment.blockCount) || segment.blockCount < 1) {
    errors.push('Añade al menos un bloque de 45 minutos.')
  }

  if (
    startMinutes !== null &&
    segment.blockCount > 0 &&
    endMinutes !== null &&
    endMinutes <= MINUTES_PER_DAY &&
    getScheduleBlocks(segment, bufferMinutes).length === 0
  ) {
    errors.push('Añade al menos un bloque de 45 minutos.')
  }

  if (endMinutes !== null && endMinutes > MINUTES_PER_DAY) {
    errors.push('El tramo no puede terminar después de medianoche.')
  }

  if (startMinutes !== null && endMinutes !== null && endMinutes <= startMinutes) {
    errors.push('El tramo debe tener una duración positiva.')
  }

  if (startMinutes !== null && endMinutes !== null && endMinutes <= MINUTES_PER_DAY) {
    const overlaps = siblings.some((sibling) => {
      if (!sibling.enabled || sibling.id === segment.id || sibling.weekday !== segment.weekday) {
        return false
      }

      const siblingStart = timeToMinutes(sibling.startTime)
      const siblingEnd = segmentEndMinutes(sibling, bufferMinutes)

      return (
        siblingStart !== null &&
        siblingEnd !== null &&
        siblingEnd > siblingStart &&
        startMinutes < siblingEnd &&
        endMinutes > siblingStart
      )
    })

    if (overlaps) {
      errors.push('Este tramo se cruza con otro del mismo día.')
    }
  }

  return errors
}

export function validateScheduleSegments(
  segments: ScheduleSegment[],
  bufferMinutes: AppointmentBufferMinutes = 0,
): ScheduleValidationErrors {
  return Object.fromEntries(
    segments.map((segment) => [
      segment.id,
      validateScheduleSegment(
        segment,
        segments.filter((candidate) => candidate.weekday === segment.weekday),
        bufferMinutes,
      ),
    ]),
  )
}
