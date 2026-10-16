import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { describe, expect, it } from 'vitest'

import { routeTree } from '@/routeTree.gen'

describe('navegación principal', () => {
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
