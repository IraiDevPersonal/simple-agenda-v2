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
})
