import { useState, useTransition } from 'react'

import { Link, useNavigate, useSearch } from '@tanstack/react-router'

import { AppButton } from '@/components/ui/app-button'
import { BannerWrapper } from '@/components/ui/banner-wrapper'
import { Icon } from '@/components/ui/icon'
import { IconButton } from '@/components/ui/icon-button'
import { AgendaSlotCard } from '@/features/agenda/components/agenda-slot-card'
import { AgendaStatusFilter } from '@/features/agenda/components/agenda-status-filter'
import {
  ReservationDialog,
  type ReservationDraft,
} from '@/features/agenda/components/reservation-dialog'
import { RescheduleDialog } from '@/features/agenda/components/reschedule-dialog'
import { DateStrip } from '@/features/agenda/components/date-strip'
import { generateAgendaSlots } from '@/features/agenda/lib/generate-agenda-slots'
import {
  formatLongDate,
  formatMonthLabel,
  formatWeekDayRangeLabel,
  getWeekDates,
  shiftDate,
  shiftMonth,
  todayDateKey,
} from '@/lib/date-utils'
import { useAgendaStore } from '@/stores/agenda-store'
import { usePaymentStore } from '@/stores/payment-store'
import type { AgendaSlot, DateKey, SlotStatus } from '@/types/agenda'

const statusFilters: Array<{
  pluralLabel: string
  singularLabel: string
  status: SlotStatus
}> = [
  { pluralLabel: 'disponibles', singularLabel: 'disponible', status: 'available' },
  { pluralLabel: 'pendientes', singularLabel: 'pendiente', status: 'pending' },
  { pluralLabel: 'confirmadas', singularLabel: 'confirmada', status: 'confirmed' },
  { pluralLabel: 'bloqueadas', singularLabel: 'bloqueada', status: 'blocked' },
]

export function AgendaPage() {
  const search = useSearch({ from: '/agenda' })
  const navigate = useNavigate({ from: '/agenda' })
  const [isPending, startTransition] = useTransition()
  const [selectedSlot, setSelectedSlot] = useState<AgendaSlot | null>(null)
  const [reschedulingSlot, setReschedulingSlot] = useState<AgendaSlot | null>(null)
  const [statusFilter, setStatusFilter] = useState<SlotStatus | null>(null)
  const appointmentBufferMinutes = useAgendaStore(
    (state) => state.appointmentBufferMinutes,
  )
  const scheduleSegments = useAgendaStore((state) => state.scheduleSegments)
  const patients = useAgendaStore((state) => state.patients)
  const appointments = useAgendaStore((state) => state.appointments)
  const blockedDates = useAgendaStore((state) => state.blockedDates)
  const savePatient = useAgendaStore((state) => state.savePatient)
  const createAppointment = useAgendaStore((state) => state.createAppointment)
  const confirmAppointment = useAgendaStore((state) => state.confirmAppointment)
  const cancelAppointment = useAgendaStore((state) => state.cancelAppointment)
  const attachProof = useAgendaStore((state) => state.attachProof)
  const blockSlot = useAgendaStore((state) => state.blockSlot)
  const unblockSlot = useAgendaStore((state) => state.unblockSlot)
  const rescheduleAppointment = useAgendaStore((state) => state.rescheduleAppointment)
  const toggleDateBlock = useAgendaStore((state) => state.toggleDateBlock)
  const paymentSettings = usePaymentStore((state) => state.settings)
  const selectedDate = search.date ?? todayDateKey()
  const isSelectedDateBlocked = blockedDates.includes(selectedDate)
  const dates = getWeekDates(selectedDate)
  const getSlotsForDate = (date: DateKey) =>
    generateAgendaSlots({
      appointments,
      date,
      scheduleSegments,
      bufferMinutes: appointmentBufferMinutes,
    })
  const slots = getSlotsForDate(selectedDate)
  const disabledDates = new Set(
    dates.filter((date) => getSlotsForDate(date).length === 0),
  )
  const displaySlots = isSelectedDateBlocked
    ? slots.map((slot) =>
        slot.status === 'available'
          ? { ...slot, status: 'blocked' as const }
          : slot,
      )
    : slots
  const filteredSlots = statusFilter
    ? displaySlots.filter((slot) => slot.status === statusFilter)
    : displaySlots

  function selectDate(date: DateKey) {
    startTransition(() => {
      void navigate({
        search: (previous) => ({ ...previous, date }),
      })
    })
  }

  function goToToday() {
    selectDate(todayDateKey())
  }

  function shiftSelectedDate(days: number) {
    selectDate(shiftDate(selectedDate, days))
  }

  function shiftSelectedMonth(months: number) {
    selectDate(shiftMonth(selectedDate, months))
  }

  function toggleStatusFilter(status: SlotStatus) {
    setStatusFilter((currentStatus) => (currentStatus === status ? null : status))
  }

  function openReservation(slot: AgendaSlot) {
    if (slot.status === 'available') {
      setSelectedSlot(slot)
    }
  }

  function closeReservation() {
    setSelectedSlot(null)
  }

  function openReschedule(slot: AgendaSlot) {
    if (slot.status === 'confirmed' && slot.appointment) {
      setReschedulingSlot(slot)
    }
  }

  function closeReschedule() {
    setReschedulingSlot(null)
  }

  function handleUnblock(slot: AgendaSlot) {
    unblockSlot(slot.date, slot.startTime)
  }

  function handleReschedule(slot: AgendaSlot) {
    const appointmentId = reschedulingSlot?.appointment?.id

    if (!appointmentId) {
      return false
    }

    const didReschedule = rescheduleAppointment(appointmentId, {
      date: slot.date,
      startTime: slot.startTime,
    })

    if (didReschedule) {
      closeReschedule()

      if (slot.date !== selectedDate) {
        selectDate(slot.date)
      }
    }

    return didReschedule
  }

  function handleCreateReservation(draft: ReservationDraft) {
    if (!selectedSlot) {
      return null
    }

    const savedPatient = savePatient(draft.patient)

    return createAppointment({
      clientName: `${savedPatient.firstName} ${savedPatient.lastName}`,
      date: selectedSlot.date,
      patient: savedPatient,
      pricing: draft.pricing,
      proofDeadlineHours: paymentSettings.proofDeadlineHours,
      serviceName: draft.serviceName,
      startTime: selectedSlot.startTime,
      status: paymentSettings.proofDeadlineHours > 0 ? 'pending' : 'confirmed',
    })
  }

  return (
    <div className="space-y-6" data-pending={isPending}>
      <BannerWrapper
        ariaLabel="Introducción de la agenda"
        dismissLabel="Ocultar introducción de la agenda"
        storageKey="agenda-intro"
      >
        <div>
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">
            <span className="size-2 rounded-full bg-accent" />
            Tu semana, a la vista
          </p>
          <h1 className="max-w-xl font-display text-4xl font-bold leading-[0.95] tracking-[-0.07em] text-ink sm:text-5xl">
            Una agenda que se siente <span className="scribble-underline">tuya</span>.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
            Revisa cada espacio, cuida tus pausas y llega a cada cita con la cabeza despejada.
          </p>
        </div>
      </BannerWrapper>

      <section aria-label="Navegación del calendario" className="space-y-3">
        <p className="px-1 text-right text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">
          Mes visible
        </p>
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <AppButton className="shrink-0" onClick={goToToday} variant="accent">
            <Icon name="spark" size={17} />
            Hoy
          </AppButton>
          <div className="flex min-w-0 place-self-end items-center gap-2 sm:gap-3">
            <IconButton label="Mes anterior" onClick={() => shiftSelectedMonth(-1)}>
              <Icon name="arrow-left" size={19} />
            </IconButton>
            <div className="min-w-0 text-center">
              <h2 className="min-w-0 max-w-56 text-center font-display text-xl font-bold leading-tight tracking-[-0.06em] text-ink sm:max-w-none sm:text-2xl">
                {formatMonthLabel(selectedDate)}
              </h2>
              <p className="whitespace-nowrap text-xs font-medium text-ink-muted">
                {formatWeekDayRangeLabel(selectedDate)}
              </p>
            </div>
            <IconButton label="Mes siguiente" onClick={() => shiftSelectedMonth(1)}>
              <Icon name="arrow-right" size={19} />
            </IconButton>
          </div>
        </div>
        <DateStrip
          dates={dates}
          disabledDates={disabledDates}
          onSelect={selectDate}
          onShift={shiftSelectedDate}
          selectedDate={selectedDate}
        />
      </section>

      <section
        className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3 md:grid md:grid-cols-[1fr_auto] md:items-end md:gap-4"
        data-day-blocked={isSelectedDateBlocked}
      >
        <div className="min-w-0">
          <p className="text-sm font-bold capitalize text-ink-muted">
            {formatLongDate(selectedDate)}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h2 className="font-display text-3xl font-bold tracking-[-0.06em] text-ink">
              Mi agenda
            </h2>
            <IconButton
              aria-pressed={isSelectedDateBlocked}
              className={
                isSelectedDateBlocked
                  ? 'border-ink bg-accent text-accent-ink shadow-action-accent hover:shadow-action-accent-hover'
                  : 'border-line-strong text-ink'
              }
              label={isSelectedDateBlocked ? 'Desbloquear día' : 'Bloquear día'}
              onClick={() => toggleDateBlock(selectedDate)}
              size="sm"
              title={isSelectedDateBlocked ? 'Desbloquear día' : 'Bloquear día'}
              type="button"
            >
              <Icon name={isSelectedDateBlocked ? 'unlock' : 'lock'} size={16} />
            </IconButton>
          </div>
          {isSelectedDateBlocked ? (
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-danger-ink">
              <Icon name="lock" size={13} />
              Día bloqueado para nuevas reservas
            </p>
          ) : null}
        </div>
        <div className="basis-full ml-0 flex flex-wrap justify-start gap-1.5 sm:gap-2 md:basis-auto md:ml-auto md:justify-end">
          {statusFilters.map(({ pluralLabel, singularLabel, status }) => {
            const count = displaySlots.filter((slot) => slot.status === status).length

            return (
              <AgendaStatusFilter
                active={statusFilter === status}
                count={count}
                key={status}
                label={count === 1 ? singularLabel : pluralLabel}
                onClick={() => toggleStatusFilter(status)}
                status={status}
              />
            )
          })}
        </div>
      </section>

      {displaySlots.length > 0 ? (
        filteredSlots.length > 0 ? (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filteredSlots.map((slot) => (
              <AgendaSlotCard
                key={slot.id}
                onBlock={blockSlot}
                onCancel={cancelAppointment}
                onConfirm={confirmAppointment}
                onReschedule={openReschedule}
                onReserve={openReservation}
                onUnblock={handleUnblock}
                slot={slot}
              />
            ))}
          </ul>
        ) : (
          <section className="rounded-card border-2 border-dashed border-line-strong bg-surface p-8 text-center shadow-card sm:p-10">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-surface-subtle text-ink-muted">
              <Icon name="calendar" size={22} />
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold tracking-[-0.05em] text-ink">
              No hay bloques{' '}
              {statusFilters.find((filter) => filter.status === statusFilter)?.pluralLabel}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
              Prueba con otro estado o muestra todos los bloques de este día.
            </p>
            <AppButton className="mt-5" onClick={() => setStatusFilter(null)} variant="outline">
              Mostrar todos
            </AppButton>
          </section>
        )
      ) : (
        <section className="rounded-card border-2 border-dashed border-line-strong bg-surface p-8 text-center shadow-card sm:p-12">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-accent-soft text-accent-ink">
            <Icon name="calendar" size={25} />
          </span>
          <h2 className="mt-5 font-display text-2xl font-bold tracking-[-0.05em] text-ink">
            Este día todavía está abierto
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
            No hay bloques activos para esta fecha. Configura una jornada y la agenda aparecerá aquí.
          </p>
          <Link
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-control border-2 border-ink bg-ink px-5 text-sm font-bold text-surface shadow-action-accent transition hover:-translate-y-0.5 hover:shadow-action-accent-hover"
            to="/horarios"
          >
            Configurar horarios
          </Link>
        </section>
      )}

      {selectedSlot ? (
        <ReservationDialog
          onAttachProof={attachProof}
          onClose={closeReservation}
          onSubmit={handleCreateReservation}
          patients={patients}
          pricingOptions={paymentSettings.pricingOptions}
          proofDeadlineHours={paymentSettings.proofDeadlineHours}
          slot={selectedSlot}
        />
      ) : null}

      {reschedulingSlot?.appointment ? (
        <RescheduleDialog
          appointment={reschedulingSlot.appointment}
          appointments={appointments}
          appointmentBufferMinutes={appointmentBufferMinutes}
          blockedDates={blockedDates}
          onClose={closeReschedule}
          onSubmit={handleReschedule}
          scheduleSegments={scheduleSegments}
          serviceMode={reschedulingSlot.serviceMode}
        />
      ) : null}
    </div>
  )
}
