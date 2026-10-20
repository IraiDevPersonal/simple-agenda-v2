import { useState, type ReactNode } from 'react'

import { AppButton } from '@/components/ui/app-button'
import { Icon } from '@/components/ui/icon'
import { IconButton } from '@/components/ui/icon-button'
import { cn } from '@/lib/cn'

type BannerTone = 'light' | 'ink'

type BannerWrapperProps = {
  ariaLabel: string
  children: ReactNode
  className?: string
  dismissLabel: string
  storageKey: string
  restoreLabel?: string
  tone?: BannerTone
}

const BANNER_STORAGE_PREFIX = 'simple-agenda:banner:v1:'
const HIDDEN_VALUE = 'hidden'

function getStorageKey(storageKey: string) {
  return `${BANNER_STORAGE_PREFIX}${storageKey}`
}

function getInitialVisibility(storageKey: string) {
  if (typeof window === 'undefined') {
    return true
  }

  try {
    return window.localStorage.getItem(getStorageKey(storageKey)) !== HIDDEN_VALUE
  } catch {
    return true
  }
}

function persistVisibility(storageKey: string, isVisible: boolean) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const key = getStorageKey(storageKey)

    if (isVisible) {
      window.localStorage.removeItem(key)
      return
    }

    window.localStorage.setItem(key, HIDDEN_VALUE)
  } catch {
    // La UI mantiene su estado en memoria si el navegador bloquea el storage.
  }
}

const toneStyles: Record<BannerTone, { banner: string; dismiss: string }> = {
  light: {
    banner: 'border-ink bg-surface text-ink shadow-card',
    dismiss: '',
  },
  ink: {
    banner: 'border-ink bg-ink text-surface shadow-hero-accent',
    dismiss:
      'border-surface/30 bg-surface/10 text-surface hover:border-surface hover:bg-surface/20 hover:shadow-none',
  },
}

export function BannerWrapper({
  ariaLabel,
  children,
  className,
  dismissLabel,
  storageKey,
  restoreLabel = 'Mostrar introducción',
  tone = 'light',
}: BannerWrapperProps) {
  const [isVisible, setIsVisible] = useState(() => getInitialVisibility(storageKey))
  const styles = toneStyles[tone]

  function handleVisibilityChange(nextIsVisible: boolean) {
    setIsVisible(nextIsVisible)
    persistVisibility(storageKey, nextIsVisible)
  }

  if (!isVisible) {
    return (
      <div
        aria-live="polite"
        className="flex justify-end"
        data-slot="banner-wrapper"
        data-state="closed"
      >
        <AppButton
          onClick={() => handleVisibilityChange(true)}
          type="button"
          variant="accent"
        >
          <Icon name="spark" size={17} />
          {restoreLabel}
        </AppButton>
      </div>
    )
  }

  return (
    <section
      aria-label={ariaLabel}
      className={cn(
        'relative rounded-card border-2 p-5 sm:p-7',
        styles.banner,
        className,
      )}
      data-slot="banner-wrapper"
      data-state="open"
    >
      <IconButton
        className={cn('absolute right-3 top-3 z-10', styles.dismiss)}
        label={dismissLabel}
        onClick={() => handleVisibilityChange(false)}
        type="button"
      >
        <Icon name="x" size={17} />
      </IconButton>
      <div className="pr-10 sm:pr-12">{children}</div>
    </section>
  )
}
