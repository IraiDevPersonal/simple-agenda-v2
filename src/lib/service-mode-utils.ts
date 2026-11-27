import type { ServiceMode } from '@/types/agenda'

export const SERVICE_MODE_OPTIONS: Array<{ value: ServiceMode; label: string }> = [
  { value: 'in-person', label: 'Presencial' },
  { value: 'remote', label: 'Remoto' },
  { value: 'home-visit', label: 'A domicilio' },
]

export function getServiceModeLabel(mode: ServiceMode) {
  return SERVICE_MODE_OPTIONS.find((option) => option.value === mode)?.label ?? mode
}
