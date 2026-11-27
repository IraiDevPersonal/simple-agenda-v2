import { useEffect, useMemo, useRef, useState } from 'react'

import { AppButton } from '@/components/ui/app-button'
import { AppInput } from '@/components/ui/app-input'
import { Icon } from '@/components/ui/icon'
import { IconButton } from '@/components/ui/icon-button'
import { generateAgendaSlots } from '@/features/agenda/lib/generate-agenda-slots'
import { formatLongDate, isValidDateKey } from '@/lib/date-utils'
import { getServiceModeLabel } from '@/lib/service-mode-utils'
import type {
  AgendaSlot,
  Appointment,
  AppointmentBufferMinutes,
  DateKey,
  ScheduleSegment,
} from '@/types/agenda'

type RescheduleDialogProps = {
  appointment: Appointment
  appointments: Appointment[]
  appointmentBufferMinutes: AppointmentBufferMinutes
  blockedDates: DateKey[]
  scheduleSegments: ScheduleSegment[]
  serviceMode: AgendaSlot['serviceMode']
  onClose: () => void
  onSubmit: (slot: AgendaSlot) => boolean
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
    ),
  )
}

function getAppointmentName(appointment: Appointment) {
  if (appointment.patient) {
    return `${appointment.patient.firstName} ${appointment.patient.lastName}`.trim()
  }

  return appointment.clientName || 'esta cita'
}

export function RescheduleDialog({
  appointment,
  appointments,
  appointmentBufferMinutes,
  blockedDates,
  scheduleSegments,
  serviceMode,
  onClose,
  onSubmit,
}: RescheduleDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [selectedDate, setSelectedDate] = useState<DateKey>(appointment.date)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const availableSlots = useMemo(() => {
    if (blockedDates.includes(selectedDate)) {
      return []
    }

    return generateAgendaSlots({
      appointments: appointments.filter((item) => item.id !== appointment.id),
      bufferMinutes: appointmentBufferMinutes,
      date: selectedDate,
      scheduleSegments,
    }).filter(
      (slot) =>
        slot.status === 'available' &&
        slot.serviceMode === serviceMode &&
        !(slot.date === appointment.date && slot.startTime === appointment.startTime),
    )
  }, [appointment, appointments, appointmentBufferMinutes, blockedDates, scheduleSegments, selectedDate, serviceMode])

  const selectedSlot = availableSlots.find((slot) => slot.id === selectedSlotId)

  useEffect(() => {
    const dialog = dialogRef.current
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null

    if (!dialog) {
      return undefined
    }

    const dialogElement = dialog

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const focusables = getFocusableElements(dialogElement)

      if (focusables.length === 0) {
        event.preventDefault()
        dialogElement.focus()
        return
      }

      const firstFocusable = focusables[0]
      const lastFocusable = focusables[focusables.length - 1]

      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault()
        lastFocusable.focus()
      } else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault()
        firstFocusable.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [onClose])

  useEffect(() => {
    dialogRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
  }, [])

  function handleDateChange(value: string) {
    if (!isValidDateKey(value)) {
      return
    }

    setSelectedDate(value)
    setSelectedSlotId(null)
    setError('')
  }

  function handleSubmit() {
    if (!selectedSlot) {
      setError('Selecciona un horario disponible para continuar.')
      return
    }

    if (!onSubmit(selectedSlot)) {
      setError('Ese horario ya no está disponible. Selecciona otro bloque.')
      return
    }

    onClose()
  }

  const appointmentName = getAppointmentName(appointment)

  return (
    <div
      className="fixed inset-0 z-40 grid items-end bg-ink/30 p-3 backdrop-blur-[2px] sm:place-items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        aria-describedby="reschedule-dialog-description"
        aria-labelledby="reschedule-dialog-title"
        aria-modal="true"
        className="max-h-[min(42rem,calc(100svh-1.5rem))] w-full max-w-none overflow-y-auto rounded-card border-2 border-line bg-surface p-5 shadow-float sm:max-w-lg sm:p-6"
        data-slot="reschedule-dialog"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">
              Reagendar cita
            </p>
            <h2
              className="mt-1 truncate font-display text-2xl font-bold tracking-[-0.06em] text-ink"
              id="reschedule-dialog-title"
            >
              {appointmentName}
            </h2>
          </div>
          <IconButton label="Cerrar reagendamiento" onClick={onClose} type="button">
            <Icon name="x" size={17} />
          </IconButton>
        </header>

        <p
          className="mt-4 text-sm leading-relaxed text-ink-muted"
          id="reschedule-dialog-description"
        >
          Elige una nueva fecha y un horario disponible. La cita actual se conservará hasta confirmar el cambio.
        </p>

        <div className="mt-5 grid gap-2">
          <label
            className="text-xs font-bold uppercase tracking-[0.09em] text-ink-muted"
            htmlFor="reschedule-date"
          >
            Nueva fecha
          </label>
          <AppInput
            autoFocus
            data-autofocus="true"
            id="reschedule-date"
            onChange={(event) => handleDateChange(event.currentTarget.value)}
            type="date"
            value={selectedDate}
          />
          <p className="text-xs text-ink-muted">
            {formatLongDate(selectedDate)} · {getServiceModeLabel(serviceMode)}
          </p>
        </div>

        <section aria-labelledby="reschedule-slots-title" className="mt-5">
          <div className="flex items-baseline justify-between gap-3">
            <h3
              className="font-display text-lg font-bold tracking-[-0.04em] text-ink"
              id="reschedule-slots-title"
            >
              Horarios disponibles
            </h3>
            <span className="text-xs font-bold text-ink-muted">
              {availableSlots.length} {availableSlots.length === 1 ? 'opción' : 'opciones'}
            </span>
          </div>

          {availableSlots.length > 0 ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {availableSlots.map((slot) => {
                const isSelected = slot.id === selectedSlotId

                return (
                  <button
                    aria-pressed={isSelected}
                    className={`flex min-h-14 items-center justify-between gap-3 rounded-control border-2 px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus/20 ${isSelected ? 'border-ink bg-accent text-accent-ink shadow-action-accent' : 'border-line-strong bg-surface text-ink hover:border-ink hover:bg-surface-subtle'}`}
                    key={slot.id}
                    onClick={() => {
                      setSelectedSlotId(slot.id)
                      setError('')
                    }}
                    type="button"
                  >
                    <span>
                      <span className="block font-display text-lg font-bold leading-none tracking-[-0.04em]">
                        {slot.startTime}
                      </span>
                      <span className="mt-1 block text-xs font-bold opacity-75">
                        Termina a las {slot.endTime}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-bold">
                      {getServiceModeLabel(slot.serviceMode)}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <p className="mt-3 rounded-control border border-dashed border-line-strong bg-surface-subtle p-4 text-sm leading-relaxed text-ink-muted">
              {blockedDates.includes(selectedDate)
                ? 'Este día está bloqueado para nuevas reservas.'
                : 'No hay horarios disponibles para esta modalidad en esta fecha.'}
            </p>
          )}
        </section>

        {error ? (
          <p className="mt-4 text-sm font-bold text-danger-ink" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-line pt-4">
          <AppButton onClick={onClose} type="button" variant="outline">
            Cancelar
          </AppButton>
          <AppButton disabled={!selectedSlot} onClick={handleSubmit} type="button" variant="accent">
            Confirmar horario
            <Icon name="check" size={16} />
          </AppButton>
        </div>
      </div>
    </div>
  )
}
