import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from '../App'
import { loadStoredGameData } from '../game/core/storage'

describe('App', () => {
  it('permite cambiar a entrenamiento, persistirlo y arrancar la sala activa', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: /modo entrenamiento/i }))

    await waitFor(() => {
      expect(loadStoredGameData().preferredMode).toBe('entrenamiento')
    })

    await user.click(screen.getByRole('button', { name: /iniciar infiltración/i }))

    expect(screen.getByText('Laboratorio de mezclas')).toBeInTheDocument()
    expect(screen.getByText('Libre')).toBeInTheDocument()
  })
})
