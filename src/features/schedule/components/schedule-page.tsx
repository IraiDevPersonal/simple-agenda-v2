import { useState, type FormEvent } from 'react'

import { AppButton } from '@/components/ui/app-button'
import { BannerWrapper } from '@/components/ui/banner-wrapper'
import { Icon } from '@/components/ui/icon'
import { StatusPill } from '@/components/ui/status-pill'
import { ScheduleDayCard } from '@/features/schedule/components/schedule-day-card'
import { validateScheduleSegments } from '@/features/schedule/lib/schedule-validation'
import { useAgendaStore } from '@/stores/agenda-store'
import type { Weekday } from '@/types/agenda'

const weekdayItems: Array<{ value: Weekday; label: string }> = [
  { value: 'monday', label: 'lunes' },
  { value: 'tuesday', label: 'martes' },
  { value: 'wednesday', label: 'miércoles' },
  { value: 'thursday', label: 'jueves' },
  { value: 'friday', label: 'viernes' },
  { value: 'saturday', label: 'sábado' },
  { value: 'sunday', label: 'domingo' },
]

export function SchedulePage() {
  const [saveMessage, setSaveMessage] = useState('')
  const scheduleSegments = useAgendaStore((state) => state.scheduleSegments)
  const addSegment = useAgendaStore((state) => state.addSegment)
  const removeSegment = useAgendaStore((state) => state.removeSegment)
  const resetDemoData = useAgendaStore((state) => state.resetDemoData)
  const toggleWeekday = useAgendaStore((state) => state.toggleWeekday)
  const updateSegment = useAgendaStore((state) => state.updateSegment)
  const activeWeekdays = new Set(
    scheduleSegments
      .filter((segment) => segment.enabled)
      .map((segment) => segment.weekday),
  )
  const activeSegments = scheduleSegments.filter((segment) => segment.enabled)
  const totalBlocks = activeSegments.reduce(
    (total, segment) => total + Math.max(0, segment.blockCount),
    0,
  )
  const validationErrors = validateScheduleSegments(scheduleSegments)
  const hasInvalidSegments = Object.values(validationErrors).some(
    (errors) => errors.length > 0,
  )

  function segmentsForDay(weekday: Weekday) {
    return scheduleSegments.filter((segment) => segment.weekday === weekday)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (hasInvalidSegments) {
      return
    }

    setSaveMessage('Horarios verificados y listos para recibir citas.')
  }

  return (
    <div className="space-y-6">
      <BannerWrapper
        ariaLabel="Introducción de la configuración de agenda"
        dismissLabel="Ocultar introducción de horarios"
        tone="ink"
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-accent">
              <Icon name="gear" size={15} />
              Configuración de agenda
            </p>
            <h1 className="max-w-xl font-display text-4xl font-bold leading-[0.95] tracking-[-0.07em] sm:text-5xl">
              Diseña una semana que <span className="text-accent">respire</span>.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-surface/70 sm:text-lg">
              Define el inicio y la cantidad de bloques. El fin se calcula solo, sin tiempo perdido ni espacios imposibles.
            </p>
          </div>
          <AppButton
            onClick={() => {
              resetDemoData()
              setSaveMessage('')
            }}
            variant="accent"
          >
            <Icon name="spark" size={17} />
            Restaurar demo
          </AppButton>
        </div>
      </BannerWrapper>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Resumen de horarios">
        <div className="rounded-control border-2 border-line bg-surface p-4 shadow-card">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-muted">Días activos</p>
          <p className="mt-2 font-display text-3xl font-bold tracking-[-0.06em] text-ink">{activeWeekdays.size}</p>
        </div>
        <div className="rounded-control border-2 border-line bg-surface p-4 shadow-card">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-muted">Tramos activos</p>
          <p className="mt-2 font-display text-3xl font-bold tracking-[-0.06em] text-ink">{activeSegments.length}</p>
        </div>
        <div className="rounded-control border-2 border-line bg-surface p-4 shadow-card">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-muted">Bloques semanales</p>
          <p className="mt-2 font-display text-3xl font-bold tracking-[-0.06em] text-ink">{totalBlocks}</p>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3 px-1">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">Disponibilidad semanal</p>
            <h2 className="mt-1 font-display text-3xl font-bold tracking-[-0.06em] text-ink">Tus horarios</h2>
          </div>
          <StatusPill status="available">45 min por bloque</StatusPill>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-3">
            {weekdayItems.map((day) => (
              <ScheduleDayCard
                key={day.value}
                label={day.label}
                onAdd={() => {
                  setSaveMessage('')
                  addSegment(day.value)
                }}
                onRemove={(segmentId) => {
                  setSaveMessage('')
                  removeSegment(segmentId)
                }}
                onToggle={(enabled) => {
                  setSaveMessage('')
                  toggleWeekday(day.value, enabled)
                }}
                onUpdate={(segmentId, update) => {
                  setSaveMessage('')
                  updateSegment(segmentId, update)
                }}
                segments={segmentsForDay(day.value)}
              />
            ))}
          </div>

          <div className="flex flex-col gap-3 rounded-card border-2 border-line bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <p className="max-w-xl text-sm leading-relaxed text-ink-muted" role="status">
              {hasInvalidSegments
                ? 'Corrige los tramos marcados antes de guardar tu disponibilidad.'
                : saveMessage || 'Los cambios se mantienen en esta sesión de demo.'}
            </p>
            <AppButton disabled={hasInvalidSegments} type="submit" variant="accent">
              <Icon name="check" size={17} />
              Guardar horarios
            </AppButton>
          </div>
        </form>
      </section>

      <p className="text-center text-xs text-ink-muted">
        La conexión con datos llegará después de aprobar la interfaz.
      </p>
    </div>
  )
}
