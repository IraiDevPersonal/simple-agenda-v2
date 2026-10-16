export const SLOT_DURATION_MINUTES = 45 as const

export type DateKey = string

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export type ScheduleSegment = {
  id: string
  weekday: Weekday
  enabled: boolean
  startTime: string
  blockCount: number
}

export type SlotStatus = 'available' | 'reserved' | 'blocked'

export type Appointment = {
  id: string
  date: DateKey
  startTime: string
  status: Exclude<SlotStatus, 'available'>
  clientName?: string
  serviceName?: string
  label?: string
}

export type AgendaSlot = {
  id: string
  date: DateKey
  startTime: string
  endTime: string
  status: SlotStatus
  appointmentId?: string
  appointment?: Appointment
}
