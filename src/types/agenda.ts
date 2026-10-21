export const SLOT_DURATION_MINUTES = 45 as const
export const APPOINTMENT_BUFFER_OPTIONS = [0, 5, 10, 15, 20] as const
export const DEFAULT_APPOINTMENT_BUFFER_MINUTES = 0 as const

export type DateKey = string
export type AppointmentBufferMinutes = (typeof APPOINTMENT_BUFFER_OPTIONS)[number]

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export type ServiceMode = 'remote' | 'in-person' | 'home-visit'

export type ScheduleSegment = {
  id: string
  weekday: Weekday
  enabled: boolean
  startTime: string
  blockCount: number
  excludedBlockIndexes?: number[]
  serviceMode: ServiceMode
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
