import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SalaSimplexSensibilidad } from '../features/sala-2-simplex/SalaSimplexSensibilidad'

describe('SalaSimplexSensibilidad', () => {
  it('recorre la prueba central con un error inicial y cierre completo', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const user = userEvent.setup()
    const onResolve = vi.fn()

    render(
      <SalaSimplexSensibilidad
        disabled={false}
        gameMode="entrenamiento"
        onResolve={onResolve}
        sourceIds={[]}
        sessionKey="simplex"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'x1' }))
    await user.click(screen.getByRole('button', { name: /validar paso/i }))
    expect(screen.getByText(/ajuste necesario/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'x2' }))
    await user.click(screen.getByRole('button', { name: /validar paso/i }))
    await user.click(screen.getByRole('button', { name: 'x1' }))
    await user.click(screen.getByRole('button', { name: /validar paso/i }))

    await user.type(screen.getByPlaceholderText(/escribí tu resultado/i), '20')
    await user.click(screen.getByRole('button', { name: /validar cálculo/i }))

    await user.clear(screen.getByPlaceholderText(/escribí tu resultado/i))
    await user.type(screen.getByPlaceholderText(/escribí tu resultado/i), '10')
    await user.click(screen.getByRole('button', { name: /validar cálculo/i }))

    await user.click(screen.getByRole('button', { name: /\[-10, 20\]/i }))
    await user.click(screen.getByRole('button', { name: /validar paso/i }))

    await user.clear(screen.getByPlaceholderText(/escribí tu resultado/i))
    await user.type(screen.getByPlaceholderText(/escribí tu resultado/i), '1150')
    await user.click(screen.getByRole('button', { name: /validar cálculo/i }))

    await user.click(screen.getByRole('button', { name: /no, la base cambia/i }))
    await user.click(screen.getByRole('button', { name: /validar paso/i }))

    expect(onResolve).toHaveBeenCalledTimes(8)
    expect(onResolve).toHaveBeenLastCalledWith(expect.objectContaining({
      completed: true,
      roomId: 'sala-2',
      timeDeltaSeconds: 0,
    }))
  })
})
