import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { AppButton } from '@/components/ui/app-button'
import { AppInput } from '@/components/ui/app-input'
import { AppSelect } from '@/components/ui/app-select'
import { Icon } from '@/components/ui/icon'
import { IconButton } from '@/components/ui/icon-button'
import {
  toAppointmentPricing,
} from '@/features/agenda/lib/pricing-utils'
import { formatLongDate } from '@/lib/date-utils'
import { formatChileanRut, findPatientByRut, isValidChileanRut } from '@/lib/patient-utils'
import { formatChileanPesos } from '@/lib/payment-utils'
import { getServiceModeLabel } from '@/lib/service-mode-utils'
import { formatProofDeadline } from '@/features/agenda/lib/reservation-utils'
import {
  patientFormSchema,
  type PatientFormValues,
} from '@/features/agenda/lib/patient-form-schema'
import type {
  AgendaSlot,
  AppointmentPricing,
  Patient,
  PatientDraft,
} from '@/types/agenda'
import type { PaymentPricing } from '@/types/payments'

export type ReservationDraft = {
  patient: PatientDraft
  pricing: AppointmentPricing
  serviceName: string
}

type ReservationStep = 1 | 2 | 3
type LookupStatus = 'idle' | 'found' | 'new'

type ReservationDialogProps = {
  patients: Patient[]
  pricingOptions: PaymentPricing[]
  slot: AgendaSlot
  proofDeadlineHours: number
  onAttachProof: (appointmentId: string, fileName: string, fileUrl?: string) => void
  onClose: () => void
  onSubmit: (draft: ReservationDraft) => string | null
}

const MAX_PROOF_FILE_SIZE = 10 * 1024 * 1024

const stepLabels: Array<{ id: ReservationStep; label: string }> = [
  { id: 1, label: 'Datos paciente' },
  { id: 2, label: 'Datos cita' },
  { id: 3, label: 'Comprobante' },
]

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
    ),
  )
}

function getPatientDraft(patient: Patient): PatientDraft {
  const { id: _id, ...draft } = patient

  return draft
}

function createEmptyPatient(): PatientDraft {
  return {
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    rut: '',
  }
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p className="text-xs font-bold text-danger-ink" id={id} role="alert">
      {message}
    </p>
  ) : null
}

export function ReservationDialog({
  onAttachProof,
  onClose,
  onSubmit,
  patients,
  pricingOptions,
  proofDeadlineHours,
  slot,
}: ReservationDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const proofInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<ReservationStep>(1)
  const [hasSearchedPatient, setHasSearchedPatient] = useState(false)
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>('idle')
  const [serviceName, setServiceName] = useState('')
  const [selectedPricingId, setSelectedPricingId] = useState(
    pricingOptions.find((pricing) => pricing.serviceModes.includes(slot.serviceMode))?.id ?? '',
  )
  const [appointmentId, setAppointmentId] = useState<string | null>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [proofError, setProofError] = useState('')
  const {
    formState: { errors },
    getValues,
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<PatientFormValues>({
    defaultValues: createEmptyPatient(),
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: zodResolver(patientFormSchema),
  })
  const patient = watch()
  const rut = watch('rut')
  const requiresProof = proofDeadlineHours > 0
  const compatiblePricingOptions = pricingOptions.filter((pricing) =>
    pricing.serviceModes.includes(slot.serviceMode),
  )
  const selectedPricing =
    compatiblePricingOptions.find((pricing) => pricing.id === selectedPricingId) ??
    compatiblePricingOptions[0]
  const appointmentPricing = selectedPricing
    ? toAppointmentPricing(selectedPricing, slot.serviceMode)
    : null
  const rutField = register('rut')
  const rutIsValid = isValidChileanRut(rut)

  const lookupPatient = useCallback((rutValue = getValues('rut')) => {
    if (!isValidChileanRut(rutValue)) {
      setLookupStatus('idle')
      return
    }

    const existingPatient = findPatientByRut(patients, rutValue)

    if (existingPatient) {
      reset(getPatientDraft(existingPatient))
      setLookupStatus('found')
      setHasSearchedPatient(true)
      setError('')
      return
    }

    setLookupStatus('new')
    setHasSearchedPatient(true)
    setError('')
  }, [getValues, patients, reset])

  useEffect(() => {
    const dialog = dialogRef.current
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null

    if (!dialog) {
      return undefined
    }

    const dialogElement = dialog

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const focusables = getFocusableElements(dialogElement)

      if (focusables.length === 0) {
        event.preventDefault()
        dialogElement.focus()
        return
      }

      const firstFocusable = focusables[0]
      const lastFocusable = focusables[focusables.length - 1]

      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault()
        lastFocusable.focus()
      } else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault()
        firstFocusable.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [onClose])

  useEffect(() => {
    const autofocusTarget = dialogRef.current?.querySelector<HTMLElement>('[data-autofocus]')
    autofocusTarget?.focus()
  }, [step])

  useEffect(() => {
    if (!isValidChileanRut(rut)) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => lookupPatient(rut), 450)

    return () => window.clearTimeout(timeoutId)
  }, [lookupPatient, rut])

  function handleRutChange(event: ChangeEvent<HTMLInputElement>) {
    const formattedRut = formatChileanRut(event.currentTarget.value)

    setValue('rut', formattedRut, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
    setHasSearchedPatient(false)
    setLookupStatus('idle')
    setError('')

    if (hasSearchedPatient) {
      setValue('firstName', '')
      setValue('lastName', '')
      setValue('email', '')
      setValue('phone', '')
    }
  }

  function handlePatientSubmit(values: PatientFormValues) {
    if (!hasSearchedPatient) {
      setError('Busca el RUT antes de continuar.')
      return
    }

    setError('')
    reset(values)
    setStep(2)
  }

  function handleReviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (appointmentId) {
      setError('')
      setStep(3)
      return
    }

    if (!appointmentPricing) {
      setError('Configura una tarifa para la modalidad de este bloque antes de continuar.')
      return
    }

    const createdAppointmentId = onSubmit({
      patient: getValues(),
      pricing: appointmentPricing,
      serviceName: serviceName.trim() || 'Consulta general',
    })

    if (!createdAppointmentId) {
      setError('Este bloque acaba de ser ocupado. Cierra esta ventana y revisa la agenda.')
      return
    }

    setAppointmentId(createdAppointmentId)
    setError('')
    setStep(3)
  }

  function handleProofChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]

    if (!file || !appointmentId) {
      return
    }

    const hasAllowedType =
      file.type === 'application/pdf' ||
      file.type.startsWith('image/') ||
      /\.(pdf|png|jpe?g|webp)$/i.test(file.name)

    if (!hasAllowedType) {
      setProofError('El comprobante debe ser un PDF o una imagen.')
      event.currentTarget.value = ''
      return
    }

    if (file.size > MAX_PROOF_FILE_SIZE) {
      setProofError('El comprobante no puede superar los 10 MB.')
      event.currentTarget.value = ''
      return
    }

    setProofError('')
    setProofFile(file)
    const fileUrl =
      typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : undefined

    if (fileUrl) {
      onAttachProof(appointmentId, file.name, fileUrl)
    } else {
      onAttachProof(appointmentId, file.name)
    }
  }

  const title =
    step === 1
      ? 'Datos del paciente'
      : step === 2
        ? 'Revisa la cita'
        : requiresProof
          ? 'Adjunta el comprobante'
          : 'Reserva creada'
  const currentStep = stepLabels.find((item) => item.id === step) ?? stepLabels[0]

  return (
    <div
      className="fixed inset-0 z-40 grid items-end bg-ink/30 p-3 backdrop-blur-[2px] sm:place-items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        aria-describedby="reservation-dialog-description"
        aria-labelledby="reservation-dialog-title"
        aria-modal="true"
        className="max-h-[min(46rem,calc(100svh-1.5rem))] w-full max-w-none overflow-y-auto rounded-card border-2 border-line bg-surface p-5 shadow-float sm:max-w-lg sm:p-6"
        data-slot="reservation-dialog"
        data-state={`step-${step}`}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">
              Nueva reserva · {title}
            </p>
            <h2
              className="mt-1 font-display text-2xl font-bold tracking-[-0.06em] text-ink"
              id="reservation-dialog-title"
            >
              {slot.startTime} · {formatLongDate(slot.date)}
            </h2>
          </div>
          <IconButton label="Cerrar nueva reserva" onClick={onClose} type="button">
            <Icon name="x" size={17} />
          </IconButton>
        </header>

        <nav aria-label="Pasos de la reserva" className="mt-5 grid gap-2">
          <div
            aria-label="Progreso de la reserva"
            aria-valuemax={3}
            aria-valuemin={1}
            aria-valuenow={step}
            className="flex items-center gap-3"
            role="progressbar"
          >
            <div className="min-w-0 shrink-0">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-ink-muted">
                Pasos <span className="font-display text-lg leading-none text-ink">{step}</span>
              </p>
              <p className="mt-1 max-w-28 truncate text-xs font-bold uppercase tracking-[0.07em] text-ink">
                {currentStep.label}
              </p>
            </div>
            <div className="flex min-w-0 flex-1 gap-1.5" aria-hidden="true">
              {stepLabels.map((item) => (
                <span
                  className={`h-1.5 min-w-0 flex-1 rounded-full transition-colors duration-300 ${item.id <= step ? 'bg-accent' : 'bg-line'}`}
                  key={item.id}
                />
              ))}
            </div>
            <span className="shrink-0 text-xs font-bold text-ink-muted">de 3</span>
          </div>
          <ol className="sr-only">
            {stepLabels.map((item) => (
              <li aria-current={item.id === step ? 'step' : undefined} key={item.id}>
                Paso {item.id}: {item.label}
              </li>
            ))}
          </ol>
        </nav>

        <p
          className="mt-5 text-sm leading-relaxed text-ink-muted"
          id="reservation-dialog-description"
        >
          {step === 1
            ? 'Identifica al paciente para usar sus datos en esta cita.'
            : step === 2
              ? 'Revisa el valor, la modalidad y las condiciones antes de reservar.'
              : requiresProof
                ? `La reserva quedó pendiente. El comprobante debe enviarse dentro de ${formatProofDeadline(proofDeadlineHours)}.`
                : 'La cita quedó confirmada porque no requiere comprobante.'}
        </p>

        {step === 1 ? (
          <form
            className="mt-5 grid gap-4"
            noValidate
            onSubmit={handleSubmit(handlePatientSubmit)}
          >
            <div className="grid gap-1.5">
              <label
                className="text-xs font-bold uppercase tracking-[0.09em] text-ink-muted"
                htmlFor="reservation-patient-rut"
              >
                RUT
              </label>
              <div className="relative">
                <AppInput
                  {...rutField}
                  autoComplete="off"
                  aria-describedby={errors.rut ? 'reservation-patient-rut-error' : undefined}
                  data-autofocus="true"
                  id="reservation-patient-rut"
                  inputMode="text"
                  invalid={Boolean(errors.rut)}
                  onBlur={rutField.onBlur}
                  onChange={handleRutChange}
                  placeholder="12.345.678-5"
                  required
                  className="pr-12"
                />
                <button
                  aria-label="Buscar paciente por RUT"
                  className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-ink-muted transition-colors hover:bg-surface-subtle hover:text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus/20 disabled:pointer-events-none disabled:opacity-40"
                  disabled={!rutIsValid}
                  onClick={() => lookupPatient()}
                  type="button"
                >
                  <Icon name="search" size={17} />
                </button>
              </div>
              <FieldError id="reservation-patient-rut-error" message={errors.rut?.message} />
              {lookupStatus === 'found' ? (
                <p className="text-xs font-bold text-success-ink" role="status">
                  Paciente encontrado. Revisa sus datos antes de continuar.
                </p>
              ) : lookupStatus === 'new' ? (
                <p className="text-xs text-ink-muted" role="status">
                  No encontramos este RUT. Completa los datos para registrarlo.
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label
                  className="text-xs font-bold uppercase tracking-[0.09em] text-ink-muted"
                  htmlFor="reservation-patient-first-name"
                >
                  Nombres
                </label>
                <AppInput
                  {...register('firstName')}
                  aria-describedby={errors.firstName ? 'reservation-patient-first-name-error' : undefined}
                  autoComplete="given-name"
                  disabled={!hasSearchedPatient}
                  id="reservation-patient-first-name"
                  invalid={Boolean(errors.firstName)}
                  placeholder="Ej. Camila"
                  required
                />
                <FieldError
                  id="reservation-patient-first-name-error"
                  message={errors.firstName?.message}
                />
              </div>
              <div className="grid gap-1.5">
                <label
                  className="text-xs font-bold uppercase tracking-[0.09em] text-ink-muted"
                  htmlFor="reservation-patient-last-name"
                >
                  Apellidos
                </label>
                <AppInput
                  {...register('lastName')}
                  aria-describedby={errors.lastName ? 'reservation-patient-last-name-error' : undefined}
                  autoComplete="family-name"
                  disabled={!hasSearchedPatient}
                  id="reservation-patient-last-name"
                  invalid={Boolean(errors.lastName)}
                  placeholder="Ej. Rojas"
                  required
                />
                <FieldError
                  id="reservation-patient-last-name-error"
                  message={errors.lastName?.message}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label
                  className="text-xs font-bold uppercase tracking-[0.09em] text-ink-muted"
                  htmlFor="reservation-patient-email"
                >
                  Correo electrónico
                </label>
                <AppInput
                  {...register('email')}
                  aria-describedby={errors.email ? 'reservation-patient-email-error' : undefined}
                  autoComplete="email"
                  disabled={!hasSearchedPatient}
                  id="reservation-patient-email"
                  invalid={Boolean(errors.email)}
                  placeholder="cliente@ejemplo.cl"
                  required
                  type="email"
                />
                <FieldError id="reservation-patient-email-error" message={errors.email?.message} />
              </div>
              <div className="grid gap-1.5">
                <label
                  className="text-xs font-bold uppercase tracking-[0.09em] text-ink-muted"
                  htmlFor="reservation-patient-phone"
                >
                  Teléfono
                </label>
                <AppInput
                  {...register('phone')}
                  aria-describedby={errors.phone ? 'reservation-patient-phone-error' : undefined}
                  autoComplete="tel"
                  disabled={!hasSearchedPatient}
                  id="reservation-patient-phone"
                  inputMode="tel"
                  invalid={Boolean(errors.phone)}
                  placeholder="+56 9 1234 5678"
                  required
                  type="tel"
                />
                <FieldError id="reservation-patient-phone-error" message={errors.phone?.message} />
              </div>
            </div>

            {error ? (
              <p className="text-sm font-bold text-danger-ink" role="alert">
                {error}
              </p>
            ) : null}

            <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
              <AppButton onClick={onClose} type="button" variant="outline">
                Cancelar
              </AppButton>
              <AppButton disabled={!hasSearchedPatient} type="submit" variant="accent">
                Continuar
                <Icon name="arrow-right" size={16} />
              </AppButton>
            </div>
          </form>
        ) : null}

        {step === 2 ? (
          <form className="mt-5 grid gap-4" onSubmit={handleReviewSubmit}>
            <div className="grid gap-3 rounded-control border border-line bg-surface-subtle p-4">
              <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-sm">
                <span className="text-ink-muted">Paciente</span>
                <span className="font-bold text-ink">
                  {patient.firstName} {patient.lastName}
                </span>
                <span className="text-ink-muted">Horario</span>
                <span className="font-bold text-ink">{slot.startTime} · 45 min</span>
                <span className="text-ink-muted">Modalidad</span>
                <span className="font-bold text-ink">{getServiceModeLabel(slot.serviceMode)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
                <span className="text-sm text-ink-muted">Valor de la cita</span>
                <span className="font-display text-xl font-bold tracking-[-0.04em] text-ink">
                  {appointmentPricing ? formatChileanPesos(appointmentPricing.amount) : 'Sin tarifa'}
                </span>
              </div>
            </div>

            {compatiblePricingOptions.length > 1 ? (
              <label className="grid gap-1.5 text-xs font-bold uppercase tracking-[0.09em] text-ink-muted">
                Tarifa
                <AppSelect
                  data-autofocus={!appointmentId ? 'true' : undefined}
                  disabled={Boolean(appointmentId)}
                  onChange={(event) => {
                    setSelectedPricingId(event.currentTarget.value)
                    setError('')
                  }}
                  value={selectedPricing?.id ?? ''}
                >
                  {compatiblePricingOptions.map((pricing) => (
                    <option key={pricing.id} value={pricing.id}>
                      {pricing.name}
                    </option>
                  ))}
                </AppSelect>
              </label>
            ) : null}

            <label className="grid gap-1.5 text-xs font-bold uppercase tracking-[0.09em] text-ink-muted">
              Motivo o servicio
              <AppInput
                data-autofocus={
                  !appointmentId && compatiblePricingOptions.length <= 1 ? 'true' : undefined
                }
                disabled={Boolean(appointmentId)}
                onChange={(event) => setServiceName(event.currentTarget.value)}
                placeholder="Ej. Consulta inicial"
                value={serviceName}
              />
            </label>

            <div className="flex items-start gap-3 rounded-control border border-line bg-surface-subtle p-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-accent-ink">
                <Icon name={requiresProof ? 'clock' : 'check'} size={18} />
              </span>
              <div className="min-w-0">
                <p className="font-bold text-ink">
                  {requiresProof ? 'Pendiente de comprobante' : 'Confirmación inmediata'}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">
                  {requiresProof
                    ? `El cliente tendrá ${formatProofDeadline(proofDeadlineHours)} para enviarlo.`
                    : 'La cita quedará confirmada al reservarla.'}
                </p>
              </div>
            </div>

            {error ? (
              <p className="text-sm font-bold text-danger-ink" role="alert">
                {error}
              </p>
            ) : null}

            <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
              {!appointmentId ? (
                <AppButton onClick={() => setStep(1)} type="button" variant="outline">
                  <Icon name="arrow-left" size={16} />
                  Volver
                </AppButton>
              ) : null}
              <AppButton
                data-autofocus={appointmentId ? 'true' : undefined}
                type="submit"
                variant="accent"
              >
                <Icon name="arrow-right" size={16} />
                {appointmentId ? 'Volver al comprobante' : 'Reservar cita'}
              </AppButton>
            </div>
          </form>
        ) : null}

        {step === 3 ? (
          <section className="mt-5 grid gap-4" aria-label="Carga del comprobante">
            <div className="flex items-start gap-3 rounded-control border border-line bg-surface-subtle p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-accent-ink">
                <Icon name={requiresProof ? 'clock' : 'check'} size={18} />
              </span>
              <div className="min-w-0">
                <p className="font-bold text-ink">
                  {requiresProof ? 'Esperando comprobante' : 'Reserva confirmada'}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">
                  {requiresProof
                    ? 'Adjúntalo ahora o cierra esta ventana para hacerlo más tarde desde la tarjeta de la cita.'
                    : 'El bloque ya está listo y no necesitas enviar un comprobante.'}
                </p>
              </div>
            </div>

            {requiresProof ? (
              <div className="grid gap-3 rounded-control border-2 border-dashed border-line-strong bg-canvas/60 p-4 text-center">
                <Icon className="mx-auto text-ink-muted" name="wallet" size={24} />
                <div>
                  <p className="font-bold text-ink">Comprobante de transferencia</p>
                  <p className="mt-1 text-sm text-ink-muted">PDF, JPG, PNG o WEBP · máximo 10 MB</p>
                </div>
                <AppButton
                  data-autofocus="true"
                  onClick={() => proofInputRef.current?.click()}
                  type="button"
                  variant="outline"
                >
                  <Icon name="plus" size={16} />
                  {proofFile ? 'Cambiar archivo' : 'Adjuntar comprobante'}
                </AppButton>
                <input
                  accept="application/pdf,image/*"
                  aria-label="Archivo de comprobante"
                  className="sr-only"
                  onChange={handleProofChange}
                  ref={proofInputRef}
                  tabIndex={-1}
                  type="file"
                />
                {proofFile ? (
                  <p className="truncate text-sm font-bold text-success-ink" role="status">
                    ✓ {proofFile.name}
                  </p>
                ) : null}
                {proofError ? (
                  <p className="text-sm font-bold text-danger-ink" role="alert">
                    {proofError}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
              <AppButton onClick={() => setStep(2)} type="button" variant="outline">
                <Icon name="arrow-left" size={16} />
                Volver
              </AppButton>
              <AppButton
                data-autofocus={requiresProof ? undefined : 'true'}
                onClick={onClose}
                type="button"
                variant="accent"
              >
                Listo
              </AppButton>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
