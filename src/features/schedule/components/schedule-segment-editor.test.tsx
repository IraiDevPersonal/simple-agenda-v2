import { useState } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ScheduleSegmentEditor } from '@/features/schedule/components/schedule-segment-editor'
import type { ScheduleSegment } from '@/types/agenda'

function EditorHarness() {
  const [segment, setSegment] = useState<ScheduleSegment>({
    blockCount: 2,
    enabled: true,
    id: 'segment-harness',
    startTime: '09:00',
    serviceMode: 'in-person',
    weekday: 'monday',
  })

  return (
    <ScheduleSegmentEditor
      errors={[]}
      onChange={(update) => setSegment((current) => ({ ...current, ...update }))}
      onRemove={() => undefined}
      segment={segment}
    />
  )
}

describe('ScheduleSegmentEditor', () => {
  it('agrega un bloque y recalcula el fin visible', () => {
    render(<EditorHarness />)
    expect(screen.getByText('10:30')).toBeInTheDocument()
    expect(screen.queryByRole('spinbutton', { name: 'Cantidad de bloques' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Bloques de 45 min' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Añadir bloque' }))

    expect(screen.getByText('11:15')).toBeInTheDocument()
    expect(screen.getByText('3 bloques')).toBeInTheDocument()
    expect(screen.queryByText('3 bloques exactos')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Quitar bloque de las 09:45' }))

    expect(screen.getByText('10:30')).toBeInTheDocument()
    expect(screen.getByText('2 bloques')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Quitar bloque de las 09:45' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quitar bloque de las 09:00' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quitar bloque de las 10:30' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Quitar bloque de las 09:00' }))

    expect(screen.getByText('1 bloque')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Quitar bloque de las 09:00' })).not.toBeInTheDocument()
  })

  it('permite seleccionar la modalidad de atención', () => {
    render(<EditorHarness />)

    fireEvent.change(screen.getByRole('combobox', { name: 'Modalidad de atención' }), {
      target: { value: 'remote' },
    })

    expect(screen.getByRole('combobox', { name: 'Modalidad de atención' })).toHaveValue('remote')
  })
})
