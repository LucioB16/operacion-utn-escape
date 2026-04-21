import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SalaPLGrafica } from '../features/sala-1-pl-grafica/SalaPLGrafica'

describe('SalaPLGrafica', () => {
  it('resuelve la sala completa con feedback y cierre correcto', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const user = userEvent.setup()
    const onResolve = vi.fn()

    render(
      <SalaPLGrafica
        disabled={false}
        gameMode="entrenamiento"
        onResolve={onResolve}
        sourceIds={[]}
        sessionKey="pl"
      />,
    )

    await user.click(screen.getByRole('button', { name: /C -> Z = 34/i }))
    await user.click(screen.getByRole('button', { name: /validar decisión/i }))
    expect(screen.getByText(/vértice óptimo detectado/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /mejora marginal del valor óptimo/i }))
    await user.click(screen.getByRole('button', { name: /validar decisión/i }))

    expect(onResolve).toHaveBeenCalledTimes(2)
    expect(onResolve).toHaveBeenLastCalledWith(expect.objectContaining({
      completed: true,
      roomId: 'sala-1',
      timeDeltaSeconds: 0,
    }))
  })
})
