import { Icon } from '@/components/ui/icon'

type ScheduleBlockChipProps = {
  onRemove: () => void
  time: string
}

export function ScheduleBlockChip({ onRemove, time }: ScheduleBlockChipProps) {
  return (
    <button
      aria-label={`Quitar bloque de las ${time}`}
      className="group inline-flex min-h-11 touch-manipulation items-center gap-2 rounded-pill border border-line-strong bg-surface px-3 py-1.5 font-mono text-sm font-bold text-ink-muted transition-[background-color,border-color,box-shadow,color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-ink hover:bg-surface hover:text-ink hover:shadow-outline-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus/20 active:translate-y-0 active:shadow-none"
      onClick={onRemove}
      type="button"
    >
      <time dateTime={time}>{time}</time>
      <Icon
        className="text-ink-muted transition-colors duration-200 group-hover:text-danger-ink"
        name="x"
        size={14}
      />
    </button>
  )
}
