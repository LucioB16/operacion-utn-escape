import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SalaPronosticos } from '../features/sala-4-pronosticos/SalaPronosticos'

describe('SalaPronosticos', () => {
  it('resuelve la secuencia de pronósticos con feedback guiado', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const user = userEvent.setup()
    const onResolve = vi.fn()

    render(
      <SalaPronosticos
        disabled={false}
        gameMode="entrenamiento"
        onResolve={onResolve}
        sourceIds={[]}
        sessionKey="pronosticos"
      />,
    )

    await user.type(screen.getByPlaceholderText(/escribí tu resultado/i), '14.7')
    await user.click(screen.getByRole('button', { name: /validar cálculo/i }))

    await user.clear(screen.getByPlaceholderText(/escribí tu resultado/i))
    await user.type(screen.getByPlaceholderText(/escribí tu resultado/i), '33.92')
    await user.click(screen.getByRole('button', { name: /validar cálculo/i }))

    await user.clear(screen.getByPlaceholderText(/escribí tu resultado/i))
    await user.type(screen.getByPlaceholderText(/escribí tu resultado/i), '3')
    await user.click(screen.getByRole('button', { name: /validar cálculo/i }))

    await user.clear(screen.getByPlaceholderText(/escribí tu resultado/i))
    await user.type(screen.getByPlaceholderText(/escribí tu resultado/i), '42.83')
    await user.click(screen.getByRole('button', { name: /validar cálculo/i }))

    await user.click(screen.getByRole('button', { name: 'T4' }))
    await user.click(screen.getByRole('button', { name: /validar lectura/i }))

    expect(onResolve).toHaveBeenLastCalledWith(expect.objectContaining({
      completed: true,
      roomId: 'sala-4',
      timeDeltaSeconds: 0,
    }))
  })
})
