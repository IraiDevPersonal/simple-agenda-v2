import { AppButton } from '@/components/ui/app-button'
import { Icon } from '@/components/ui/icon'
import { IconButton } from '@/components/ui/icon-button'
import {
  formatDayName,
  formatDayNumber,
  formatMonthShort,
} from '@/lib/date-utils'
import type { DateKey } from '@/types/agenda'

type DateStripProps = {
  dates: DateKey[]
  selectedDate: DateKey
  onSelect: (date: DateKey) => void
  onShift: (days: number) => void
}

export function DateStrip({ dates, onSelect, onShift, selectedDate }: DateStripProps) {
  return (
    <section aria-label="Días de la semana" className="mt-5">
      <div className="flex items-center gap-2">
        <IconButton label="Semana anterior" onClick={() => onShift(-7)}>
          <Icon name="arrow-left" />
        </IconButton>

        <div className="scrollbar-none flex min-w-0 flex-1 gap-2 overflow-x-auto px-1 py-1">
          {dates.map((date) => {
            const isSelected = date === selectedDate

            return (
              <AppButton
                aria-current={isSelected ? 'date' : undefined}
                aria-label={`${formatDayName(date)} ${formatDayNumber(date)} de ${formatMonthShort(date)}`}
                className="min-w-[4.3rem] flex-1 flex-col gap-0.5 px-2 py-2 sm:min-w-[5rem]"
                key={date}
                onClick={() => onSelect(date)}
                size="sm"
                variant={isSelected ? 'ink' : 'outline'}
              >
                <span className="text-[0.64rem] uppercase tracking-[0.08em] opacity-70">
                  {formatDayName(date)}
                </span>
                <span className="font-display text-lg font-bold leading-none">
                  {formatDayNumber(date)}
                </span>
                <span className="text-[0.62rem] uppercase opacity-65">
                  {formatMonthShort(date)}
                </span>
              </AppButton>
            )
          })}
        </div>

        <IconButton label="Semana siguiente" onClick={() => onShift(7)}>
          <Icon name="arrow-right" />
        </IconButton>
      </div>
    </section>
  )
}
