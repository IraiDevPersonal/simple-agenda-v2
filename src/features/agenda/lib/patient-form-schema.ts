import { z } from 'zod'

import { isValidChileanRut } from '@/lib/patient-utils'

export const patientFormSchema = z.object({
  rut: z
    .string()
    .trim()
    .min(1, 'Ingresa el RUT.')
    .refine(isValidChileanRut, 'Ingresa un RUT chileno válido.'),
  firstName: z.string().trim().min(2, 'Ingresa los nombres.'),
  lastName: z.string().trim().min(2, 'Ingresa los apellidos.'),
  email: z.string().trim().email('Ingresa un correo válido.'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s().-]{8,}$/, 'Ingresa un teléfono válido.'),
})

export type PatientFormValues = z.infer<typeof patientFormSchema>
