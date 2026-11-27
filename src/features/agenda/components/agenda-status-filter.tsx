import { Icon, type IconName } from '@/components/ui/icon'
import { cn } from '@/lib/cn'
import type { SlotStatus } from '@/types/agenda'

type AgendaStatusFilterProps = {
  active: boolean
  count: number
  label: string
  onClick: () => void
  status: SlotStatus
}

const statusIcons: Record<SlotStatus, IconName> = {
  available: 'calendar',
  pending: 'clock',
  confirmed: 'check',
  blocked: 'x',
}

const statusStyles: Record<SlotStatus, string> = {
  available: 'bg-success-soft text-success-ink',
  pending: 'bg-warning-soft text-warning-ink',
  confirmed: 'bg-accent-soft text-accent-ink',
  blocked: 'bg-danger-soft text-danger-ink',
}

export function AgendaStatusFilter({
  active,
  count,
  label,
  onClick,
  status,
}: AgendaStatusFilterProps) {
  const actionLabel = active ? 'Quitar filtro de' : 'Filtrar por'

  return (
    <button
      aria-label={`${actionLabel} ${label}. ${count} ${count === 1 ? 'bloque' : 'bloques'}`}
      aria-pressed={active}
      className={cn(
        'group inline-flex shrink-0 items-center gap-1.5 rounded-pill px-2.5 py-1 text-[0.68rem] font-bold normal-case transition-[background-color,box-shadow,color] duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus/20',
        statusStyles[status],
        active && 'shadow-outline ring-1 ring-ink',
      )}
      data-active={active}
      data-status={status}
      onClick={onClick}
      title={`${label} · ${count}`}
      type="button"
    >
      <span aria-hidden="true" className="sm:hidden">
        <Icon name={statusIcons[status]} size={14} />
      </span>
      <span aria-hidden="true" className="hidden size-1.5 rounded-full bg-current sm:inline-flex" />
      <span aria-hidden="true" className="tabular-nums">
        {count}
      </span>
      <span
        aria-hidden="true"
        className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[max-width,opacity] duration-200 group-focus-visible:max-w-28 group-focus-visible:opacity-100 group-hover:max-w-28 group-hover:opacity-100 sm:max-w-none sm:opacity-100"
      >
        {label}
      </span>
    </button>
  )
}
