import type { ChangeEvent } from 'react'

import { Icon } from '@/components/ui/icon'
import { IconButton } from '@/components/ui/icon-button'
import { cn } from '@/lib/cn'
import {
  getSegmentEndTime,
  getSegmentPreview,
} from '@/features/schedule/lib/schedule-validation'
import type { ScheduleSegment } from '@/types/agenda'

type ScheduleSegmentEditorProps = {
  segment: ScheduleSegment
  errors: string[]
  onChange: (update: Partial<Pick<ScheduleSegment, 'startTime' | 'blockCount'>>) => void
  onRemove: () => void
}

export function ScheduleSegmentEditor({
  errors,
  onChange,
  onRemove,
  segment,
}: ScheduleSegmentEditorProps) {
  const endTime = getSegmentEndTime(segment)
  const preview = getSegmentPreview(segment)
  const hasErrors = errors.length > 0

  function handleBlockCountChange(event: ChangeEvent<HTMLInputElement>) {
    onChange({ blockCount: Number(event.currentTarget.value) })
  }

  return (
    <div
      data-slot="schedule-segment-editor"
      data-state={hasErrors ? 'invalid' : 'valid'}
      className={cn(
        'rounded-control border-2 border-line bg-surface-subtle p-3 transition sm:p-4',
        hasErrors && 'border-danger-ink bg-danger-soft/35',
      )}
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="grid gap-1.5 text-xs font-bold uppercase tracking-[0.09em] text-ink-muted">
          Empieza a las
          <span className="relative">
            <Icon
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
              name="clock"
              size={16}
            />
            <input
              aria-describedby={hasErrors ? `${segment.id}-errors` : undefined}
              aria-label="Hora de inicio"
              aria-invalid={hasErrors}
              className="min-h-11 w-full rounded-control border-2 border-line-strong bg-surface px-10 text-base font-bold text-ink outline-none transition focus:border-ink focus-visible:ring-4 focus-visible:ring-focus/20"
              onChange={(event) => onChange({ startTime: event.currentTarget.value })}
              type="time"
              value={segment.startTime}
            />
          </span>
        </label>

        <label className="grid gap-1.5 text-xs font-bold uppercase tracking-[0.09em] text-ink-muted">
          Bloques de 45 min
          <input
            aria-describedby={hasErrors ? `${segment.id}-errors` : undefined}
            aria-label="Cantidad de bloques"
            aria-invalid={hasErrors}
            className="min-h-11 w-full rounded-control border-2 border-line-strong bg-surface px-3 text-base font-bold text-ink outline-none transition focus:border-ink focus-visible:ring-4 focus-visible:ring-focus/20"
            max={32}
            min={1}
            onChange={handleBlockCountChange}
            type="number"
            value={segment.blockCount}
          />
        </label>

        <IconButton label="Eliminar tramo" onClick={onRemove}>
          <Icon name="trash" size={17} />
        </IconButton>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-sm">
        <span className="font-bold text-ink-muted">Termina</span>
        <span className="rounded-pill bg-ink px-2.5 py-1 font-mono text-xs font-bold text-surface">
          {endTime ?? '—'}
        </span>
        <span className="text-ink-muted">·</span>
        <span className="text-ink-muted">
          {segment.blockCount > 0 ? `${segment.blockCount} ${segment.blockCount === 1 ? 'bloque' : 'bloques'} exactos` : 'sin bloques'}
        </span>
      </div>

      {preview.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Vista previa de bloques">
          {preview.map((time) => (
            <span
              className="rounded-pill border border-line-strong bg-surface px-2 py-1 font-mono text-[0.68rem] font-bold text-ink-muted"
              key={time}
            >
              {time}
            </span>
          ))}
          {segment.blockCount > preview.length ? (
            <span className="rounded-pill px-2 py-1 text-[0.68rem] font-bold text-ink-muted">
              +{segment.blockCount - preview.length} más
            </span>
          ) : null}
        </div>
      ) : null}

      {hasErrors ? (
        <ul id={`${segment.id}-errors`} className="mt-3 grid gap-1 text-sm font-bold text-danger-ink" role="alert">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
