import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { PaymentPage } from '@/features/payments/components/payment-page'
import { usePaymentStore } from '@/stores/payment-store'

describe('PaymentPage', () => {
  beforeEach(() => {
    usePaymentStore.getState().resetPaymentSettings()
  })

  it('muestra tarifas demo con modalidad y valores en pesos chilenos', () => {
    render(<PaymentPage />)

    expect(screen.getByRole('heading', { name: 'Tus precios' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Valor de Presencial para Particular' })).toHaveValue('$35.000')
    expect(screen.getByRole('textbox', { name: 'Valor de Remoto para Particular' })).toHaveValue('$30.000')
    expect(screen.getByRole('textbox', { name: 'Valor de A domicilio para Particular' })).toHaveValue('$40.000')
    expect(screen.getByRole('switch', { name: 'Presencial para Particular' })).toBeChecked()
    expect(screen.getByRole('switch', { name: 'Remoto para Particular' })).toBeChecked()
    expect(screen.getByRole('switch', { name: 'A domicilio para Particular' })).toBeChecked()
    expect(screen.getByRole('switch', { name: 'Mismo precio para todas las modalidades de Particular' })).not.toBeChecked()
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar detalles de Fonasa' }))
    expect(screen.getByRole('switch', { name: 'Mismo precio para todas las modalidades de Fonasa' })).toBeChecked()
    expect(screen.getByRole('textbox', { name: 'Valor común para Particular' })).toBeDisabled()
    expect(screen.getByRole('textbox', { name: 'Valor común para Fonasa' })).toHaveValue('$25.000')
    expect(screen.getByRole('textbox', { name: 'Valor de Presencial para Fonasa' })).toBeDisabled()
    expect(screen.getByRole('combobox', { name: 'Tiempo para enviar comprobante' })).toHaveValue('3')
  })

  it('permite configurar valores independientes o sincronizados por modalidad', () => {
    render(<PaymentPage />)

    const remoteAmount = screen.getByRole('textbox', { name: 'Valor de Remoto para Particular' })
    fireEvent.change(remoteAmount, { target: { value: '123456' } })

    expect(remoteAmount).toHaveValue('$123.456')
    expect(usePaymentStore.getState().settings.pricingOptions[0]?.amounts.remote).toBe(123456)
    expect(usePaymentStore.getState().settings.pricingOptions[0]?.amounts['in-person']).toBe(35000)

    fireEvent.click(
      screen.getByRole('switch', {
        name: 'Mismo precio para todas las modalidades de Particular',
      }),
    )
    expect(screen.getByRole('textbox', { name: 'Valor de Presencial para Particular' })).toBeDisabled()
    expect(screen.getByRole('textbox', { name: 'Valor común para Particular' })).toHaveValue('$35.000')

    fireEvent.change(screen.getByRole('textbox', { name: 'Valor común para Particular' }), {
      target: { value: '50000' },
    })

    expect(usePaymentStore.getState().settings.pricingOptions[0]?.samePriceForAll).toBe(true)
    expect(usePaymentStore.getState().settings.pricingOptions[0]?.samePriceAmount).toBe(50000)
    expect(usePaymentStore.getState().settings.pricingOptions[0]?.amounts).toMatchObject({
      'in-person': 50000,
      remote: 50000,
      'home-visit': 50000,
    })
  })

  it('formatea el valor y permite agregar una nueva tarifa', () => {
    render(<PaymentPage />)

    const amountInputs = screen.getAllByRole('textbox', { name: /Valor de/ })
    fireEvent.change(amountInputs[0], { target: { value: '123456' } })

    expect(amountInputs[0]).toHaveValue('$123.456')
    expect(usePaymentStore.getState().settings.pricingOptions[0]?.amounts['in-person']).toBe(123456)

    fireEvent.click(screen.getByRole('button', { name: 'Añadir tarifa' }))
    expect(screen.getByDisplayValue('Nueva tarifa')).toBeInTheDocument()
  })

  it('guarda el plazo y los datos de transferencia en el store', () => {
    render(<PaymentPage />)

    fireEvent.change(screen.getByRole('combobox', { name: 'Tiempo para enviar comprobante' }), {
      target: { value: '24' },
    })
    fireEvent.change(screen.getByLabelText('Banco'), {
      target: { value: 'Banco Estado' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar pagos' }))

    expect(usePaymentStore.getState().settings.proofDeadlineHours).toBe(24)
    expect(usePaymentStore.getState().settings.transferDetails.bank).toBe('Banco Estado')
    expect(screen.getByText(
      'Configuración de pagos guardada en esta sesión de demo.',
    )).toBeInTheDocument()
  })

  it('permite guardar las tarifas de forma independiente', () => {
    render(<PaymentPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Guardar tarifas' }))

    expect(screen.getByText('Tarifas guardadas en esta sesión de demo.')).toBeInTheDocument()
    expect(screen.getByText('Los cambios se mantienen en esta sesión de demo.')).toBeInTheDocument()
  })
})
