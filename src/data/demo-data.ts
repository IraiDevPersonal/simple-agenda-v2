import type { Appointment, DateKey, ScheduleSegment } from '@/types/agenda'

export const DEMO_DATE: DateKey = '2026-08-04'

export const demoScheduleSegments: ScheduleSegment[] = [
  {
    id: 'segment-monday-1',
    weekday: 'monday',
    enabled: true,
    startTime: '10:00',
    blockCount: 3,
  },
  {
    id: 'segment-tuesday-1',
    weekday: 'tuesday',
    enabled: true,
    startTime: '09:00',
    blockCount: 5,
  },
  {
    id: 'segment-wednesday-1',
    weekday: 'wednesday',
    enabled: true,
    startTime: '15:00',
    blockCount: 3,
  },
  {
    id: 'segment-thursday-1',
    weekday: 'thursday',
    enabled: true,
    startTime: '10:00',
    blockCount: 4,
  },
  {
    id: 'segment-friday-1',
    weekday: 'friday',
    enabled: true,
    startTime: '09:30',
    blockCount: 4,
  },
  {
    id: 'segment-saturday-1',
    weekday: 'saturday',
    enabled: false,
    startTime: '10:00',
    blockCount: 3,
  },
  {
    id: 'segment-sunday-1',
    weekday: 'sunday',
    enabled: false,
    startTime: '10:00',
    blockCount: 2,
  },
]

export const demoAppointments: Appointment[] = [
  {
    id: 'appointment-1',
    date: DEMO_DATE,
    startTime: '09:00',
    status: 'reserved',
    clientName: 'Camila Rojas',
    serviceName: 'Sesión de seguimiento',
  },
  {
    id: 'appointment-2',
    date: DEMO_DATE,
    startTime: '10:30',
    status: 'blocked',
    label: 'Pausa personal',
  },
  {
    id: 'appointment-3',
    date: DEMO_DATE,
    startTime: '11:15',
    status: 'reserved',
    clientName: 'Martín Silva',
    serviceName: 'Consulta inicial',
  },
  {
    id: 'appointment-4',
    date: '2026-08-05',
    startTime: '15:00',
    status: 'reserved',
    clientName: 'Josefa Pérez',
    serviceName: 'Revisión de proyecto',
  },
]
