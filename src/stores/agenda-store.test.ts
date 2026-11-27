import { beforeEach, describe, expect, it } from 'vitest'

import { useAgendaStore } from '@/stores/agenda-store'

describe('useAgendaStore', () => {
  beforeEach(() => {
    useAgendaStore.getState().resetDemoData()
  })

  it('activa y desactiva todos los tramos de un día', () => {
    useAgendaStore.getState().toggleWeekday('monday', false)
    expect(
      useAgendaStore.getState().scheduleSegments.filter((segment) => segment.weekday === 'monday'),
    ).toEqual([
      expect.objectContaining({ enabled: false }),
    ])

    useAgendaStore.getState().toggleWeekday('monday', true)
    expect(
      useAgendaStore.getState().scheduleSegments
        .filter((segment) => segment.weekday === 'monday')
        .every((segment) => segment.enabled),
    ).toBe(true)
  })

  it('actualiza y restaura la separación entre citas', () => {
    useAgendaStore.getState().setAppointmentBufferMinutes(10)
    expect(useAgendaStore.getState().appointmentBufferMinutes).toBe(10)

    useAgendaStore.getState().resetDemoData()
    expect(useAgendaStore.getState().appointmentBufferMinutes).toBe(0)
  })

  it('bloquea y desbloquea una fecha sin convertirla en una cita', () => {
    const date = '2026-11-20'

    useAgendaStore.getState().toggleDateBlock(date)
    expect(useAgendaStore.getState().blockedDates).toEqual([date])
    expect(useAgendaStore.getState().appointments).not.toContainEqual(
      expect.objectContaining({ date, status: 'blocked' }),
    )

    useAgendaStore.getState().toggleDateBlock(date)
    expect(useAgendaStore.getState().blockedDates).toEqual([])
  })

  it('bloquea y desbloquea un bloque disponible sin duplicarlo', () => {
    const slot = { date: '2026-11-20', startTime: '11:45' }

    useAgendaStore.getState().blockSlot(slot)
    expect(useAgendaStore.getState().appointments).toContainEqual(
      expect.objectContaining({
        date: slot.date,
        startTime: slot.startTime,
        status: 'blocked',
      }),
    )

    useAgendaStore.getState().blockSlot(slot)
    expect(
      useAgendaStore.getState().appointments.filter(
        (appointment) =>
          appointment.date === slot.date && appointment.startTime === slot.startTime,
      ),
    ).toHaveLength(1)

    useAgendaStore.getState().unblockSlot(slot.date, slot.startTime)
    expect(
      useAgendaStore.getState().appointments.some(
        (appointment) =>
          appointment.date === slot.date && appointment.startTime === slot.startTime,
      ),
    ).toBe(false)
  })

  it('reagenda una cita confirmada sin sobrescribir otro bloque', () => {
    const appointmentId = 'appointment-today-in-person'

    expect(
      useAgendaStore.getState().rescheduleAppointment(appointmentId, {
        date: '2026-11-23',
        startTime: '10:00',
      }),
    ).toBe(true)
    expect(useAgendaStore.getState().appointments).toContainEqual(
      expect.objectContaining({
        date: '2026-11-23',
        id: appointmentId,
        startTime: '10:00',
      }),
    )

    expect(
      useAgendaStore.getState().rescheduleAppointment(appointmentId, {
        date: '2026-11-20',
        startTime: '10:15',
      }),
    ).toBe(false)
  })

  it('agrega, edita y elimina un tramo', () => {
    const store = useAgendaStore.getState()
    const initialCount = store.scheduleSegments.length

    store.addSegment('monday')
    const added = useAgendaStore.getState().scheduleSegments
      .filter((segment) => segment.weekday === 'monday')
      .at(-1)

    expect(added).toBeDefined()
    expect(added).toMatchObject({
      serviceMode: 'in-person',
      startTime: '12:15',
    })
    expect(useAgendaStore.getState().scheduleSegments).toHaveLength(initialCount + 1)

    useAgendaStore.getState().updateSegment(added!.id, {
      blockCount: 4,
      serviceMode: 'remote',
      startTime: '12:00',
    })
    expect(useAgendaStore.getState().scheduleSegments.find((segment) => segment.id === added!.id)).toMatchObject({
      blockCount: 4,
      serviceMode: 'remote',
      startTime: '12:00',
    })

    useAgendaStore.getState().removeSegment(added!.id)
    expect(useAgendaStore.getState().scheduleSegments).toHaveLength(initialCount)
  })

  it('crea un tramo inicial al activar un día sin configuración', () => {
    const sundaySegment = useAgendaStore.getState().scheduleSegments.find(
      (segment) => segment.weekday === 'sunday',
    )
    useAgendaStore.getState().removeSegment(sundaySegment!.id)
    useAgendaStore.getState().toggleWeekday('sunday', true)

    expect(useAgendaStore.getState().scheduleSegments).toContainEqual(
      expect.objectContaining({
        blockCount: 2,
        enabled: true,
        serviceMode: 'in-person',
        startTime: '09:00',
        weekday: 'sunday',
      }),
    )
  })

  it('crea, confirma y cancela una reserva sin duplicar el bloque', () => {
    const appointment = {
      clientName: 'Sofía Pérez',
      date: '2026-08-10',
      proofDeadlineHours: 3,
      serviceName: 'Consulta inicial',
      startTime: '09:00',
      status: 'pending' as const,
    }

    useAgendaStore.getState().createAppointment(appointment)

    const created = useAgendaStore.getState().appointments.find(
      (item) => item.clientName === appointment.clientName,
    )

    expect(created).toMatchObject(appointment)
    expect(created?.id).toBeTruthy()

    useAgendaStore.getState().createAppointment(appointment)
    expect(
      useAgendaStore.getState().appointments.filter(
        (item) => item.date === appointment.date && item.startTime === appointment.startTime,
      ),
    ).toHaveLength(1)

    useAgendaStore.getState().confirmAppointment(created!.id)
    expect(
      useAgendaStore.getState().appointments.find((item) => item.id === created!.id),
    ).toMatchObject({ status: 'confirmed' })

    useAgendaStore.getState().cancelAppointment(created!.id)
    expect(useAgendaStore.getState().appointments).not.toContainEqual(
      expect.objectContaining({ id: created!.id }),
    )
  })

  it('recupera pacientes por RUT y guarda el comprobante de una reserva', () => {
    const existingPatient = useAgendaStore.getState().savePatient({
      email: 'camila.actualizada@ejemplo.cl',
      firstName: 'Camila',
      lastName: 'Rojas',
      phone: '+56 9 1111 2222',
      rut: '12.345.678-5',
    })

    expect(existingPatient.id).toBe('patient-1')
    expect(useAgendaStore.getState().patients[0]).toMatchObject({
      email: 'camila.actualizada@ejemplo.cl',
      phone: '+56 9 1111 2222',
    })

    const appointmentId = useAgendaStore.getState().createAppointment({
      clientName: 'Camila Rojas',
      date: '2026-08-10',
      patient: existingPatient,
      serviceName: 'Consulta inicial',
      startTime: '09:00',
      status: 'pending',
    })

    expect(appointmentId).toBeTruthy()
    useAgendaStore.getState().attachProof(appointmentId!, 'comprobante.pdf')
    expect(useAgendaStore.getState().appointments).toContainEqual(
      expect.objectContaining({
        id: appointmentId,
        proofFileName: 'comprobante.pdf',
      }),
    )
  })
})
