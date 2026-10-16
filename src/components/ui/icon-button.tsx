import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  children: ReactNode
  active?: boolean
}

export function IconButton({
  active = false,
  children,
  className,
  label,
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      data-active={active}
      data-slot="icon-button"
      className={cn(
        'inline-flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-line-strong bg-surface text-ink transition duration-200 hover:-translate-y-0.5 hover:border-ink hover:shadow-icon-hover disabled:pointer-events-none disabled:opacity-40',
        active && 'border-ink bg-ink text-surface',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
