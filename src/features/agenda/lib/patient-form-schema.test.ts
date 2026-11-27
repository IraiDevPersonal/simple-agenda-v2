import { describe, expect, it } from 'vitest'

import { formatChileanRut, isValidChileanRut } from '@/lib/patient-utils'

import { patientFormSchema } from './patient-form-schema'

describe('validación del RUT chileno', () => {
  it('formatea y valida un RUT con dígito verificador correcto', () => {
    expect(formatChileanRut('123456785')).toBe('12.345.678-5')
    expect(isValidChileanRut('12.345.678-5')).toBe(true)
    expect(isValidChileanRut('12.345.678-9')).toBe(false)
  })

  it('valida los datos mínimos del paciente con Zod', () => {
    const result = patientFormSchema.safeParse({
      email: 'camila.rojas@ejemplo.cl',
      firstName: 'Camila',
      lastName: 'Rojas',
      phone: '+56 9 8765 4321',
      rut: '12.345.678-5',
    })

    expect(result.success).toBe(true)
  })
})
