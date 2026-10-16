import type { DateKey, Weekday } from '@/types/agenda'

export const TIME_ZONE = 'America/Santiago'

const WEEKDAYS: Weekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

const WEEKDAY_SHORT_NAMES: Record<Weekday, string> = {
  monday: 'lun',
  tuesday: 'mar',
  wednesday: 'mié',
  thursday: 'jue',
  friday: 'vie',
  saturday: 'sáb',
  sunday: 'dom',
}

const MONTH_SHORT_NAMES = new Intl.DateTimeFormat('es-CL', {
  month: 'short',
  timeZone: 'UTC',
})

function dateFromKey(dateKey: DateKey): Date {
  const [year, month, day] = dateKey.split('-').map(Number)

  return new Date(Date.UTC(year, month - 1, day, 12))
}

function datePartsInTimeZone(date: Date): Record<string, string> {
  return Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      day: '2-digit',
      month: '2-digit',
      timeZone: TIME_ZONE,
      year: 'numeric',
    })
      .formatToParts(date)
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, value]),
  )
}

export function isValidDateKey(value: unknown): value is DateKey {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

export function todayDateKey(): DateKey {
  const parts = datePartsInTimeZone(new Date())

  return `${parts.year}-${parts.month}-${parts.day}`
}

export function weekdayFromDateKey(dateKey: DateKey): Weekday {
  const day = dateFromKey(dateKey).getUTCDay()

  return WEEKDAYS[day === 0 ? 6 : day - 1]
}

export function getWeekDates(dateKey: DateKey): DateKey[] {
  const selectedDate = dateFromKey(dateKey)
  const day = selectedDate.getUTCDay()
  const mondayOffset = day === 0 ? -6 : 1 - day

  selectedDate.setUTCDate(selectedDate.getUTCDate() + mondayOffset)

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(selectedDate)
    date.setUTCDate(selectedDate.getUTCDate() + index)

    return toDateKey(date)
  })
}

export function shiftDate(dateKey: DateKey, days: number): DateKey {
  const date = dateFromKey(dateKey)
  date.setUTCDate(date.getUTCDate() + days)

  return toDateKey(date)
}

export function shiftMonth(dateKey: DateKey, months: number): DateKey {
  const date = dateFromKey(dateKey)
  const originalDay = date.getUTCDate()

  date.setUTCDate(1)
  date.setUTCMonth(date.getUTCMonth() + months)

  const daysInTargetMonth = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate()

  date.setUTCDate(Math.min(originalDay, daysInTargetMonth))

  return toDateKey(date)
}

export function toDateKey(date: Date): DateKey {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}

export function formatMonthLabel(dateKey: DateKey): string {
  const label = new Intl.DateTimeFormat('es-CL', {
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(dateFromKey(dateKey))

  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function formatDayNumber(dateKey: DateKey): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    timeZone: 'UTC',
  }).format(dateFromKey(dateKey))
}

export function formatDayName(dateKey: DateKey): string {
  return WEEKDAY_SHORT_NAMES[weekdayFromDateKey(dateKey)]
}

export function formatMonthShort(dateKey: DateKey): string {
  return MONTH_SHORT_NAMES.format(dateFromKey(dateKey)).replace('.', '')
}

export function formatLongDate(dateKey: DateKey): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    weekday: 'long',
  }).format(dateFromKey(dateKey))
}
