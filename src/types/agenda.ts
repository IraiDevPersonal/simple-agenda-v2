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

export type Patient = {
  id: string
  rut: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

export type PatientDraft = Omit<Patient, 'id'>

export type AppointmentPricing = {
  id: string
  name: string
  serviceMode: ServiceMode
  amount: number
}

export type ScheduleSegment = {
  id: string
  weekday: Weekday
  enabled: boolean
  startTime: string
  blockCount: number
  excludedBlockIndexes?: number[]
  serviceMode: ServiceMode
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'blocked'
export type SlotStatus = 'available' | AppointmentStatus

export type NewAppointment = {
  date: DateKey
  startTime: string
  status: Exclude<AppointmentStatus, 'blocked'>
  clientName: string
  serviceName: string
  patient?: Patient
  pricing?: AppointmentPricing
  proofDeadlineHours?: number
}

export type Appointment = {
  id: string
  date: DateKey
  startTime: string
  status: AppointmentStatus
  clientName?: string
  serviceName?: string
  label?: string
  patient?: Patient
  pricing?: AppointmentPricing
  proofDeadlineHours?: number
  proofFileName?: string
  proofFileUrl?: string
}

export type AgendaSlot = {
  id: string
  date: DateKey
  startTime: string
  endTime: string
  serviceMode: ServiceMode
  status: SlotStatus
  appointmentId?: string
  appointment?: Appointment
}
