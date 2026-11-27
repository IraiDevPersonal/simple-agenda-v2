import type { Appointment, DateKey, Patient, ScheduleSegment } from '@/types/agenda'

export const DEMO_DATE: DateKey = '2026-08-04'
export const DEMO_TODAY_DATE: DateKey = '2026-11-20'

export const demoScheduleSegments: ScheduleSegment[] = [
  {
    id: 'segment-monday-1',
    weekday: 'monday',
    enabled: true,
    startTime: '10:00',
    blockCount: 3,
    serviceMode: 'in-person',
  },
  {
    id: 'segment-tuesday-1',
    weekday: 'tuesday',
    enabled: true,
    startTime: '09:00',
    blockCount: 5,
    serviceMode: 'remote',
  },
  {
    id: 'segment-wednesday-1',
    weekday: 'wednesday',
    enabled: true,
    startTime: '15:00',
    blockCount: 3,
    serviceMode: 'in-person',
  },
  {
    id: 'segment-thursday-1',
    weekday: 'thursday',
    enabled: true,
    startTime: '10:00',
    blockCount: 4,
    serviceMode: 'home-visit',
  },
  {
    id: 'segment-friday-1',
    weekday: 'friday',
    enabled: true,
    startTime: '09:30',
    blockCount: 4,
    serviceMode: 'remote',
  },
  {
    id: 'segment-saturday-1',
    weekday: 'saturday',
    enabled: false,
    startTime: '10:00',
    blockCount: 3,
    serviceMode: 'in-person',
  },
  {
    id: 'segment-sunday-1',
    weekday: 'sunday',
    enabled: false,
    startTime: '10:00',
    blockCount: 2,
    serviceMode: 'in-person',
  },
]

export const demoPatients: Patient[] = [
  {
    id: 'patient-1',
    rut: '12.345.678-5',
    firstName: 'Camila',
    lastName: 'Rojas',
    email: 'camila.rojas@ejemplo.cl',
    phone: '+56 9 8765 4321',
  },
]

export const demoAppointments: Appointment[] = [
  {
    id: 'appointment-1',
    date: DEMO_DATE,
    startTime: '09:00',
    status: 'confirmed',
    clientName: 'Camila Rojas',
    serviceName: 'Sesión de seguimiento',
  },
  {
    id: 'appointment-5',
    date: DEMO_DATE,
    startTime: '09:45',
    status: 'pending',
    clientName: 'Ignacia Soto',
    serviceName: 'Consulta inicial',
    proofDeadlineHours: 3,
    proofFileName: 'comprobante-ignacia.pdf',
    proofFileUrl: '/demo/comprobante-transferencia.svg',
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
    status: 'confirmed',
    clientName: 'Martín Silva',
    serviceName: 'Consulta inicial',
  },
  {
    id: 'appointment-4',
    date: '2026-08-05',
    startTime: '15:00',
    status: 'confirmed',
    clientName: 'Josefa Pérez',
    serviceName: 'Revisión de proyecto',
  },
  {
    id: 'appointment-today-in-person',
    date: DEMO_TODAY_DATE,
    startTime: '09:30',
    status: 'confirmed',
    clientName: 'Valentina Soto',
    pricing: {
      amount: 35000,
      id: 'pricing-particular-in-person',
      name: 'Particular',
      serviceMode: 'in-person',
    },
  },
  {
    id: 'appointment-today-remote',
    date: DEMO_TODAY_DATE,
    startTime: '10:15',
    status: 'pending',
    clientName: 'Diego Morales',
    pricing: {
      amount: 30000,
      id: 'pricing-particular-remote',
      name: 'Particular',
      serviceMode: 'remote',
    },
    proofDeadlineHours: 3,
    proofFileName: 'comprobante-diego.svg',
    proofFileUrl: '/demo/comprobante-transferencia.svg',
  },
  {
    id: 'appointment-today-home-visit',
    date: DEMO_TODAY_DATE,
    startTime: '11:00',
    status: 'confirmed',
    clientName: 'Paula Muñoz',
    pricing: {
      amount: 40000,
      id: 'pricing-particular-home-visit',
      name: 'Particular',
      serviceMode: 'home-visit',
    },
  },
]
