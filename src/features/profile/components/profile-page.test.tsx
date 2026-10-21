import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { ProfilePage } from '@/features/profile/components/profile-page'
import { useProfileStore } from '@/stores/profile-store'

describe('ProfilePage', () => {
  beforeEach(() => {
    useProfileStore.getState().resetProfile()
  })

  it('muestra los datos dummy del profesional', () => {
    render(<ProfilePage />)

    expect(screen.getByLabelText('Nombres')).toHaveValue('Alex')
    expect(screen.getByLabelText('Apellidos')).toHaveValue('González')
    expect(screen.getByRole('combobox', { name: 'Profesión' })).toHaveValue('Psicólogo')
  })

  it('permite ingresar manualmente una profesión no incluida', () => {
    render(<ProfilePage />)

    fireEvent.change(screen.getByRole('combobox', { name: 'Profesión' }), {
      target: { value: 'other' },
    })
    fireEvent.change(screen.getByLabelText('Especifica tu profesión'), {
      target: { value: 'Abogado' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar perfil' }))

    expect(useProfileStore.getState().profile.profession).toBe('Abogado')
    expect(screen.getByRole('status')).toHaveTextContent(
      'Perfil guardado en esta sesión de demo.',
    )
  })

  it('guarda una profesión frecuente desde el selector', () => {
    render(<ProfilePage />)

    fireEvent.change(screen.getByRole('combobox', { name: 'Profesión' }), {
      target: { value: 'Diseñador' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar perfil' }))

    expect(useProfileStore.getState().profile.profession).toBe('Diseñador')
  })
})
