import {
  SLOT_DURATION_MINUTES,
  type AppointmentBufferMinutes,
  type ScheduleSegment,
} from '@/types/agenda'
import { MINUTES_PER_DAY, minutesToTime, timeToMinutes } from '@/lib/time-utils'

export type ScheduleBlock = {
  index: number
  startTime: string
  endTime: string
}

export function getScheduleBlocks(
  segment: ScheduleSegment,
  bufferMinutes: AppointmentBufferMinutes = 0,
): ScheduleBlock[] {
  const startMinutes = timeToMinutes(segment.startTime)
  const totalMinutes =
    segment.blockCount * SLOT_DURATION_MINUTES +
    Math.max(0, segment.blockCount - 1) * bufferMinutes

  if (
    startMinutes === null ||
    !Number.isInteger(segment.blockCount) ||
    segment.blockCount < 1 ||
    startMinutes + totalMinutes > MINUTES_PER_DAY
  ) {
    return []
  }

  const excludedIndexes = new Set(segment.excludedBlockIndexes ?? [])
  const blockSpacing = SLOT_DURATION_MINUTES + bufferMinutes

  return Array.from({ length: segment.blockCount }, (_, index) => {
    const blockStartMinutes = startMinutes + index * blockSpacing

    return {
      endTime: minutesToTime(blockStartMinutes + SLOT_DURATION_MINUTES),
      index,
      startTime: minutesToTime(blockStartMinutes),
    }
  }).filter((block) => !excludedIndexes.has(block.index))
}

export function getScheduleBlockCount(
  segment: ScheduleSegment,
  bufferMinutes: AppointmentBufferMinutes = 0,
): number {
  return getScheduleBlocks(segment, bufferMinutes).length
}
