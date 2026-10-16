import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { BannerWrapper } from '@/components/ui/banner-wrapper'

describe('BannerWrapper', () => {
  it('permite ocultar y volver a mostrar el banner', async () => {
    const user = userEvent.setup()

    render(
      <BannerWrapper
        ariaLabel="Introducción de prueba"
        dismissLabel="Ocultar introducción"
      >
        <h1>Contenido de prueba</h1>
      </BannerWrapper>,
    )

    expect(
      screen.getByRole('region', { name: 'Introducción de prueba' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Ocultar introducción' }))

    expect(
      screen.queryByRole('region', { name: 'Introducción de prueba' }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Mostrar introducción' }))

    expect(
      screen.getByRole('region', { name: 'Introducción de prueba' }),
    ).toBeInTheDocument()
  })
})
