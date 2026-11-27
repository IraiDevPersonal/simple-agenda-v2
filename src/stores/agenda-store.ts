import { create } from 'zustand'

import { demoAppointments, demoPatients, demoScheduleSegments } from '@/data/demo-data'
import {
  DEFAULT_SCHEDULE_START_TIME,
  DEFAULT_SERVICE_MODE,
  getSuggestedSegmentStartTime,
  getSuggestedServiceMode,
} from '@/features/schedule/lib/schedule-segment-utils'
import { normalizeRut } from '@/lib/patient-utils'
import {
  DEFAULT_APPOINTMENT_BUFFER_MINUTES,
  type AgendaSlot,
  type Appointment,
  type AppointmentBufferMinutes,
  type DateKey,
  type NewAppointment,
  type Patient,
  type PatientDraft,
  type RescheduleTarget,
  type ScheduleSegment,
  type Weekday,
} from '@/types/agenda'

type ScheduleSegmentUpdate = Partial<
  Pick<
    ScheduleSegment,
    'enabled' | 'startTime' | 'blockCount' | 'excludedBlockIndexes' | 'serviceMode'
  >
>

type AgendaStore = {
  appointmentBufferMinutes: AppointmentBufferMinutes
  blockedDates: DateKey[]
  scheduleSegments: ScheduleSegment[]
  patients: Patient[]
  appointments: Appointment[]
  setAppointmentBufferMinutes: (minutes: AppointmentBufferMinutes) => void
  blockSlot: (slot: Pick<AgendaSlot, 'date' | 'startTime'>) => void
  unblockSlot: (date: DateKey, startTime: string) => void
  toggleDateBlock: (date: DateKey) => void
  toggleWeekday: (weekday: Weekday, enabled: boolean) => void
  addSegment: (weekday: Weekday) => void
  updateSegment: (segmentId: string, update: ScheduleSegmentUpdate) => void
  removeSegment: (segmentId: string) => void
  savePatient: (patient: PatientDraft) => Patient
  createAppointment: (appointment: NewAppointment) => string | null
  confirmAppointment: (appointmentId: string) => void
  rescheduleAppointment: (
    appointmentId: string,
    target: RescheduleTarget,
  ) => boolean
  cancelAppointment: (appointmentId: string) => void
  attachProof: (appointmentId: string, fileName: string, fileUrl?: string) => void
  resetDemoData: () => void
}

function createSegmentId(weekday: Weekday): string {
  return `segment-${weekday}-${Date.now()}`
}

function createAppointmentId(): string {
  return `appointment-${Date.now()}`
}

function createBlockedSlotId(date: DateKey, startTime: string): string {
  return `blocked-slot-${date}-${startTime.replace(':', '-')}`
}

export const useAgendaStore = create<AgendaStore>((set) => ({
  appointmentBufferMinutes: DEFAULT_APPOINTMENT_BUFFER_MINUTES,
  blockedDates: [],
  scheduleSegments: demoScheduleSegments,
  patients: demoPatients,
  appointments: demoAppointments,
  setAppointmentBufferMinutes: (minutes) => set({ appointmentBufferMinutes: minutes }),
  blockSlot: (slot) =>
    set((state) => {
      const isSlotTaken = state.appointments.some(
        (appointment) =>
          appointment.date === slot.date && appointment.startTime === slot.startTime,
      )

      if (isSlotTaken) {
        return state
      }

      return {
        appointments: [
          ...state.appointments,
          {
            date: slot.date,
            id: createBlockedSlotId(slot.date, slot.startTime),
            startTime: slot.startTime,
            status: 'blocked',
          },
        ],
      }
    }),
  unblockSlot: (date, startTime) =>
    set((state) => ({
      appointments: state.appointments.filter(
        (appointment) => appointment.id !== createBlockedSlotId(date, startTime),
      ),
    })),
  toggleDateBlock: (date) =>
    set((state) => ({
      blockedDates: state.blockedDates.includes(date)
        ? state.blockedDates.filter((blockedDate) => blockedDate !== date)
        : [...state.blockedDates, date],
    })),
  toggleWeekday: (weekday, enabled) =>
    set((state) => {
      const weekdaySegments = state.scheduleSegments.filter(
        (segment) => segment.weekday === weekday,
      )

      if (enabled && weekdaySegments.length === 0) {
        return {
          scheduleSegments: [
            ...state.scheduleSegments,
            {
              id: createSegmentId(weekday),
              weekday,
              enabled: true,
              startTime: DEFAULT_SCHEDULE_START_TIME,
              blockCount: 2,
              serviceMode: DEFAULT_SERVICE_MODE,
            },
          ],
        }
      }

      return {
        scheduleSegments: state.scheduleSegments.map((segment) =>
          segment.weekday === weekday ? { ...segment, enabled } : segment,
        ),
      }
    }),
  addSegment: (weekday) =>
    set((state) => {
      const weekdaySegments = state.scheduleSegments.filter(
        (segment) => segment.weekday === weekday,
      )

      return {
        scheduleSegments: [
          ...state.scheduleSegments,
          {
            id: createSegmentId(weekday),
            weekday,
            enabled: true,
            startTime: getSuggestedSegmentStartTime(
              weekdaySegments,
              state.appointmentBufferMinutes,
            ),
            blockCount: 2,
            serviceMode: getSuggestedServiceMode(weekdaySegments),
          },
        ],
      }
    }),
  updateSegment: (segmentId, update) =>
    set((state) => ({
      scheduleSegments: state.scheduleSegments.map((segment) =>
        segment.id === segmentId ? { ...segment, ...update } : segment,
      ),
    })),
  removeSegment: (segmentId) =>
    set((state) => ({
      scheduleSegments: state.scheduleSegments.filter(
        (segment) => segment.id !== segmentId,
      ),
    })),
  savePatient: (patient) => {
    let savedPatient: Patient | null = null

    set((state) => {
      const existingPatient = state.patients.find(
        (candidate) => normalizeRut(candidate.rut) === normalizeRut(patient.rut),
      )

      if (existingPatient) {
        savedPatient = { ...existingPatient, ...patient }
        return {
          patients: state.patients.map((candidate) =>
            candidate.id === existingPatient.id ? savedPatient! : candidate,
          ),
        }
      }

      savedPatient = { ...patient, id: `patient-${Date.now()}` }

      return { patients: [...state.patients, savedPatient] }
    })

    return savedPatient!
  },
  createAppointment: (appointment) => {
    let createdAppointmentId: string | null = null

    set((state) => {
      const isSlotTaken = state.appointments.some(
        (existingAppointment) =>
          existingAppointment.date === appointment.date &&
          existingAppointment.startTime === appointment.startTime,
      )

      if (isSlotTaken) {
        return state
      }

      const newAppointmentId = createAppointmentId()
      createdAppointmentId = newAppointmentId

      return {
        appointments: [
          ...state.appointments,
          { ...appointment, id: newAppointmentId },
        ],
      }
    })

    return createdAppointmentId
  },
  confirmAppointment: (appointmentId) =>
    set((state) => ({
      appointments: state.appointments.map((appointment) =>
        appointment.id === appointmentId && appointment.status === 'pending'
          ? { ...appointment, status: 'confirmed' }
          : appointment,
      ),
    })),
  rescheduleAppointment: (appointmentId, target) => {
    let didReschedule = false

    set((state) => {
      const appointment = state.appointments.find((item) => item.id === appointmentId)
      const targetIsTaken = state.appointments.some(
        (item) =>
          item.id !== appointmentId &&
          item.date === target.date &&
          item.startTime === target.startTime,
      )

      if (
        !appointment ||
        appointment.status !== 'confirmed' ||
        !Number.isFinite(target.pricing.amount) ||
        target.pricing.amount <= 0 ||
        state.blockedDates.includes(target.date) ||
        targetIsTaken
      ) {
        return state
      }

      const currentAmount = appointment.pricing?.amount ?? target.pricing.amount
      const shouldRequestPayment =
        !target.keepCurrentPrice &&
        target.pricing.amount > currentAmount &&
        target.proofDeadlineHours > 0
      const nextPricing = target.keepCurrentPrice
        ? { ...target.pricing, amount: currentAmount }
        : target.pricing

      didReschedule = true

      return {
        appointments: state.appointments.map((item) =>
          item.id === appointmentId
            ? {
                ...item,
                date: target.date,
                pricing: nextPricing,
                startTime: target.startTime,
                status: shouldRequestPayment ? 'pending' : 'confirmed',
                ...(shouldRequestPayment
                  ? {
                      proofDeadlineHours: target.proofDeadlineHours,
                      proofFileName: undefined,
                      proofFileUrl: undefined,
                    }
                  : {}),
              }
            : item,
        ),
      }
    })

    return didReschedule
  },
  cancelAppointment: (appointmentId) =>
    set((state) => ({
      appointments: state.appointments.filter(
        (appointment) => appointment.id !== appointmentId,
      ),
    })),
  attachProof: (appointmentId, fileName, fileUrl) =>
    set((state) => ({
      appointments: state.appointments.map((appointment) =>
        appointment.id === appointmentId
          ? { ...appointment, proofFileName: fileName, proofFileUrl: fileUrl }
          : appointment,
      ),
    })),
  resetDemoData: () =>
    set({
      appointmentBufferMinutes: DEFAULT_APPOINTMENT_BUFFER_MINUTES,
      blockedDates: [],
      scheduleSegments: demoScheduleSegments,
      patients: [...demoPatients],
      appointments: [...demoAppointments],
    }),
}))
