import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SalaRedes } from '../features/sala-5-redes/SalaRedes'

describe('SalaRedes', () => {
  it('resuelve AEM, costo mínimo, ruta y teoría aplicada', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const user = userEvent.setup()
    const onResolve = vi.fn()

    render(
      <SalaRedes
        disabled={false}
        gameMode="entrenamiento"
        onResolve={onResolve}
        sourceIds={[]}
        sessionKey="redes"
      />,
    )

    for (const edge of ['BC · 1', 'AC · 2', 'DE · 2', 'EF · 3', 'BD · 5']) {
      await user.click(screen.getByRole('button', { name: edge }))
    }

    await user.click(screen.getByRole('button', { name: /validar árbol/i }))

    await user.type(screen.getByPlaceholderText(/costo mínimo/i), '14')
    await user.click(screen.getByRole('button', { name: /validar costo/i }))
    expect(screen.getByText(/costo mínimo incorrecto/i)).toBeInTheDocument()

    await user.clear(screen.getByPlaceholderText(/costo mínimo/i))
    await user.type(screen.getByPlaceholderText(/costo mínimo/i), '13')
    await user.click(screen.getByRole('button', { name: /validar costo/i }))

    await user.click(screen.getByRole('button', { name: /A -> C -> B -> D -> E -> F/i }))
    await user.click(screen.getByRole('button', { name: /validar ruta/i }))

    await user.click(screen.getByRole('button', { name: /encontrar los caminos de valor mínimo desde un origen/i }))
    await user.click(screen.getByRole('button', { name: /cerrar sala/i }))

    expect(onResolve).toHaveBeenLastCalledWith(expect.objectContaining({
      completed: true,
      roomId: 'sala-5',
      timeDeltaSeconds: 0,
    }))
  })
})
