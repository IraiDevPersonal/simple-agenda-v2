import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { AppInput } from '@/components/ui/app-input'
import { Icon } from '@/components/ui/icon'
import { IconButton } from '@/components/ui/icon-button'
import {
  formatDateInputValue,
  formatDayNumber,
  formatLongDate,
  formatMonthLabel,
  getMonthDates,
  shiftMonth,
} from '@/lib/date-utils'
import type { DateKey } from '@/types/agenda'
const WEEKDAY_LABELS = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom']
const POPOVER_GUTTER = 12
const POPOVER_OFFSET = 8

type DatePickerProps = {
  id: string
  selectedDate: DateKey
  minDate?: DateKey
  isDateDisabled?: (date: DateKey) => boolean
  onSelect: (date: DateKey) => void
}

type PopoverPosition = {
  left: number
  top: number
}

function firstOfMonth(dateKey: DateKey): DateKey {
  return `${dateKey.slice(0, 7)}-01`
}

export function DatePicker({
  id,
  isDateDisabled,
  minDate,
  onSelect,
  selectedDate,
}: DatePickerProps) {
  const triggerRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState<DateKey>(() =>
    firstOfMonth(selectedDate),
  )
  const [position, setPosition] = useState<PopoverPosition | null>(null)
  const monthDates = getMonthDates(visibleMonth)
  const visibleMonthKey = visibleMonth.slice(0, 7)
  const minMonthKey = minDate?.slice(0, 7)
  const isPreviousMonthDisabled = minMonthKey
    ? visibleMonthKey <= minMonthKey
    : false
  const calendarId = `${id}-calendar`

  function isDateUnavailable(date: DateKey) {
    return Boolean((minDate && date < minDate) || isDateDisabled?.(date))
  }

  function restoreTriggerFocus() {
    triggerRef.current?.querySelector<HTMLInputElement>('input')?.focus()
  }

  function closePopover(restoreFocus = false) {
    setIsOpen(false)
    setPosition(null)

    if (restoreFocus) {
      restoreTriggerFocus()
    }
  }

  function selectDate(date: DateKey) {
    if (isDateUnavailable(date)) {
      return
    }

    onSelect(date)
    setVisibleMonth(firstOfMonth(date))
    closePopover(true)
  }

  function openPopover() {
    setVisibleMonth(firstOfMonth(selectedDate))
    setIsOpen(true)
  }

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) {
        return
      }

      closePopover()
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') {
        return
      }

      event.preventDefault()
      closePopover(true)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    popoverRef.current
      ?.querySelector<HTMLButtonElement>('[aria-current="date"]:not([disabled])')
      ?.focus()
  }, [isOpen])

  useLayoutEffect(() => {
    if (!isOpen) {
      return undefined
    }

    function updatePosition() {
      const trigger =
        triggerRef.current?.querySelector<HTMLInputElement>('input') ?? triggerRef.current
      const popover = popoverRef.current

      if (!trigger || !popover) {
        return
      }

      const triggerRect = trigger.getBoundingClientRect()
      const popoverRect = popover.getBoundingClientRect()
      const topSpace = triggerRect.top - popoverRect.height - POPOVER_OFFSET
      const bottomSpace = triggerRect.bottom + popoverRect.height + POPOVER_OFFSET
      const opensAbove = topSpace >= POPOVER_GUTTER && bottomSpace > window.innerHeight - POPOVER_GUTTER
      const top = opensAbove
        ? topSpace
        : triggerRect.bottom + POPOVER_OFFSET
      const left = Math.min(
        Math.max(triggerRect.right - popoverRect.width, POPOVER_GUTTER),
        window.innerWidth - popoverRect.width - POPOVER_GUTTER,
      )

      setPosition({
        left,
        top,
      })
    }

    updatePosition()
    const frame =
      typeof window.requestAnimationFrame === 'function'
        ? window.requestAnimationFrame(updatePosition)
        : null
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      if (frame !== null) {
        window.cancelAnimationFrame(frame)
      }
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isOpen, visibleMonth])

  const popover = isOpen ? (
    <div
      aria-label="Selector de fecha"
      className={`fixed z-50 w-[min(18rem,calc(100vw-1.5rem))] rounded-control border-2 border-line bg-surface p-2.5 shadow-float transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none ${position ? 'scale-100 opacity-100' : 'scale-[0.98] opacity-0'}`}
      data-slot="date-picker-popover"
      id={calendarId}
      ref={popoverRef}
      role="dialog"
      style={{
        left: position ? `${position.left}px` : '-9999px',
        top: position ? `${position.top}px` : '-9999px',
        visibility: position ? 'visible' : 'hidden',
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <IconButton
          disabled={isPreviousMonthDisabled}
          label="Mes anterior"
          onClick={() => setVisibleMonth(shiftMonth(visibleMonth, -1))}
          size="sm"
          type="button"
        >
          <Icon name="arrow-left" size={15} />
        </IconButton>
        <p className="font-display text-sm font-bold tracking-[-0.04em] text-ink">
          {formatMonthLabel(visibleMonth)}
        </p>
        <IconButton
          label="Mes siguiente"
          onClick={() => setVisibleMonth(shiftMonth(visibleMonth, 1))}
          size="sm"
          type="button"
        >
          <Icon name="arrow-right" size={15} />
        </IconButton>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-0.5">
        {WEEKDAY_LABELS.map((weekday) => (
          <span
            className="py-1 text-center text-[0.56rem] font-bold uppercase tracking-[0.08em] text-ink-muted"
            key={weekday}
          >
            {weekday}
          </span>
        ))}
        {monthDates.map((date) => {
          const isOutsideMonth = date.slice(0, 7) !== visibleMonthKey
          const isDisabled = isDateUnavailable(date)
          const isSelected = date === selectedDate

          return (
            <button
              aria-current={isSelected ? 'date' : undefined}
              aria-label={formatLongDate(date)}
              className={`grid size-8 place-items-center rounded-lg border text-xs font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus/20 ${isDisabled ? 'cursor-not-allowed border-transparent bg-surface-subtle text-ink-muted/45 opacity-70' : isSelected ? 'rounded-sm border-transparent bg-accent text-accent-ink font-extrabold shadow-action-accent' : isOutsideMonth ? 'border-transparent text-ink-muted/70 hover:border-line-strong' : 'border-transparent text-ink hover:border-line-strong'}`}
              disabled={isDisabled}
              key={date}
              onClick={() => selectDate(date)}
              type="button"
            >
              {formatDayNumber(date)}
            </button>
          )
        })}
      </div>
    </div>
  ) : null

  return (
    <div className="relative" ref={triggerRef}>
      <AppInput
        aria-controls={isOpen ? calendarId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        id={id}
        onClick={() => {
          if (isOpen) {
            closePopover(true)
          } else {
            openPopover()
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            openPopover()
          }
        }}
        readOnly
        type="text"
        value={formatDateInputValue(selectedDate)}
      />
      <span className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-ink-muted">
        <Icon name="calendar" size={17} />
      </span>

      {typeof document !== 'undefined' && popover
        ? createPortal(popover, document.body)
        : null}
    </div>
  )
}
