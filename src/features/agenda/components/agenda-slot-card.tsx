import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/cn";
import { getServiceModeLabel } from "@/lib/service-mode-utils";
import type { AgendaSlot, SlotStatus } from "@/types/agenda";

type AgendaSlotCardProps = {
  slot: AgendaSlot;
  onBlock?: (slot: AgendaSlot) => void;
  onCancel?: (appointmentId: string) => void;
  onConfirm?: (appointmentId: string) => void;
  onReschedule?: (slot: AgendaSlot) => void;
  onReserve?: (slot: AgendaSlot) => void;
  onUnblock?: (slot: AgendaSlot) => void;
};

const statusCopy: Record<SlotStatus, string> = {
  available: "Disponible",
  pending: "Pendiente",
  confirmed: "Confirmada",
  blocked: "Bloqueado",
};

const statusAccent: Record<SlotStatus, string> = {
  available: "bg-success-ink",
  pending: "bg-warning-ink",
  confirmed: "bg-accent",
  blocked: "bg-danger-ink",
};

function getClientName(slot: AgendaSlot) {
  const patientName = slot.appointment?.patient
    ? `${slot.appointment.patient.firstName} ${slot.appointment.patient.lastName}`.trim()
    : "";

  if (slot.status === "pending" || slot.status === "confirmed") {
    return patientName || slot.appointment?.clientName || "Reserva sin nombre";
  }

  return null;
}

function getClientInitials(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "?";
}

function getAppointmentMeta(slot: AgendaSlot) {
  if (slot.status === "pending") {
    if (slot.appointment?.proofFileName) {
      return "Comprobante adjunto";
    }

    const deadline = slot.appointment?.proofDeadlineHours;

    return deadline
      ? `Comprobante pendiente · ${deadline === 1 ? "1 hora" : `${deadline} horas`}`
      : "Comprobante pendiente";
  }

  return null;
}

export function AgendaSlotCard({
  onBlock,
  onCancel,
  onConfirm,
  onReschedule,
  onReserve,
  onUnblock,
  slot,
}: AgendaSlotCardProps) {
  const appointment = slot.appointment;
  const isAvailable = slot.status === "available";
  const isPending = slot.status === "pending";
  const isConfirmed = slot.status === "confirmed";
  const isBlocked = slot.status === "blocked";
  const appointmentId = appointment?.id;
  const isManualBlock = Boolean(
    isBlocked && appointmentId?.startsWith('blocked-slot-'),
  );
  const hasProof = Boolean(appointment?.proofFileName);
  const canReviewProof = Boolean(
    appointment?.proofFileName && appointment?.proofFileUrl,
  );
  const clientName = getClientName(slot);
  const appointmentMeta = getAppointmentMeta(slot);
  const hasFooter = Boolean(
    isAvailable ||
    clientName ||
    isBlocked ||
    (isPending && appointmentId) ||
    (isConfirmed && appointmentId),
  );
  const cardClassName = cn(
    "relative flex h-full min-h-0 flex-col overflow-hidden rounded-card border-2 border-line bg-surface p-4 shadow-action transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:border-line-strong hover:shadow-action-lift",
    isPending && "border-warning-ink/40",
    isConfirmed && "border-ink",
    isBlocked && "bg-surface-subtle",
  );

  function handleCancel() {
    if (appointmentId) {
      onCancel?.(appointmentId);
    }
  }

  function handleConfirm() {
    if (appointmentId) {
      onConfirm?.(appointmentId);
    }
  }

  const cardContent = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-0 top-0 h-1.5",
          statusAccent[slot.status],
        )}
      />

      <div
        className="flex items-start justify-between gap-3 pt-1"
        data-card-section="header"
      >
        <div className="min-w-0">
          <p className="font-display text-xl font-bold leading-none tracking-[-0.06em] tabular-nums text-ink">
            {slot.startTime}
          </p>
        </div>
        <div className="ml-auto flex shrink-0 items-center justify-end gap-2">
          <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-bold text-ink">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-accent"
            />
            {getServiceModeLabel(slot.serviceMode)}
          </span>
          <StatusPill status={slot.status}>
            {statusCopy[slot.status]}
          </StatusPill>
        </div>
      </div>

      <div
        className="mt-4 flex flex-1 flex-wrap items-center gap-x-2 gap-y-1 pb-4 text-xs text-ink-muted"
        data-card-section="body"
      >
        <span className="inline-flex items-center gap-1.5 font-bold">
          <Icon name="clock" size={13} />
          45 min
        </span>
        <span
          aria-hidden="true"
          className="size-1 rounded-full bg-line-strong"
        />
        <span>
          Termina a las{" "}
          <strong className="font-bold text-ink">{slot.endTime}</strong>
        </span>
      </div>

      {hasFooter ? (
        <div
          className={cn(
            "mt-auto flex min-h-14 min-w-0 items-center gap-3 border-t border-line pt-3",
          )}
          data-card-section="footer"
        >
          {isAvailable ? (
            <div className="ml-auto flex shrink-0 items-center justify-end gap-2">
              <IconButton
                className="border-line-strong text-ink hover:border-ink hover:bg-danger-soft hover:text-danger-ink hover:shadow-none"
                label={`Bloquear bloque de ${slot.startTime}`}
                onClick={() => onBlock?.(slot)}
                size="sm"
                title="Bloquear bloque"
                type="button"
              >
                <Icon name="lock" size={15} />
              </IconButton>
              <IconButton
                className="border-line-strong text-ink hover:border-ink hover:bg-accent hover:text-accent-ink hover:shadow-none"
                label={`Agendar paciente para el bloque de ${slot.startTime}`}
                onClick={() => onReserve?.(slot)}
                size="sm"
                title="Agendar paciente"
                type="button"
              >
                <Icon name="plus" size={15} />
              </IconButton>
            </div>
          ) : isBlocked ? (
            <>
              <span className="min-w-0 flex-1 truncate text-left text-xs font-bold text-ink-muted">
                No disponible
              </span>
              {isManualBlock ? (
                <IconButton
                  className="border-line-strong text-ink hover:border-ink hover:bg-accent hover:text-accent-ink hover:shadow-none"
                  label={`Desbloquear bloque de ${slot.startTime}`}
                  onClick={() => onUnblock?.(slot)}
                  size="sm"
                  title="Desbloquear bloque"
                  type="button"
                >
                  <Icon name="unlock" size={15} />
                </IconButton>
              ) : null}
            </>
          ) : (
            <>
              {clientName ? (
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-center text-xs font-bold leading-none tracking-[-0.04em] text-accent-ink"
                  >
                    {getClientInitials(clientName)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold leading-tight text-ink">
                      {clientName}
                    </p>
                    {appointmentMeta ? (
                      <p className="mt-0.5 truncate text-xs leading-4 text-ink-muted">
                        {appointmentMeta}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="ml-auto flex shrink-0 items-center justify-end gap-2">
                {isPending && appointmentId ? (
                  <>
                    {canReviewProof ? (
                      <a
                        aria-label={`Descargar comprobante de ${clientName ?? "esta reserva"}`}
                        className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface text-ink-muted transition hover:-translate-y-0.5 hover:border-ink hover:text-ink hover:shadow-icon-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus/20"
                        download={appointment.proofFileName}
                        href={appointment.proofFileUrl}
                        rel="noreferrer"
                        target="_blank"
                        title="Descargar comprobante"
                      >
                        <Icon name="download" size={15} />
                      </a>
                    ) : null}
                    <IconButton
                      className="border-line-strong text-danger-ink hover:border-danger-ink hover:bg-danger-soft hover:shadow-none"
                      label={`Cancelar reserva de ${clientName ?? "este cliente"}`}
                      onClick={handleCancel}
                      size="sm"
                      title="Cancelar reserva"
                      type="button"
                    >
                      <Icon name="x" size={15} />
                    </IconButton>
                    <IconButton
                      className="border-ink bg-accent text-accent-ink shadow-action-accent hover:shadow-action-accent-hover"
                      disabled={!hasProof}
                      label={`Confirmar comprobante de ${clientName ?? "esta reserva"}`}
                      onClick={handleConfirm}
                      size="sm"
                      title={
                        hasProof
                          ? "Confirmar comprobante"
                          : "Adjunta un comprobante para confirmar"
                      }
                      type="button"
                    >
                      <Icon name="check" size={15} />
                    </IconButton>
                  </>
                ) : isConfirmed && appointmentId ? (
                  <IconButton
                    className="border-line-strong text-ink hover:border-ink hover:bg-accent hover:text-accent-ink hover:shadow-none"
                    label={`Reagendar cita de ${clientName ?? "este cliente"}`}
                    onClick={() => onReschedule?.(slot)}
                    size="sm"
                    title="Reagendar cita"
                    type="button"
                  >
                    <Icon name="calendar" size={15} />
                  </IconButton>
                ) : null}
              </div>
            </>
          )}
        </div>
      ) : null}
    </>
  );

  return (
    <li className="h-full min-w-0">
      <article
        className={cardClassName}
        data-slot="agenda-slot-card"
        data-state={slot.status}
      >
        {cardContent}
      </article>
    </li>
  );
}
