export function formatProofDeadline(hours: number) {
  if (hours === 24) {
    return '1 día'
  }

  return `${hours} ${hours === 1 ? 'hora' : 'horas'}`
}
