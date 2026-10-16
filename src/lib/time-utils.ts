export const MINUTES_PER_DAY = 24 * 60

export function timeToMinutes(time: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time)

  if (!match) {
    return null
  }

  const hours = Number(match[1])
  const minutes = Number(match[2])

  if (hours > 23 || minutes > 59) {
    return null
  }

  return hours * 60 + minutes
}

export function minutesToTime(minutes: number): string {
  const normalizedMinutes = Math.max(0, Math.min(MINUTES_PER_DAY, minutes))
  const hours = Math.floor(normalizedMinutes / 60)
  const remainder = normalizedMinutes % 60

  return `${String(hours).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

export function addMinutesToTime(time: string, minutes: number): string | null {
  const startMinutes = timeToMinutes(time)

  if (startMinutes === null) {
    return null
  }

  return minutesToTime(startMinutes + minutes)
}

export function isValidTimeRange(startTime: string, endMinutes: number): boolean {
  const startMinutes = timeToMinutes(startTime)

  return startMinutes !== null && endMinutes > startMinutes && endMinutes <= MINUTES_PER_DAY
}
