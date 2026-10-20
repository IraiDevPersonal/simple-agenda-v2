import { describe, expect, it } from 'vitest'

import { demoAppointments, demoScheduleSegments } from '@/data/demo-data'
import { generateAgendaSlots } from '@/features/agenda/lib/generate-agenda-slots'

describe('generateAgendaSlots', () => {
  it('genera bloques consecutivos de 45 minutos', () => {
    const slots = generateAgendaSlots({
      appointments: [],
      date: '2026-08-04',
      scheduleSegments: [
        {
          blockCount: 2,
          enabled: true,
          id: 'segment-tuesday-test',
          startTime: '10:00',
          serviceMode: 'in-person',
          weekday: 'tuesday',
        },
      ],
    })

    expect(slots).toEqual([
      {
        date: '2026-08-04',
        endTime: '10:45',
        id: '2026-08-04-10:00',
        startTime: '10:00',
        status: 'available',
      },
      {
        date: '2026-08-04',
        endTime: '11:30',
        id: '2026-08-04-10:45',
        startTime: '10:45',
        status: 'available',
      },
    ])
  })

  it('asocia el estado y la cita dummy al bloque correcto', () => {
    const slots = generateAgendaSlots({
      appointments: demoAppointments,
      date: '2026-08-04',
      scheduleSegments: demoScheduleSegments,
    })

    expect(slots.find((slot) => slot.startTime === '09:00')).toMatchObject({
      status: 'reserved',
      appointmentId: 'appointment-1',
      appointment: { clientName: 'Camila Rojas' },
    })
    expect(slots.find((slot) => slot.startTime === '10:30')).toMatchObject({
      status: 'blocked',
      appointmentId: 'appointment-2',
    })
  })

  it('omite un bloque retirado sin mover los horarios siguientes', () => {
    const slots = generateAgendaSlots({
      appointments: [],
      date: '2026-08-04',
      scheduleSegments: [
        {
          blockCount: 3,
          enabled: true,
          excludedBlockIndexes: [1],
          id: 'segment-tuesday-test',
          startTime: '10:00',
          serviceMode: 'in-person',
          weekday: 'tuesday',
        },
      ],
    })

    expect(slots.map((slot) => slot.startTime)).toEqual(['10:00', '11:30'])
  })

  it('ignora jornadas inactivas, inválidas y duplicadas', () => {
    const slots = generateAgendaSlots({
      appointments: [],
      date: '2026-08-04',
      scheduleSegments: [
        {
          blockCount: 1,
          enabled: false,
          id: 'disabled',
          startTime: '08:00',
          serviceMode: 'in-person',
          weekday: 'tuesday',
        },
        {
          blockCount: 2,
          enabled: true,
          id: 'valid',
          startTime: '10:00',
          serviceMode: 'in-person',
          weekday: 'tuesday',
        },
        {
          blockCount: 1,
          enabled: true,
          id: 'duplicate',
          startTime: '10:00',
          serviceMode: 'in-person',
          weekday: 'tuesday',
        },
        {
          blockCount: 2,
          enabled: true,
          id: 'cross-midnight',
          startTime: '23:30',
          serviceMode: 'in-person',
          weekday: 'tuesday',
        },
      ],
    })

    expect(slots.map((slot) => slot.startTime)).toEqual(['10:00', '10:45'])
  })
})
