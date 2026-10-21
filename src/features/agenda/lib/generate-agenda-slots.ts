import { weekdayFromDateKey } from '@/lib/date-utils'
import { getScheduleBlocks } from '@/lib/schedule-block-utils'
import {
  type AgendaSlot,
  type AppointmentBufferMinutes,
  type Appointment,
  type DateKey,
  type ScheduleSegment,
} from '@/types/agenda'

type GenerateAgendaSlotsInput = {
  date: DateKey
  scheduleSegments: ScheduleSegment[]
  appointments: Appointment[]
  bufferMinutes?: AppointmentBufferMinutes
}

export function generateAgendaSlots({
  date,
  scheduleSegments,
  appointments,
  bufferMinutes = 0,
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
      for (const block of getScheduleBlocks(segment, bufferMinutes)) {
        if (slotsByStart.has(block.startTime)) {
          continue
        }

        const appointment = appointmentByStart.get(block.startTime)

        slotsByStart.set(block.startTime, {
          id: `${date}-${block.startTime}`,
          date,
          startTime: block.startTime,
          endTime: block.endTime,
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
