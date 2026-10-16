import { weekdayFromDateKey } from '@/lib/date-utils'
import { addMinutesToTime, timeToMinutes } from '@/lib/time-utils'
import {
  SLOT_DURATION_MINUTES,
  type AgendaSlot,
  type Appointment,
  type DateKey,
  type ScheduleSegment,
} from '@/types/agenda'

type GenerateAgendaSlotsInput = {
  date: DateKey
  scheduleSegments: ScheduleSegment[]
  appointments: Appointment[]
}

export function generateAgendaSlots({
  date,
  scheduleSegments,
  appointments,
}: GenerateAgendaSlotsInput): AgendaSlot[] {
  const weekday = weekdayFromDateKey(date)
  const appointmentByStart = new Map(
    appointments
      .filter((appointment) => appointment.date === date)
      .map((appointment) => [appointment.startTime, appointment]),
  )
  const slotsByStart = new Map<string, AgendaSlot>()

  scheduleSegments
    .filter((segment) => segment.enabled && segment.weekday === weekday)
    .forEach((segment) => {
      const startMinutes = timeToMinutes(segment.startTime)

      if (
        startMinutes === null ||
        !Number.isInteger(segment.blockCount) ||
        segment.blockCount < 1 ||
        startMinutes + segment.blockCount * SLOT_DURATION_MINUTES > 24 * 60
      ) {
        return
      }

      for (let index = 0; index < segment.blockCount; index += 1) {
        const blockStart = addMinutesToTime(
          segment.startTime,
          index * SLOT_DURATION_MINUTES,
        )
        const blockEnd = blockStart
          ? addMinutesToTime(blockStart, SLOT_DURATION_MINUTES)
          : null

        if (!blockStart || !blockEnd || slotsByStart.has(blockStart)) {
          continue
        }

        const appointment = appointmentByStart.get(blockStart)

        slotsByStart.set(blockStart, {
          id: `${date}-${blockStart}`,
          date,
          startTime: blockStart,
          endTime: blockEnd,
          status: appointment?.status ?? 'available',
          appointmentId: appointment?.id,
          appointment,
        })
      }
    })

  return [...slotsByStart.values()].sort((first, second) =>
    first.startTime.localeCompare(second.startTime),
  )
}
