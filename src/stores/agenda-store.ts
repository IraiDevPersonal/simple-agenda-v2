import { create } from 'zustand'

import { demoAppointments, demoScheduleSegments } from '@/data/demo-data'
import {
  DEFAULT_SCHEDULE_START_TIME,
  DEFAULT_SERVICE_MODE,
  getSuggestedSegmentStartTime,
  getSuggestedServiceMode,
} from '@/features/schedule/lib/schedule-segment-utils'
import {
  DEFAULT_APPOINTMENT_BUFFER_MINUTES,
  type AppointmentBufferMinutes,
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
  scheduleSegments: ScheduleSegment[]
  appointments: typeof demoAppointments
  setAppointmentBufferMinutes: (minutes: AppointmentBufferMinutes) => void
  toggleWeekday: (weekday: Weekday, enabled: boolean) => void
  addSegment: (weekday: Weekday) => void
  updateSegment: (segmentId: string, update: ScheduleSegmentUpdate) => void
  removeSegment: (segmentId: string) => void
  resetDemoData: () => void
}

function createSegmentId(weekday: Weekday): string {
  return `segment-${weekday}-${Date.now()}`
}

export const useAgendaStore = create<AgendaStore>((set) => ({
  appointmentBufferMinutes: DEFAULT_APPOINTMENT_BUFFER_MINUTES,
  scheduleSegments: demoScheduleSegments,
  appointments: demoAppointments,
  setAppointmentBufferMinutes: (minutes) => set({ appointmentBufferMinutes: minutes }),
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
  resetDemoData: () =>
    set({
      appointmentBufferMinutes: DEFAULT_APPOINTMENT_BUFFER_MINUTES,
      scheduleSegments: demoScheduleSegments,
      appointments: demoAppointments,
    }),
}))
