import type { Patient } from '@/types/agenda'

export function normalizeRut(value: string) {
  return value.replace(/[^0-9kK]/g, '').toUpperCase()
}

export function formatChileanRut(value: string) {
  const normalizedRut = normalizeRut(value)

  if (normalizedRut.length <= 1) {
    return normalizedRut
  }

  const verifierDigit = normalizedRut.at(-1)
  const body = normalizedRut.slice(0, -1)
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return `${formattedBody}-${verifierDigit}`
}

export function isValidChileanRut(value: string) {
  const normalizedRut = normalizeRut(value)

  if (!/^\d+[0-9K]$/.test(normalizedRut) || normalizedRut.length < 2) {
    return false
  }

  const body = normalizedRut.slice(0, -1)
  const verifierDigit = normalizedRut.at(-1)

  if (/^0+$/.test(body)) {
    return false
  }

  let multiplier = 2
  let sum = 0

  for (let index = body.length - 1; index >= 0; index -= 1) {
    sum += Number(body[index]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }

  const remainder = 11 - (sum % 11)
  const calculatedVerifier = remainder === 11 ? '0' : remainder === 10 ? 'K' : String(remainder)

  return calculatedVerifier === verifierDigit
}

export function findPatientByRut(patients: Patient[], rut: string) {
  const normalizedRut = normalizeRut(rut)

  if (!normalizedRut) {
    return undefined
  }

  return patients.find((patient) => normalizeRut(patient.rut) === normalizedRut)
}
