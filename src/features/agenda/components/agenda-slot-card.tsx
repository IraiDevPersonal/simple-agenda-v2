import { Icon } from '@/components/ui/icon'
import { StatusPill } from '@/components/ui/status-pill'
import { cn } from '@/lib/cn'
import type { AgendaSlot, SlotStatus } from '@/types/agenda'

type AgendaSlotCardProps = {
  slot: AgendaSlot
}

const statusCopy: Record<SlotStatus, string> = {
  available: 'Disponible',
  reserved: 'Reservada',
  blocked: 'Bloqueado',
}

const statusAccent: Record<SlotStatus, string> = {
  available: 'bg-success-ink',
  reserved: 'bg-accent',
  blocked: 'bg-danger-ink',
}

export function AgendaSlotCard({ slot }: AgendaSlotCardProps) {
  const appointment = slot.appointment
  const isReserved = slot.status === 'reserved'
  const isBlocked = slot.status === 'blocked'

  return (
    <li className="h-full">
      <article
        data-slot="agenda-slot-card"
        data-state={slot.status}
        className={cn(
          'relative flex h-full min-h-40 flex-col overflow-hidden rounded-card border-2 border-line bg-surface p-4 shadow-action transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-line-strong hover:shadow-action-hover',
          isReserved && 'border-ink',
          isBlocked && 'bg-surface-subtle',
        )}
      >
        <span
          aria-hidden="true"
          className={cn('absolute inset-x-0 top-0 h-1.5', statusAccent[slot.status])}
        />

        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="min-w-0">
            <p className="font-display text-xl font-bold leading-none tracking-[-0.06em] tabular-nums text-ink">
              {slot.startTime}
            </p>
            <span className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-ink-muted">
              <Icon name="clock" size={13} />
              45 min
            </span>
          </div>
          <StatusPill status={slot.status}>{statusCopy[slot.status]}</StatusPill>
        </div>

        <div className="mt-4 min-w-0">
          <p className="line-clamp-2 text-pretty font-display text-base font-bold leading-tight tracking-[-0.04em] text-ink sm:text-lg">
            {isReserved
              ? appointment?.clientName
              : isBlocked
                ? appointment?.label
                : 'Espacio listo para reservar'}
          </p>
          <p className="mt-1 text-sm leading-5 text-ink-muted">
            {isReserved
              ? appointment?.serviceName
              : isBlocked
                ? 'Este bloque no está disponible'
                : `Termina a las ${slot.endTime}`}
          </p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-3 text-xs text-ink-muted">
          <span className="min-w-0 truncate">
            {isReserved ? 'Cita confirmada' : isBlocked ? 'Tiempo reservado' : 'Bloque de agenda'}
          </span>
          <span className="shrink-0 font-mono font-bold tabular-nums text-ink">{slot.endTime}</span>
        </div>
      </article>
    </li>
  )
}
