import { Link } from '@tanstack/react-router'

import { Icon } from '@/components/ui/icon'

const navigationItems = [
  { label: 'Perfil', to: '/perfil' as const, icon: 'user' as const },
  { label: 'Horarios', to: '/horarios' as const, icon: 'gear' as const },
  { label: 'Agenda', to: '/agenda' as const, icon: 'calendar' as const },
]

export function AppNavigation() {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-3 bottom-3 z-30 mx-auto grid max-w-md grid-cols-3 gap-1.5 rounded-card border border-line bg-surface/95 p-1.5 shadow-navigation-float backdrop-blur-md"
    >
      {navigationItems.map((item) => (
        <Link
          activeProps={{
            className: 'bg-ink text-surface shadow-action-accent',
          }}
          className="inline-flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-[0.9rem] px-2 py-1 text-[0.68rem] font-bold text-ink-muted transition hover:bg-surface-subtle hover:text-ink sm:text-xs"
          key={item.to}
          preload="intent"
          to={item.to}
        >
          <Icon name={item.icon} size={16} />
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
