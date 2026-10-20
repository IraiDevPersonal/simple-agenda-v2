import type { ReactNode, SelectHTMLAttributes } from 'react'

import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/cn'

type AppSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  children: ReactNode
}

export function AppSelect({ children, className, ...props }: AppSelectProps) {
  return (
    <span className="app-select-shell relative block">
      <select
        {...props}
        className={cn(
          'app-select flex min-h-11 w-full items-center rounded-control border-2 border-line-strong bg-surface px-3 py-2.5 pr-10 text-base font-bold text-ink outline-none transition-[background-color,border-color,box-shadow] duration-200 ease-out hover:border-ink focus:border-ink focus-visible:ring-4 focus-visible:ring-focus/20',
          className,
        )}
      >
        {children}
      </select>
      <Icon
        className="app-select-icon pointer-events-none absolute right-3 top-1/2 text-ink-muted transition-transform duration-200 ease-out"
        name="chevron-down"
        size={18}
      />
    </span>
  )
}
