import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'
import type { SlotStatus } from '@/types/agenda'

type StatusPillProps = {
  status: SlotStatus
  children: ReactNode
}

export function StatusPill({ children, status }: StatusPillProps) {
  return (
    <span
      data-slot="status-pill"
      data-state={status}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-pill px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em]',
        status === 'available' && 'bg-success-soft text-success-ink',
        status === 'reserved' && 'bg-accent-soft text-accent-ink',
        status === 'blocked' && 'bg-danger-soft text-danger-ink',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'size-1.5 rounded-full',
          status === 'available' && 'bg-success-ink',
          status === 'reserved' && 'bg-accent-ink',
          status === 'blocked' && 'bg-danger-ink',
        )}
      />
      {children}
    </span>
  )
}
