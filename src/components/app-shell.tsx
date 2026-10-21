import type { ReactNode } from 'react'

import { Link } from '@tanstack/react-router'

import { AppNavigation } from '@/components/app-navigation'
import { Icon } from '@/components/ui/icon'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-svh bg-canvas text-ink">
      <a
        className="sr-only z-50 rounded-control bg-ink px-4 py-3 text-surface focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        href="#main-content"
      >
        Saltar al contenido
      </a>

      <header className="sticky top-0 z-30 border-b-2 border-line bg-canvas/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link className="group inline-flex items-center gap-3" to="/agenda">
            <span className="grid size-10 rotate-[-4deg] place-items-center rounded-control border-2 border-ink bg-accent text-accent-ink shadow-action transition group-hover:rotate-2">
              <Icon name="calendar" size={20} />
            </span>
            <span className="leading-none">
              <span className="block font-display text-lg font-bold tracking-[-0.04em]">
                agenda
              </span>
              <span className="block text-[0.65rem] font-bold uppercase tracking-[0.18em] text-ink-muted">
                tu tiempo, en orden
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-2 text-right sm:block">
            <p className="text-xs font-bold text-ink">Demo local</p>
            <p className="text-[0.68rem] text-ink-muted">sin datos conectados</p>
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-6xl px-4 pb-32 pt-6 sm:px-6 lg:px-8">
        {children}
      </main>

      <AppNavigation />
    </div>
  )
}
