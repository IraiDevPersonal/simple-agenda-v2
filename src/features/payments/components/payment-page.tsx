import { useState, type ChangeEvent, type FormEvent } from 'react'

import { AppButton } from '@/components/ui/app-button'
import { AppInput } from '@/components/ui/app-input'
import { AppSelect } from '@/components/ui/app-select'
import { BannerWrapper } from '@/components/ui/banner-wrapper'
import { Icon } from '@/components/ui/icon'
import { IconButton } from '@/components/ui/icon-button'
import { StatusPill } from '@/components/ui/status-pill'
import { cn } from '@/lib/cn'
import { formatChileanPesos, parseChileanPesos } from '@/lib/payment-utils'
import { usePaymentStore } from '@/stores/payment-store'
import {
  BANK_ACCOUNT_TYPE_OPTIONS,
  PAYMENT_PROOF_DEADLINE_OPTIONS,
  type PaymentPricing,
  type PaymentProofDeadlineHours,
} from '@/types/payments'
import type { ServiceMode } from '@/types/agenda'

const serviceModeOptions: Array<{ value: ServiceMode; label: string }> = [
  { value: 'in-person', label: 'Presencial' },
  { value: 'remote', label: 'Remoto' },
  { value: 'home-visit', label: 'A domicilio' },
]

const transferFieldConfig = [
  {
    key: 'bank',
    label: 'Banco',
    type: 'text',
    autoComplete: 'organization',
    placeholder: 'Ej. Banco de Chile',
  },
  {
    key: 'accountNumber',
    label: 'Número de cuenta',
    type: 'text',
    autoComplete: 'off',
    placeholder: 'Ej. 123456789',
  },
  {
    key: 'rut',
    label: 'RUT del titular',
    type: 'text',
    autoComplete: 'off',
    placeholder: '12.345.678-9',
  },
  {
    key: 'email',
    label: 'Correo para comprobantes',
    type: 'email',
    autoComplete: 'email',
    placeholder: 'pagos@tudominio.cl',
  },
] as const

type PaymentPricingEditorProps = {
  index: number
  pricing: PaymentPricing
  onChange: (
    update: Partial<
      Pick<
        PaymentPricing,
        'name' | 'serviceModes' | 'amounts' | 'samePriceForAll' | 'samePriceAmount'
      >
    >,
  ) => void
  onRemove: () => void
}

type TransferTextFieldProps = {
  field: (typeof transferFieldConfig)[number]
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  value: string
}

type ToggleControlProps = {
  ariaDescribedBy?: string
  ariaLabel: string
  checked: boolean
  className?: string
  id: string
  label: string
  onChange: () => void
}

function TransferTextField({ field, onChange, value }: TransferTextFieldProps) {
  return (
    <label
      className="grid gap-1.5 text-xs font-bold uppercase tracking-[0.09em] text-ink-muted"
      htmlFor={`transfer-${field.key}`}
    >
      {field.label}
      <AppInput
        autoComplete={field.autoComplete}
        id={`transfer-${field.key}`}
        inputMode={field.key === 'accountNumber' ? 'numeric' : undefined}
        onChange={onChange}
        placeholder={field.placeholder}
        required
        type={field.type}
        value={value}
      />
    </label>
  )
}

function ToggleControl({
  ariaDescribedBy,
  ariaLabel,
  checked,
  className,
  id,
  label,
  onChange,
}: ToggleControlProps) {
  return (
    <label className={cn('flex min-w-0 cursor-pointer items-center gap-2', className)} htmlFor={id}>
      <input
        aria-describedby={ariaDescribedBy}
        aria-label={ariaLabel}
        checked={checked}
        className="peer sr-only"
        id={id}
        onChange={onChange}
        role="switch"
        type="checkbox"
      />
      <span
        aria-hidden="true"
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 bg-canvas shadow-inner transition-colors duration-200 ease-out peer-focus-visible:ring-4 peer-focus-visible:ring-focus/20',
          checked ? 'border-ink bg-accent' : 'border-line-strong',
        )}
      >
        <span
          className={cn(
            'absolute top-1/2 size-3.5 -translate-y-1/2 rounded-full shadow-sm transition-[background-color,left,right] duration-200 ease-out',
            checked ? 'right-1 bg-ink' : 'left-1 bg-ink-muted',
          )}
        />
      </span>
      <span className="grid min-w-0 gap-0.5 text-sm">
        <span className="font-bold leading-tight text-ink">{label}</span>
      </span>
    </label>
  )
}

function getSharedPricingAmount(pricing: PaymentPricing) {
  const firstMode = pricing.serviceModes[0]

  return firstMode ? pricing.amounts[firstMode] ?? 0 : 0
}

function withSharedPricingAmount(pricing: PaymentPricing, amount: number) {
  const amounts = { ...pricing.amounts }

  pricing.serviceModes.forEach((mode) => {
    amounts[mode] = amount
  })

  return amounts
}

function PricingSummary({ pricing }: { pricing: PaymentPricing }) {
  const activeModes = serviceModeOptions.filter((option) =>
    pricing.serviceModes.includes(option.value),
  )
  const summaryItems = pricing.samePriceForAll
    ? activeModes.length > 0
      ? [
          {
            id: 'shared',
            label: activeModes.map((option) => option.label).join(' · '),
            amount: pricing.samePriceAmount,
          },
        ]
      : []
    : activeModes.map((option) => ({
        id: option.value,
        label: option.label,
        amount: pricing.amounts[option.value] ?? 0,
      }))

  return (
    <div className="mt-2 flex min-w-0 flex-wrap gap-1.5">
      {summaryItems.length > 0 ? (
        summaryItems.map((item) => (
          <span
            className="inline-flex max-w-full items-center gap-1.5 rounded-pill border border-line bg-surface px-2 py-1 text-xs font-semibold text-ink-muted"
            key={item.id}
          >
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent-ink" />
            <span className="truncate">{item.label}</span>
            <span className="shrink-0 font-mono font-bold text-ink">
              {formatChileanPesos(item.amount)}
            </span>
          </span>
        ))
      ) : (
        <span className="rounded-pill border border-dashed border-line-strong px-2 py-1 text-xs font-semibold text-ink-muted">
          Sin modalidades activas
        </span>
      )}
    </div>
  )
}

function PaymentPricingEditor({ index, onChange, onRemove, pricing }: PaymentPricingEditorProps) {
  const label = pricing.name.trim() || `Tarifa ${index + 1}`
  const modesHelpId = `${pricing.id}-modes-help`
  const panelId = `${pricing.id}-editor`
  const toggleId = `${pricing.id}-toggle`
  const [isOpen, setIsOpen] = useState(index === 0)
  const activeModeCount = pricing.serviceModes.length

  return (
    <li
      className={cn(
        'min-w-0 rounded-control border-2 border-line bg-surface-subtle transition-colors duration-200 ease-out',
        isOpen && 'border-line-strong bg-surface',
      )}
    >
      <div className="flex items-start gap-2 p-2 sm:p-3">
        <button
          aria-controls={panelId}
          aria-expanded={isOpen}
          aria-label={`${isOpen ? 'Ocultar' : 'Mostrar'} detalles de ${label}`}
          className="group flex min-w-0 flex-1 items-center gap-3 rounded-control px-2 py-1.5 text-left outline-none transition-colors hover:bg-surface focus-visible:ring-4 focus-visible:ring-focus/20"
          id={toggleId}
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          <span className="min-w-0 flex-1">
            <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-display text-lg font-bold tracking-[-0.04em] text-ink">
                {label}
              </span>
              <span className="rounded-pill bg-surface px-2 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
                {activeModeCount}{' '}
                {activeModeCount === 1 ? 'modalidad activa' : 'modalidades activas'}
              </span>
              {pricing.samePriceForAll ? (
                <span className="rounded-pill bg-accent-soft px-2 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-accent-ink">
                  Precio único
                </span>
              ) : null}
            </span>
            <PricingSummary pricing={pricing} />
          </span>
          <span
            aria-hidden="true"
            className={cn(
              'inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface text-ink-muted shadow-sm transition-[background-color,border-color,color,transform] duration-300 ease-out motion-reduce:transition-none group-hover:border-ink group-hover:text-ink group-focus-visible:border-ink group-focus-visible:text-ink',
              isOpen && 'rotate-180 border-accent-ink bg-accent-soft text-accent-ink',
            )}
          >
            <Icon name="chevron-down" size={16} />
          </span>
        </button>
      </div>

      <div
        aria-hidden={!isOpen}
        aria-labelledby={toggleId}
        className={cn(
          'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'pointer-events-none',
        )}
        id={panelId}
        inert={!isOpen}
        role="region"
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-line px-3 pb-3 pt-3 sm:px-4 sm:pb-4">
            <div className="flex items-end gap-2 border-b border-line pb-3">
              <label
                className="grid min-w-0 flex-1 gap-1.5 text-xs font-bold uppercase tracking-[0.09em] text-ink-muted"
                htmlFor={`${pricing.id}-name`}
              >
                Nombre de la tarifa
                <AppInput
                  autoComplete="off"
                  className="h-10 min-h-0 px-2.5 py-2 text-sm"
                  id={`${pricing.id}-name`}
                  onChange={(event) => onChange({ name: event.currentTarget.value })}
                  placeholder="Ej. Particular"
                  required
                  type="text"
                  value={pricing.name}
                />
              </label>
              <IconButton
                label={`Eliminar ${label}`}
                onClick={onRemove}
                type="button"
              >
                <Icon name="trash" size={17} />
              </IconButton>
            </div>

            <fieldset aria-describedby={modesHelpId} className="mt-3 min-w-0">
              <legend className="text-xs font-bold uppercase tracking-[0.09em] text-ink-muted">
                Modalidades y valores
              </legend>
              <p
                className="mt-1 text-xs font-medium normal-case tracking-normal text-ink-muted"
                id={modesHelpId}
              >
                Activa las modalidades que ofrecerás y define el valor de cada una.
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {serviceModeOptions.map((option) => {
                  const isSelected = pricing.serviceModes.includes(option.value)
                  const switchId = `${pricing.id}-${option.value}-enabled`
                  const amountId = `${pricing.id}-${option.value}-amount`

                  return (
                    <div
                      className="flex min-h-12 items-center gap-2 rounded-control border border-line bg-surface p-2"
                      key={option.value}
                    >
                      <ToggleControl
                        ariaLabel={`${option.label} para ${label}`}
                        checked={isSelected}
                        className="min-w-0 flex-1"
                        id={switchId}
                        label={option.label}
                        onChange={() => {
                          const serviceModes = isSelected
                            ? pricing.serviceModes.filter((mode) => mode !== option.value)
                            : [...pricing.serviceModes, option.value]
                          const amounts =
                            !isSelected && pricing.samePriceForAll
                              ? {
                                  ...pricing.amounts,
                                  [option.value]: pricing.samePriceAmount,
                                }
                              : pricing.amounts

                          onChange({ amounts, serviceModes })
                        }}
                      />
                      <label className="w-28 shrink-0 sm:w-32" htmlFor={amountId}>
                        <span className="sr-only">Valor de {option.label} para {label}</span>
                        <AppInput
                          aria-label={`Valor de ${option.label} para ${label}`}
                          autoComplete="off"
                          className="h-10 min-h-0 px-2.5 py-2 text-sm disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-ink-muted disabled:hover:border-line-strong"
                          disabled={!isSelected || pricing.samePriceForAll}
                          id={amountId}
                          inputMode="numeric"
                          onChange={(event) => {
                            const amount = parseChileanPesos(event.currentTarget.value)
                            const amounts = pricing.samePriceForAll
                              ? withSharedPricingAmount(pricing, amount)
                              : { ...pricing.amounts, [option.value]: amount }

                            onChange({ amounts })
                          }}
                          placeholder="Valor"
                          type="text"
                          value={
                            isSelected ? formatChileanPesos(pricing.amounts[option.value] ?? 0) : ''
                          }
                        />
                      </label>
                    </div>
                  )
                })}
              </div>
              <div className="mt-2 flex items-center gap-2 rounded-control border border-line-strong bg-surface-subtle p-2.5">
                <ToggleControl
                  ariaDescribedBy={modesHelpId}
                  ariaLabel={`Mismo precio para todas las modalidades de ${label}`}
                  checked={pricing.samePriceForAll}
                  className="min-w-0 flex-1"
                  id={`${pricing.id}-same-price`}
                  label="Mismo precio para todas las modalidades"
                  onChange={() => {
                    const samePriceForAll = !pricing.samePriceForAll
                    const samePriceAmount = samePriceForAll
                      ? getSharedPricingAmount(pricing)
                      : pricing.samePriceAmount

                    onChange({
                      amounts: samePriceForAll
                        ? withSharedPricingAmount(pricing, samePriceAmount)
                        : pricing.amounts,
                      samePriceAmount,
                      samePriceForAll,
                    })
                  }}
                />
                <label className="w-28 shrink-0 sm:w-32" htmlFor={`${pricing.id}-same-price-amount`}>
                  <span className="sr-only">Valor común para {label}</span>
                  <AppInput
                    aria-label={`Valor común para ${label}`}
                    autoComplete="off"
                    className="h-10 min-h-0 px-2.5 py-2 text-sm disabled:cursor-not-allowed disabled:bg-canvas disabled:text-ink-muted disabled:hover:border-line-strong"
                    disabled={!pricing.samePriceForAll}
                    id={`${pricing.id}-same-price-amount`}
                    inputMode="numeric"
                    onChange={(event) => {
                      const samePriceAmount = parseChileanPesos(event.currentTarget.value)

                      onChange({
                        amounts: withSharedPricingAmount(pricing, samePriceAmount),
                        samePriceAmount,
                      })
                    }}
                    placeholder="Valor común"
                    type="text"
                    value={
                      pricing.samePriceForAll ? formatChileanPesos(pricing.samePriceAmount) : ''
                    }
                  />
                </label>
              </div>
            </fieldset>
          </div>
        </div>
      </div>
    </li>
  )
}

function isPaymentProofDeadlineHours(value: number): value is PaymentProofDeadlineHours {
  return PAYMENT_PROOF_DEADLINE_OPTIONS.some((option) => option.value === value)
}

export function PaymentPage() {
  const settings = usePaymentStore((state) => state.settings)
  const addPricingOption = usePaymentStore((state) => state.addPricingOption)
  const removePricingOption = usePaymentStore((state) => state.removePricingOption)
  const updatePricingOption = usePaymentStore((state) => state.updatePricingOption)
  const setProofDeadlineHours = usePaymentStore((state) => state.setProofDeadlineHours)
  const updateTransferDetails = usePaymentStore((state) => state.updateTransferDetails)
  const resetPaymentSettings = usePaymentStore((state) => state.resetPaymentSettings)
  const [pricingSaveMessage, setPricingSaveMessage] = useState('')
  const [paymentSaveMessage, setPaymentSaveMessage] = useState('')

  function handlePaymentChange() {
    setPaymentSaveMessage('')
  }

  function handlePricingChange() {
    setPricingSaveMessage('')
  }

  function handleTransferChange(
    event: ChangeEvent<HTMLInputElement>,
    field: keyof typeof settings.transferDetails,
  ) {
    updateTransferDetails({ [field]: event.currentTarget.value })
    handlePaymentChange()
  }

  function handlePricingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPricingSaveMessage('Tarifas guardadas en esta sesión de demo.')
  }

  function handlePaymentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPaymentSaveMessage('Configuración de pagos guardada en esta sesión de demo.')
  }

  function handleReset() {
    resetPaymentSettings()
    setPricingSaveMessage('Tarifas demo restauradas.')
    setPaymentSaveMessage('Configuración de pagos demo restaurada.')
  }

  return (
    <div className="space-y-6">
      <BannerWrapper
        ariaLabel="Introducción de la configuración de pagos"
        dismissLabel="Ocultar introducción de pagos"
        storageKey="payments-intro"
        tone="ink"
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-accent">
              <Icon name="wallet" size={15} />
              Configuración de pagos
            </p>
            <h1 className="max-w-2xl font-display text-4xl font-bold leading-[0.95] tracking-[-0.07em] sm:text-5xl">
              Que cobrar sea <span className="text-accent">simple</span>.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-surface/70 sm:text-lg">
              Define tus tarifas, los datos para transferencias y el plazo para recibir cada comprobante.
            </p>
          </div>
        </div>
      </BannerWrapper>

      <form aria-labelledby="pricing-title" className="space-y-3" onSubmit={handlePricingSubmit}>
        <section aria-labelledby="pricing-title" className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3 px-1">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">
                Tarifas de atención
              </p>
              <h2
                className="mt-1 font-display text-3xl font-bold tracking-[-0.06em] text-ink"
                id="pricing-title"
              >
                Tus precios
              </h2>
            </div>
            <StatusPill status="available">
              {settings.pricingOptions.length}{' '}
              {settings.pricingOptions.length === 1 ? 'tarifa' : 'tarifas'}
            </StatusPill>
          </div>

          <div className="rounded-card border-2 border-line bg-surface p-4 shadow-card sm:p-5">
            <div className="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-display text-lg font-bold tracking-[-0.04em] text-ink">
                  Modalidades y precios
                </h3>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-muted">
                  Crea una tarifa por tipo de paciente o convenio, activa sus modalidades y define si comparten el mismo valor.
                </p>
              </div>
              <AppButton
                onClick={() => {
                  addPricingOption()
                  handlePricingChange()
                }}
                size="sm"
                type="button"
                variant="outline"
              >
                <Icon name="plus" size={16} />
                Añadir tarifa
              </AppButton>
            </div>

            {settings.pricingOptions.length > 0 ? (
              <ul aria-label="Tarifas de atención" className="mt-4 grid gap-3">
                {settings.pricingOptions.map((pricing, index) => (
                  <PaymentPricingEditor
                    index={index}
                    key={pricing.id}
                    onChange={(update) => {
                      updatePricingOption(pricing.id, update)
                      handlePricingChange()
                    }}
                    onRemove={() => {
                      removePricingOption(pricing.id)
                      handlePricingChange()
                    }}
                    pricing={pricing}
                  />
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-control border border-dashed border-line-strong p-4 text-sm text-ink-muted">
                Todavía no tienes tarifas. Añade la primera para empezar.
              </p>
            )}

            <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p
                aria-live="polite"
                className="max-w-xl text-sm leading-relaxed text-ink-muted"
                role="status"
              >
                {pricingSaveMessage || 'Las tarifas se mantienen en esta sesión de demo.'}
              </p>
              <AppButton type="submit" variant="accent">
                <Icon name="check" size={17} />
                Guardar tarifas
              </AppButton>
            </div>
          </div>
        </section>
      </form>

      <form aria-labelledby="payment-method-title" className="space-y-6" onSubmit={handlePaymentSubmit}>
        <section aria-labelledby="payment-method-title" className="space-y-3">
          <div className="px-1">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">
              Confirmación de pago
            </p>
            <h2
              className="mt-1 font-display text-3xl font-bold tracking-[-0.06em] text-ink"
              id="payment-method-title"
            >
              Cómo recibirás el comprobante
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <fieldset className="rounded-card border-2 border-line bg-surface p-4 shadow-card sm:p-5">
              <legend className="font-display text-lg font-bold tracking-[-0.04em] text-ink">
                Plazo de envío
              </legend>
              <p
                className="mt-1 text-sm leading-relaxed text-ink-muted"
                id="proof-deadline-help"
              >
                No hay pasarela de pago. Este plazo indica cuánto tiempo tiene el cliente para enviarte el comprobante después de agendar.
              </p>
              <label className="mt-4 grid gap-1.5 text-xs font-bold uppercase tracking-[0.09em] text-ink-muted" htmlFor="proof-deadline">
                Tiempo para enviar comprobante
                <AppSelect
                  aria-describedby="proof-deadline-help"
                  aria-label="Tiempo para enviar comprobante"
                  id="proof-deadline"
                  name="proof-deadline"
                  onChange={(event) => {
                    const value = Number(event.currentTarget.value)

                    if (isPaymentProofDeadlineHours(value)) {
                      setProofDeadlineHours(value)
                      handlePaymentChange()
                    }
                  }}
                  value={settings.proofDeadlineHours}
                >
                  {PAYMENT_PROOF_DEADLINE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </AppSelect>
              </label>
              <div className="mt-4 rounded-control border border-line bg-surface-subtle p-3 text-sm text-ink-muted">
                <span className="font-bold text-ink">Estado:</span>{' '}
                {settings.proofDeadlineHours === 0
                  ? 'la cita no necesita comprobante para quedar agendada.'
                  : 'el cliente deberá enviarte el comprobante dentro del plazo elegido.'}
              </div>
            </fieldset>

            <fieldset className="rounded-card border-2 border-line bg-surface p-4 shadow-card sm:p-5">
              <legend className="font-display text-lg font-bold tracking-[-0.04em] text-ink">
                Datos de transferencia
              </legend>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                Estos datos se compartirán con el cliente cuando corresponda confirmar mediante transferencia.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <TransferTextField
                  field={transferFieldConfig[0]}
                  onChange={(event) => handleTransferChange(event, transferFieldConfig[0].key)}
                  value={settings.transferDetails[transferFieldConfig[0].key]}
                />
                <label className="grid gap-1.5 text-xs font-bold uppercase tracking-[0.09em] text-ink-muted" htmlFor="transfer-account-type">
                  Tipo de cuenta
                  <AppSelect
                    aria-label="Tipo de cuenta"
                    id="transfer-account-type"
                    name="transfer-account-type"
                    onChange={(event) => {
                      updateTransferDetails({
                        accountType: event.currentTarget.value as typeof settings.transferDetails.accountType,
                      })
                      handlePaymentChange()
                    }}
                    value={settings.transferDetails.accountType}
                  >
                    {BANK_ACCOUNT_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </AppSelect>
                </label>
                {transferFieldConfig.slice(1).map((field) => (
                  <TransferTextField
                    field={field}
                    key={field.key}
                    onChange={(event) => handleTransferChange(event, field.key)}
                    value={settings.transferDetails[field.key]}
                  />
                ))}
              </div>
              <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-ink-muted">
                Puedes completar estos datos aunque hoy no exijas comprobante; quedarán listos para cuando actives esa opción.
              </p>
            </fieldset>
          </div>
        </section>

        <div className="flex flex-col gap-4 rounded-card border-2 border-line bg-surface p-4 shadow-card sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <p
            aria-live="polite"
            className="max-w-xl text-sm leading-relaxed text-ink-muted"
            role="status"
          >
            {paymentSaveMessage || 'Los cambios se mantienen en esta sesión de demo.'}
          </p>
          <div className="grid w-full gap-2 sm:grid-cols-2 lg:flex lg:w-auto lg:shrink-0">
            <AppButton
              className="w-full whitespace-nowrap lg:min-w-40"
              onClick={handleReset}
              type="button"
              variant="outline"
            >
              Restaurar demo
            </AppButton>
            <AppButton className="w-full whitespace-nowrap lg:min-w-40" type="submit" variant="accent">
              <Icon name="check" size={17} />
              Guardar pagos
            </AppButton>
          </div>
        </div>
      </form>

      <p className="text-center text-xs text-ink-muted">
        La confirmación de citas se incorporará en una etapa posterior.
      </p>
    </div>
  )
}
