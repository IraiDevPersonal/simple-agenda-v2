import type { ChangeEvent } from 'react'

import { AppSelect } from '@/components/ui/app-select'
import { Icon } from '@/components/ui/icon'
import { IconButton } from '@/components/ui/icon-button'
import { ScheduleBlockChip } from '@/features/schedule/components/schedule-block-chip'
import { getSegmentEndTime } from '@/features/schedule/lib/schedule-validation'
import { cn } from '@/lib/cn'
import { getScheduleBlocks } from '@/lib/schedule-block-utils'
import type { ScheduleSegment, ServiceMode } from '@/types/agenda'

const serviceModeOptions: Array<{ value: ServiceMode; label: string }> = [
  { value: 'remote', label: 'Remoto' },
  { value: 'in-person', label: 'Presencial' },
  { value: 'home-visit', label: 'A domicilio' },
]

type ScheduleSegmentEditorProps = {
  segment: ScheduleSegment
  errors: string[]
  onChange: (
    update: Partial<
      Pick<ScheduleSegment, 'startTime' | 'blockCount' | 'excludedBlockIndexes' | 'serviceMode'>
    >,
  ) => void
  onRemove: () => void
}

export function ScheduleSegmentEditor({
  errors,
  onChange,
  onRemove,
  segment,
}: ScheduleSegmentEditorProps) {
  const endTime = getSegmentEndTime(segment)
  const blocks = getScheduleBlocks(segment)
  const hasErrors = errors.length > 0
  const nextBlockEndTime = getSegmentEndTime({
    ...segment,
    blockCount: segment.blockCount + 1,
  })
  const canAddBlock = nextBlockEndTime !== null

  function handleAddBlock() {
    if (canAddBlock) {
      onChange({ blockCount: segment.blockCount + 1 })
    }
  }

  function handleRemoveBlock(blockIndex: number) {
    const excludedBlockIndexes = new Set(segment.excludedBlockIndexes ?? [])

    excludedBlockIndexes.add(blockIndex)
    onChange({
      excludedBlockIndexes: [...excludedBlockIndexes].sort(
        (first, second) => first - second,
      ),
    })
  }

  function handleServiceModeChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextServiceMode = serviceModeOptions.find(
      (option) => option.value === event.currentTarget.value,
    )?.value

    if (nextServiceMode) {
      onChange({ serviceMode: nextServiceMode })
    }
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
      <div className="grid gap-3 sm:grid-cols-[1fr_1.15fr_auto] sm:items-end">
        <label className="grid min-w-0 gap-1.5 text-xs font-bold uppercase tracking-[0.09em] text-ink-muted">
          Empieza a las
          <span className="relative">
            <Icon
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
              name="clock"
              size={16}
            />
            <input
              autoComplete="off"
              aria-describedby={hasErrors ? `${segment.id}-errors` : undefined}
              aria-label="Hora de inicio"
              aria-invalid={hasErrors}
              className="app-time-input min-h-11 w-full rounded-control border-2 border-line-strong bg-surface px-10 text-base font-bold text-ink outline-none transition focus:border-ink focus-visible:ring-4 focus-visible:ring-focus/20"
              name={`${segment.id}-start-time`}
              onChange={(event) => onChange({ startTime: event.currentTarget.value })}
              type="time"
              value={segment.startTime}
            />
            <Icon
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink"
              name="clock"
              size={16}
            />
          </span>
        </label>

        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-end gap-3 sm:contents">
          <label className="grid min-w-0 gap-1.5 text-xs font-bold uppercase tracking-[0.09em] text-ink-muted">
            Modalidad de atención
            <AppSelect
              autoComplete="off"
              aria-describedby={hasErrors ? `${segment.id}-errors` : undefined}
              aria-label="Modalidad de atención"
              aria-invalid={hasErrors}
              name={`${segment.id}-service-mode`}
              onChange={handleServiceModeChange}
              value={segment.serviceMode}
            >
              {serviceModeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </AppSelect>
          </label>

          <IconButton label="Eliminar tramo" onClick={onRemove}>
            <Icon name="trash" size={17} />
          </IconButton>
        </div>
      </div>

      <div
        aria-labelledby={`${segment.id}-preview-label`}
        className="mt-4 border-t border-line pt-3"
        role="group"
      >
        <div className="flex items-center justify-between gap-3">
          <h4
            className="text-xs font-bold uppercase tracking-[0.09em] text-ink-muted"
            id={`${segment.id}-preview-label`}
          >
            Bloques de 45 min
          </h4>
          <IconButton
            aria-disabled={!canAddBlock}
            disabled={!canAddBlock}
            label="Añadir bloque"
            onClick={handleAddBlock}
          >
            <Icon name="plus" size={16} />
          </IconButton>
        </div>

        <ul
          aria-label="Horarios de inicio"
          className="mt-2 flex flex-wrap items-center gap-2"
        >
          {blocks.map((block) => (
            <li key={block.index}>
              <ScheduleBlockChip
                onRemove={() => handleRemoveBlock(block.index)}
                time={block.startTime}
              />
            </li>
          ))}
          {blocks.length === 0 ? (
            <li className="text-sm font-bold text-danger-ink">Sin bloques disponibles.</li>
          ) : null}
        </ul>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-sm">
        <span className="font-bold text-ink-muted">Termina a las</span>
        <time
          className="rounded-pill bg-ink px-2.5 py-1 font-mono text-xs font-bold text-surface"
          dateTime={endTime ?? undefined}
        >
          {endTime ?? '—'}
        </time>
        <span className="text-ink-muted">·</span>
        <span className="text-ink-muted">
          {blocks.length > 0
            ? `${blocks.length} ${blocks.length === 1 ? 'bloque' : 'bloques'}`
            : 'sin bloques'}
        </span>
      </div>

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
