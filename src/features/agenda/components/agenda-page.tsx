import { useTransition } from "react";

import { Link, useNavigate, useSearch } from "@tanstack/react-router";

import { AppButton } from "@/components/ui/app-button";
import { BannerWrapper } from "@/components/ui/banner-wrapper";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { StatusPill } from "@/components/ui/status-pill";
import { DEMO_DATE } from "@/data/demo-data";
import { AgendaSlotCard } from "@/features/agenda/components/agenda-slot-card";
import { DateStrip } from "@/features/agenda/components/date-strip";
import { generateAgendaSlots } from "@/features/agenda/lib/generate-agenda-slots";
import {
  formatMonthLabel,
  formatLongDate,
  getWeekDates,
  shiftDate,
  shiftMonth,
  todayDateKey,
} from "@/lib/date-utils";
import { useAgendaStore } from "@/stores/agenda-store";
import type { DateKey } from "@/types/agenda";

export function AgendaPage() {
  const search = useSearch({ from: "/agenda" });
  const navigate = useNavigate({ from: "/agenda" });
  const [isPending, startTransition] = useTransition();
  const scheduleSegments = useAgendaStore((state) => state.scheduleSegments);
  const appointments = useAgendaStore((state) => state.appointments);
  const selectedDate = search.date ?? DEMO_DATE;
  const dates = getWeekDates(selectedDate);
  const slots = generateAgendaSlots({
    appointments,
    date: selectedDate,
    scheduleSegments,
  });
  const reservedCount = slots.filter(
    (slot) => slot.status === "reserved",
  ).length;
  const availableCount = slots.filter(
    (slot) => slot.status === "available",
  ).length;

  function selectDate(date: DateKey) {
    startTransition(() => {
      void navigate({
        search: (previous) => ({ ...previous, date }),
      });
    });
  }

  function goToToday() {
    selectDate(todayDateKey());
  }

  function shiftSelectedDate(days: number) {
    selectDate(shiftDate(selectedDate, days));
  }

  function shiftSelectedMonth(months: number) {
    selectDate(shiftMonth(selectedDate, months));
  }

  return (
    <div className="space-y-6" data-pending={isPending}>
      <BannerWrapper
        ariaLabel="Introducción de la agenda"
        dismissLabel="Ocultar introducción de la agenda"
      >
        <div>
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">
            <span className="size-2 rounded-full bg-accent" />
            Tu semana, a la vista
          </p>
          <h1 className="max-w-xl font-display text-4xl font-bold leading-[0.95] tracking-[-0.07em] text-ink sm:text-5xl">
            Una agenda que se siente{" "}
            <span className="scribble-underline">tuya</span>.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
            Revisa cada espacio, cuida tus pausas y llega a cada cita con la
            cabeza despejada.
          </p>
        </div>
      </BannerWrapper>

      <section aria-label="Navegación del calendario" className="space-y-3">
        <p className="px-1 text-xs text-right font-bold uppercase tracking-[0.16em] text-ink-muted">
          Mes visible
        </p>
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <AppButton className="shrink-0" onClick={goToToday} variant="accent">
            <Icon name="spark" size={17} />
            Hoy
          </AppButton>
          <div className="flex min-w-0 items-center gap-2 sm:gap-3 place-self-end">
            <IconButton
              label="Mes anterior"
              onClick={() => shiftSelectedMonth(-1)}
            >
              <Icon name="arrow-left" size={19} />
            </IconButton>
            <h2 className="min-w-0 max-w-56 text-center font-display text-xl font-bold leading-tight tracking-[-0.06em] text-ink sm:max-w-none sm:text-3xl">
              {formatMonthLabel(selectedDate)}
            </h2>
            <IconButton
              label="Mes siguiente"
              onClick={() => shiftSelectedMonth(1)}
            >
              <Icon name="arrow-right" size={19} />
            </IconButton>
          </div>
        </div>
        <DateStrip
          dates={dates}
          onSelect={selectDate}
          onShift={shiftSelectedDate}
          selectedDate={selectedDate}
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-sm font-bold capitalize text-ink-muted">
            {formatLongDate(selectedDate)}
          </p>
          <h2 className="mt-1 font-display text-3xl font-bold tracking-[-0.06em] text-ink">
            Tus bloques del día
          </h2>
        </div>
        <div className="flex gap-2 sm:justify-end">
          <StatusPill status="reserved">{reservedCount} reservadas</StatusPill>
          <StatusPill status="available">{availableCount} libres</StatusPill>
        </div>
      </section>

      {slots.length > 0 ? (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {slots.map((slot) => (
            <AgendaSlotCard key={slot.id} slot={slot} />
          ))}
        </ul>
      ) : (
        <section className="rounded-card border-2 border-dashed border-line-strong bg-surface p-8 text-center shadow-card sm:p-12">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-accent-soft text-accent-ink">
            <Icon name="calendar" size={25} />
          </span>
          <h2 className="mt-5 font-display text-2xl font-bold tracking-[-0.05em] text-ink">
            Este día todavía está abierto
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
            No hay bloques activos para esta fecha. Configura una jornada y la
            agenda aparecerá aquí.
          </p>
          <Link
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-control border-2 border-ink bg-ink px-5 text-sm font-bold text-surface shadow-action-accent transition hover:-translate-y-0.5 hover:shadow-action-accent-hover"
            to="/horarios"
          >
            Configurar horarios
          </Link>
        </section>
      )}
    </div>
  );
}
