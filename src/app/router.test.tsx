import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { routeTree } from '@/routeTree.gen'

describe('navegación principal', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('selecciona el día actual cuando la URL no tiene fecha', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-21T12:00:00-03:00'))

    const router = createRouter({
      history: createMemoryHistory({
        initialEntries: ['/agenda'],
      }),
      routeTree,
    })

    render(<RouterProvider router={router} />)

    expect(await screen.findByRole('heading', { name: 'Tus bloques del día' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mié 21/i })).toHaveAttribute(
      'aria-current',
      'date',
    )
    expect(router.state.location.search).toEqual({})
  })

  it('permite pasar de agenda a horarios', async () => {
    const user = userEvent.setup()
    const router = createRouter({
      history: createMemoryHistory({
        initialEntries: ['/agenda?date=2026-08-04'],
      }),
      routeTree,
    })

    render(<RouterProvider router={router} />)
    expect(await screen.findByText('Tus bloques del día')).toBeInTheDocument()

    await user.click(screen.getAllByRole('link', { name: 'Horarios' })[0])
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Tus horarios' })).toBeInTheDocument()
    })
  })

  it('permite navegar desde agenda al perfil profesional', async () => {
    const user = userEvent.setup()
    const router = createRouter({
      history: createMemoryHistory({
        initialEntries: ['/agenda?date=2026-08-04'],
      }),
      routeTree,
    })

    render(<RouterProvider router={router} />)
    expect(await screen.findByText('Tus bloques del día')).toBeInTheDocument()

    await user.click(screen.getAllByRole('link', { name: 'Perfil' })[0])
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Datos del profesional' })).toBeInTheDocument()
    })
  })

  it('permite navegar entre meses conservando el día seleccionado', async () => {
    const user = userEvent.setup()
    const router = createRouter({
      history: createMemoryHistory({
        initialEntries: ['/agenda?date=2026-08-04'],
      }),
      routeTree,
    })

    render(<RouterProvider router={router} />)
    expect(await screen.findByRole('heading', { name: 'Agosto de 2026' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Mes siguiente' }))
    await waitFor(() => {
      expect(router.state.location.search).toEqual({ date: '2026-09-04' })
      expect(screen.getByRole('heading', { name: 'Septiembre de 2026' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Mes anterior' }))
    await waitFor(() => {
      expect(router.state.location.search).toEqual({ date: '2026-08-04' })
    })
  })
})
