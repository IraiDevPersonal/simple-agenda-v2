import type { InputHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

type AppInputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean
}

export function AppInput({ className, invalid = false, ...props }: AppInputProps) {
  return (
    <input
      {...props}
      aria-invalid={invalid || props['aria-invalid']}
      className={cn(
        'min-h-11 w-full rounded-control border-2 border-line-strong bg-surface px-3 py-2.5 text-base font-bold text-ink outline-none transition-[background-color,border-color,box-shadow] duration-200 ease-out placeholder:font-medium placeholder:text-ink-muted/70 hover:border-ink focus:border-ink focus-visible:ring-4 focus-visible:ring-focus/20',
        invalid && 'border-danger-ink bg-danger-soft/30 focus:border-danger-ink',
        className,
      )}
    />
  )
}
