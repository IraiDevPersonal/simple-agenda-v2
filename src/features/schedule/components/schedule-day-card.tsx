import { AppButton } from '@/components/ui/app-button'
import { Icon } from '@/components/ui/icon'
import { ScheduleSegmentEditor } from '@/features/schedule/components/schedule-segment-editor'
import { validateScheduleSegment } from '@/features/schedule/lib/schedule-validation'
import { cn } from '@/lib/cn'
import type { ScheduleSegment } from '@/types/agenda'

type ScheduleDayCardProps = {
  label: string
  segments: ScheduleSegment[]
  onToggle: (enabled: boolean) => void
  onAdd: () => void
  onUpdate: (segmentId: string, update: Partial<Pick<ScheduleSegment, 'startTime' | 'blockCount'>>) => void
  onRemove: (segmentId: string) => void
}

export function ScheduleDayCard({
  label,
  onAdd,
  onRemove,
  onToggle,
  onUpdate,
  segments,
}: ScheduleDayCardProps) {
  const activeSegments = segments.filter((segment) => segment.enabled)
  const activeSegmentCount = activeSegments.length
  const isEnabled = activeSegmentCount > 0

  return (
    <fieldset
      data-slot="schedule-day-card"
      data-state={isEnabled ? 'active' : 'inactive'}
      className={cn(
        'rounded-card border-2 border-line bg-surface p-4 shadow-card transition sm:p-5',
        isEnabled && 'border-ink',
      )}
    >
      <legend className="sr-only">Horario del {label}</legend>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="relative inline-flex min-h-11 cursor-pointer items-center">
            <input
              aria-label={`${isEnabled ? 'Desactivar' : 'Activar'} ${label}`}
              checked={isEnabled}
              className="peer sr-only"
              onChange={(event) => onToggle(event.currentTarget.checked)}
              type="checkbox"
            />
            <span className="flex h-7 w-12 items-center rounded-pill border-2 border-line-strong bg-surface-subtle p-0.5 transition peer-checked:border-ink peer-checked:bg-accent peer-focus-visible:ring-4 peer-focus-visible:ring-focus/20">
              <span className="size-5 rounded-full border-2 border-line-strong bg-surface transition peer-checked:translate-x-5 peer-checked:border-ink" />
            </span>
          </label>
          <div>
            <h3 className="font-display text-xl font-bold capitalize tracking-[-0.04em] text-ink">{label}</h3>
            <p className="mt-0.5 text-xs text-ink-muted">
              {isEnabled
                ? `${activeSegmentCount} tramo${activeSegmentCount === 1 ? '' : 's'} activo${activeSegmentCount === 1 ? '' : 's'}`
                : 'Día libre'}
            </p>
          </div>
        </div>
        <AppButton disabled={!isEnabled} onClick={onAdd} size="sm" variant="ghost">
          <Icon name="plus" size={16} />
          <span className="hidden sm:inline">Añadir tramo</span>
          <span className="sm:hidden">Añadir</span>
        </AppButton>
      </div>

      {isEnabled ? (
        <div className="mt-5 grid gap-3">
          {activeSegments.map((segment) => (
            <ScheduleSegmentEditor
              errors={validateScheduleSegment(
                segment,
                segments,
              )}
              key={segment.id}
              onChange={(update) => onUpdate(segment.id, update)}
              onRemove={() => onRemove(segment.id)}
              segment={segment}
            />
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-control border border-dashed border-line p-4 text-sm text-ink-muted">
          Activa este día cuando quieras recibir citas.
        </p>
      )}
    </fieldset>
  )
}
