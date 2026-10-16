import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

type ButtonVariant = 'accent' | 'ghost' | 'outline' | 'ink'
type ButtonSize = 'icon' | 'md' | 'sm'

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function AppButton({
  className,
  size = 'md',
  variant = 'outline',
  ...props
}: AppButtonProps) {
  return (
    <button
      data-slot="app-button"
      data-size={size}
      data-variant={variant}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-control border-2 px-4 text-sm font-bold tracking-[-0.01em] transition duration-200 ease-out hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-45',
        'focus-visible:ring-4 focus-visible:ring-focus/20 focus-visible:outline-none',
        size === 'icon' && 'size-11 p-0',
        size === 'sm' && 'min-h-10 px-3 text-xs',
        variant === 'accent' &&
          'border-ink bg-accent text-accent-ink shadow-action hover:shadow-action-hover',
        variant === 'ghost' &&
          'border-transparent bg-transparent text-ink-muted shadow-none hover:bg-surface-subtle hover:text-ink',
        variant === 'outline' &&
          'border-line-strong bg-surface text-ink shadow-outline hover:border-ink hover:shadow-outline-hover',
        variant === 'ink' &&
          'border-ink bg-ink text-surface shadow-action-accent hover:shadow-action-accent-hover',
        className,
      )}
      {...props}
    />
  )
}
