import { SLOT_DURATION_MINUTES, type ScheduleSegment } from '@/types/agenda'
import { MINUTES_PER_DAY, timeToMinutes } from '@/lib/time-utils'

export type ScheduleValidationErrors = Record<string, string[]>

function segmentEndMinutes(segment: ScheduleSegment): number | null {
  const startMinutes = timeToMinutes(segment.startTime)

  if (startMinutes === null || !Number.isInteger(segment.blockCount)) {
    return null
  }

  return startMinutes + segment.blockCount * SLOT_DURATION_MINUTES
}

export function getSegmentEndTime(segment: ScheduleSegment): string | null {
  const endMinutes = segmentEndMinutes(segment)

  if (endMinutes === null || endMinutes > MINUTES_PER_DAY || endMinutes <= 0) {
    return null
  }

  const hours = Math.floor(endMinutes / 60)
  const minutes = endMinutes % 60

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function getSegmentPreview(segment: ScheduleSegment): string[] {
  const startMinutes = timeToMinutes(segment.startTime)

  if (
    startMinutes === null ||
    !Number.isInteger(segment.blockCount) ||
    segment.blockCount < 1 ||
    segmentEndMinutes(segment)! > MINUTES_PER_DAY
  ) {
    return []
  }

  return Array.from({ length: Math.min(segment.blockCount, 8) }, (_, index) => {
    const blockStart = startMinutes + index * SLOT_DURATION_MINUTES
    const hours = Math.floor(blockStart / 60)
    const minutes = blockStart % 60

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  })
}

export function validateScheduleSegment(
  segment: ScheduleSegment,
  siblings: ScheduleSegment[] = [],
): string[] {
  if (!segment.enabled) {
    return []
  }

  const errors: string[] = []
  const startMinutes = timeToMinutes(segment.startTime)

  if (startMinutes === null) {
    errors.push('Elige una hora de inicio válida.')
  }

  if (!Number.isInteger(segment.blockCount) || segment.blockCount < 1) {
    errors.push('Añade al menos un bloque de 45 minutos.')
  }

  const endMinutes = segmentEndMinutes(segment)

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
      const siblingEnd = segmentEndMinutes(sibling)

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
): ScheduleValidationErrors {
  return Object.fromEntries(
    segments.map((segment) => [
      segment.id,
      validateScheduleSegment(
        segment,
        segments.filter((candidate) => candidate.weekday === segment.weekday),
      ),
    ]),
  )
}
