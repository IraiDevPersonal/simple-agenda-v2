import { SLOT_DURATION_MINUTES, type ScheduleSegment } from '@/types/agenda'
import { MINUTES_PER_DAY, minutesToTime, timeToMinutes } from '@/lib/time-utils'

export type ScheduleBlock = {
  index: number
  startTime: string
  endTime: string
}

export function getScheduleBlocks(segment: ScheduleSegment): ScheduleBlock[] {
  const startMinutes = timeToMinutes(segment.startTime)

  if (
    startMinutes === null ||
    !Number.isInteger(segment.blockCount) ||
    segment.blockCount < 1 ||
    startMinutes + segment.blockCount * SLOT_DURATION_MINUTES > MINUTES_PER_DAY
  ) {
    return []
  }

  const excludedIndexes = new Set(segment.excludedBlockIndexes ?? [])

  return Array.from({ length: segment.blockCount }, (_, index) => {
    const blockStartMinutes = startMinutes + index * SLOT_DURATION_MINUTES

    return {
      endTime: minutesToTime(blockStartMinutes + SLOT_DURATION_MINUTES),
      index,
      startTime: minutesToTime(blockStartMinutes),
    }
  }).filter((block) => !excludedIndexes.has(block.index))
}

export function getScheduleBlockCount(segment: ScheduleSegment): number {
  return getScheduleBlocks(segment).length
}
