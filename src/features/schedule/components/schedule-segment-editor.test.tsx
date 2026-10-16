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
  it('recalcula el fin visible al cambiar la cantidad de bloques', () => {
    render(<EditorHarness />)
    expect(screen.getByText('10:30')).toBeInTheDocument()

    fireEvent.change(screen.getByRole('spinbutton', { name: 'Cantidad de bloques' }), {
      target: { value: '3' },
    })

    expect(screen.getByText('11:15')).toBeInTheDocument()
  })
})
