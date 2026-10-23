const chileanNumberFormatter = new Intl.NumberFormat('es-CL')

export function formatChileanPesos(amount: number) {
  const safeAmount = Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0

  return `$${chileanNumberFormatter.format(safeAmount)}`
}

export function parseChileanPesos(value: string) {
  const digits = value.replace(/\D/g, '')

  return digits ? Number(digits) : 0
}
