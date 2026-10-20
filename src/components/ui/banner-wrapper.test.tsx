import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'

import { BannerWrapper } from '@/components/ui/banner-wrapper'

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

describe('BannerWrapper', () => {
  it('permite ocultar y volver a mostrar el banner', async () => {
    const user = userEvent.setup()

    render(
      <BannerWrapper
        ariaLabel="Introducción de prueba"
        dismissLabel="Ocultar introducción"
        storageKey="banner-test"
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

  it('conserva el estado oculto al montar el banner nuevamente', async () => {
    const user = userEvent.setup()
    const firstRender = render(
      <BannerWrapper
        ariaLabel="Introducción persistente"
        dismissLabel="Ocultar introducción persistente"
        storageKey="banner-persistence-test"
      >
        <h1>Contenido persistente</h1>
      </BannerWrapper>,
    )

    await user.click(
      screen.getByRole('button', { name: 'Ocultar introducción persistente' }),
    )
    firstRender.unmount()

    render(
      <BannerWrapper
        ariaLabel="Introducción persistente"
        dismissLabel="Ocultar introducción persistente"
        storageKey="banner-persistence-test"
      >
        <h1>Contenido persistente</h1>
      </BannerWrapper>,
    )

    expect(
      screen.queryByRole('region', { name: 'Introducción persistente' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Mostrar introducción' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Mostrar introducción' }))
    expect(
      screen.getByRole('region', { name: 'Introducción persistente' }),
    ).toBeInTheDocument()
  })
})
