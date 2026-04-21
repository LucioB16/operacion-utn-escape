import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SalaInventarios } from '../features/sala-3-inventarios/SalaInventarios'
import { optimalLotSize, optimalTotalCost } from '../features/sala-3-inventarios/inventariosEngine'

describe('SalaInventarios', () => {
  it('guía clasificación, cálculo, aleatoria y descuento por cantidad', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)

    const lot = optimalLotSize({
      model: 'sin-ruptura',
      prompt: '',
      demand: 1800,
      orderCost: 2200,
      holdingCost: 9,
      sourceId: 'inventarios-cep',
    })
    const totalCost = optimalTotalCost({
      model: 'sin-ruptura',
      prompt: '',
      demand: 1800,
      orderCost: 2200,
      holdingCost: 9,
      sourceId: 'inventarios-cep',
    })

    const user = userEvent.setup()
    const onResolve = vi.fn()

    render(
      <SalaInventarios
        disabled={false}
        gameMode="entrenamiento"
        onResolve={onResolve}
        sourceIds={[]}
        sessionKey="inventarios"
      />,
    )

    await user.click(screen.getByRole('button', { name: /cep sin ruptura/i }))
    await user.click(screen.getByRole('button', { name: /validar respuesta/i }))

    await user.type(screen.getByPlaceholderText(/escribí el valor/i), String(lot))
    await user.click(screen.getByRole('button', { name: /validar respuesta/i }))

    await user.clear(screen.getByPlaceholderText(/escribí el valor/i))
    await user.type(screen.getByPlaceholderText(/escribí el valor/i), String(totalCost))
    await user.click(screen.getByRole('button', { name: /validar respuesta/i }))

    await user.click(screen.getByRole('button', { name: /conviene analizar ruptura/i }))
    await user.click(screen.getByRole('button', { name: /validar respuesta/i }))

    await user.clear(screen.getByPlaceholderText(/escribí el valor/i))
    await user.type(screen.getByPlaceholderText(/escribí el valor/i), '244.32')
    await user.click(screen.getByRole('button', { name: /validar respuesta/i }))

    await user.click(screen.getByRole('button', { name: /desde 700 u\. \(c=42\)/i }))
    await user.click(screen.getByRole('button', { name: /validar respuesta/i }))

    expect(onResolve).toHaveBeenLastCalledWith(expect.objectContaining({
      completed: true,
      roomId: 'sala-3',
      timeDeltaSeconds: 0,
    }))
  })
})
