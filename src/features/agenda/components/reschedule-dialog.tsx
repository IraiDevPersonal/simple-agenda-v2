import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { AppButton } from '@/components/ui/app-button'
import { AppSelect } from '@/components/ui/app-select'
import { DatePicker } from '@/components/ui/date-picker'
import { Icon } from '@/components/ui/icon'
import { IconButton } from '@/components/ui/icon-button'
import { generateAgendaSlots } from '@/features/agenda/lib/generate-agenda-slots'
import {
  findPricingForAppointment,
  getConfiguredServiceModes,
  toAppointmentPricing,
} from '@/features/agenda/lib/pricing-utils'
import {
  formatLongDate,
  isDateTimeInPast,
  isValidDateKey,
  todayDateKey,
} from '@/lib/date-utils'
import { formatChileanPesos } from '@/lib/payment-utils'
import {
  getServiceModeLabel,
  SERVICE_MODE_OPTIONS,
} from '@/lib/service-mode-utils'
import type {
  Appointment,
  AppointmentBufferMinutes,
  DateKey,
  RescheduleTarget,
  ScheduleSegment,
  ServiceMode,
} from '@/types/agenda'
import type { PaymentPricing } from '@/types/payments'

type ServiceModeFilter = ServiceMode | 'all'

type RescheduleDialogProps = {
  appointment: Appointment
  appointments: Appointment[]
  appointmentBufferMinutes: AppointmentBufferMinutes
  blockedDates: DateKey[]
  pricingOptions: PaymentPricing[]
  proofDeadlineHours: number
  scheduleSegments: ScheduleSegment[]
  onClose: () => void
  onSubmit: (target: RescheduleTarget) => boolean
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
  pricingOptions,
  proofDeadlineHours,
  scheduleSegments,
  onClose,
  onSubmit,
}: RescheduleDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const todayDate = todayDateKey()
  const [selectedDate, setSelectedDate] = useState<DateKey>(() => todayDate)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [serviceModeFilter, setServiceModeFilter] = useState<ServiceModeFilter>('all')
  const [keepCurrentPrice, setKeepCurrentPrice] = useState(false)
  const [error, setError] = useState('')
  const [now, setNow] = useState(() => new Date())

  const currentPricing = useMemo(
    () => findPricingForAppointment(appointment, pricingOptions),
    [appointment, pricingOptions],
  )
  const configuredServiceModes = useMemo(
    () => getConfiguredServiceModes(currentPricing),
    [currentPricing],
  )
  const otherAppointments = useMemo(
    () => appointments.filter((item) => item.id !== appointment.id),
    [appointment.id, appointments],
  )

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date())
    }, 60_000)

    return () => window.clearInterval(intervalId)
  }, [])

  const getAvailableSlots = useCallback(
    (date: DateKey, modeFilter: ServiceModeFilter) => {
      if (blockedDates.includes(date) || configuredServiceModes.length === 0) {
        return []
      }

      return generateAgendaSlots({
        appointments: otherAppointments,
        bufferMinutes: appointmentBufferMinutes,
        date,
        scheduleSegments,
      }).filter(
        (slot) =>
          slot.status === 'available' &&
          !isDateTimeInPast(slot.date, slot.startTime, now) &&
          configuredServiceModes.includes(slot.serviceMode) &&
          (modeFilter === 'all' || slot.serviceMode === modeFilter) &&
          !(slot.date === appointment.date && slot.startTime === appointment.startTime),
      )
    },
    [
      appointment.date,
      appointment.startTime,
      appointmentBufferMinutes,
      blockedDates,
      configuredServiceModes,
      now,
      otherAppointments,
      scheduleSegments,
    ],
  )

  const availableSlots = useMemo(
    () => getAvailableSlots(selectedDate, serviceModeFilter),
    [getAvailableSlots, selectedDate, serviceModeFilter],
  )
  const selectedSlot = availableSlots.find((slot) => slot.id === selectedSlotId)
  const selectedSlotPricing = selectedSlot && currentPricing
    ? toAppointmentPricing(currentPricing, selectedSlot.serviceMode)
    : null
  const currentAmount = appointment.pricing?.amount ?? selectedSlotPricing?.amount ?? 0
  const priceDifference = selectedSlotPricing
    ? selectedSlotPricing.amount - currentAmount
    : null
  const finalPrice = keepCurrentPrice
    ? currentAmount
    : selectedSlotPricing?.amount ?? currentAmount
  const modeOptions = SERVICE_MODE_OPTIONS.filter(({ value }) =>
    configuredServiceModes.includes(value),
  )

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

  function hasAgendaSlots(date: DateKey) {
    return getAvailableSlots(date, serviceModeFilter).length > 0
  }

  function handleDateChange(value: string) {
    if (!isValidDateKey(value) || value < todayDate || !hasAgendaSlots(value)) {
      setError('Selecciona una fecha con bloques de agenda disponibles.')
      return
    }

    setSelectedDate(value)
    setSelectedSlotId(null)
    setError('')
  }

  function handleServiceModeChange(value: string) {
    const nextFilter = value as ServiceModeFilter

    setServiceModeFilter(nextFilter)
    setSelectedSlotId(null)
    setError('')
  }

  function handleSubmit() {
    if (!selectedSlot || !selectedSlotPricing) {
      setError('Selecciona un horario con una tarifa configurada para continuar.')
      return
    }

    if (!onSubmit({
      date: selectedSlot.date,
      keepCurrentPrice,
      pricing: selectedSlotPricing,
      proofDeadlineHours,
      startTime: selectedSlot.startTime,
    })) {
      setError('Ese horario ya no está disponible. Selecciona otro bloque.')
      return
    }

    onClose()
  }

  const appointmentName = getAppointmentName(appointment)
  const selectedModeLabel = selectedSlot
    ? getServiceModeLabel(selectedSlot.serviceMode)
    : serviceModeFilter === 'all'
      ? 'Todas'
      : getServiceModeLabel(serviceModeFilter)

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
        className="max-h-[min(46rem,calc(100svh-1.5rem))] w-full max-w-none overflow-y-auto rounded-card border-2 border-line bg-surface p-5 shadow-float sm:max-w-lg sm:p-6"
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

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <label
              className="text-xs font-bold uppercase tracking-[0.09em] text-ink-muted"
              htmlFor="reschedule-date"
            >
              Nueva fecha
            </label>
            <DatePicker
              id="reschedule-date"
              isDateDisabled={(date) => date < todayDate || !hasAgendaSlots(date)}
              minDate={todayDate}
              onSelect={handleDateChange}
              selectedDate={selectedDate}
            />
          </div>
          <div className="grid content-start gap-2">
            <label
              className="text-xs font-bold uppercase tracking-[0.09em] text-ink-muted"
              htmlFor="reschedule-service-mode"
            >
              Modalidad
            </label>
            <AppSelect
              data-autofocus="true"
              id="reschedule-service-mode"
              onChange={(event) => handleServiceModeChange(event.currentTarget.value)}
              value={serviceModeFilter}
            >
              <option value="all">Todas</option>
              {modeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </AppSelect>
          </div>
        </div>

        <p className="mt-2 text-xs text-ink-muted">
          {formatLongDate(selectedDate)} · {selectedModeLabel}
        </p>

        <section aria-labelledby="reschedule-slots-title" className="mt-5">
          <div className="flex items-baseline justify-between gap-3">
            <h3
              className="font-display text-lg font-bold tracking-[-0.04em] text-ink"
              id="reschedule-slots-title"
            >
              Horarios disponibles
            </h3>
            <span aria-live="polite" className="text-xs font-bold text-ink-muted">
              {availableSlots.length} {availableSlots.length === 1 ? 'opción' : 'opciones'}
            </span>
          </div>

          {availableSlots.length > 0 ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {availableSlots.map((slot) => {
                const isSelected = slot.id === selectedSlotId
                const slotPricing = currentPricing
                  ? toAppointmentPricing(currentPricing, slot.serviceMode)
                  : null

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
                    <span className="shrink-0 text-right text-xs font-bold">
                      <span className="block">{getServiceModeLabel(slot.serviceMode)}</span>
                      {slotPricing ? (
                        <span className="mt-0.5 block opacity-75">
                          {formatChileanPesos(slotPricing.amount)}
                        </span>
                      ) : null}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <p className="mt-3 rounded-control border border-dashed border-line-strong bg-surface-subtle p-4 text-sm leading-relaxed text-ink-muted">
              {blockedDates.includes(selectedDate)
                ? 'Este día está bloqueado para nuevas reservas.'
                : !currentPricing || modeOptions.length === 0
                  ? 'La tarifa de esta cita no tiene modalidades con precio configurado.'
                  : serviceModeFilter === 'all'
                    ? 'No hay horarios disponibles para esta fecha.'
                    : `No hay horarios disponibles para ${getServiceModeLabel(serviceModeFilter)} en esta fecha.`}
            </p>
          )}
        </section>

        <div className="mt-5 rounded-control border border-line bg-surface-subtle p-3">
          <label className="flex cursor-pointer items-start gap-3" htmlFor="reschedule-keep-price">
            <input
              checked={keepCurrentPrice}
              className="mt-0.5 size-4 accent-accent"
              id="reschedule-keep-price"
              onChange={(event) => setKeepCurrentPrice(event.currentTarget.checked)}
              type="checkbox"
            />
            <span className="min-w-0">
              <span className="block text-sm font-bold text-ink">Mantener precio actual</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">
                El profesional absorbe cualquier diferencia y la cita se reagenda directamente.
              </span>
            </span>
          </label>
        </div>

        {selectedSlotPricing ? (
          <div className="mt-3 rounded-control border border-line bg-surface p-3 text-sm">
            <div className="flex items-end justify-between gap-3">
              <div>
                <span className="block text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">
                  Precio final
                </span>
                <strong className="mt-1 block font-display text-xl font-bold tracking-[-0.04em] text-ink">
                  {formatChileanPesos(finalPrice)}
                </strong>
              </div>
              {keepCurrentPrice && priceDifference !== 0 ? (
                <div className="text-right">
                  <span className="block text-xs text-ink-muted">Tarifa modalidad</span>
                  <span className="text-sm text-ink-muted line-through">
                    {formatChileanPesos(selectedSlotPricing.amount)}
                  </span>
                </div>
              ) : null}
            </div>
            {keepCurrentPrice && priceDifference !== 0 ? (
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                Se conserva el precio actual aunque la tarifa de {getServiceModeLabel(selectedSlotPricing.serviceMode)} sea diferente.
              </p>
            ) : priceDifference !== null && priceDifference > 0 && proofDeadlineHours > 0 ? (
              <p className="mt-2 text-xs leading-relaxed text-warning-ink">
                La cita quedará pendiente para solicitar {formatChileanPesos(priceDifference)} adicionales.
              </p>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <p className="mt-4 text-sm font-bold text-danger-ink" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-line pt-4">
          <AppButton onClick={onClose} type="button" variant="outline">
            Cancelar
          </AppButton>
          <AppButton
            disabled={!selectedSlot || !selectedSlotPricing}
            onClick={handleSubmit}
            type="button"
            variant="accent"
          >
            Confirmar horario
            <Icon name="check" size={16} />
          </AppButton>
        </div>
      </div>
    </div>
  )
}
