import { describe, expect, it, vi } from 'vitest'
import { advanceClock, applyTimerDelta, formatTime } from '../game/core/timer'
import { createInitialGameState, startGame } from '../game/core/gameState'

describe('timer', () => {
  it('formatea tiempo y maneja modo libre', () => {
    expect(formatTime(65)).toBe('01:05')
    expect(formatTime(null)).toBe('Libre')
  })

  it('aplica deltas con clamp y respeta null', () => {
    expect(applyTimerDelta(10, -30)).toBe(0)
    expect(applyTimerDelta(10, 15)).toBe(25)
    expect(applyTimerDelta(null, -30)).toBeNull()
  })

  it('no avanza el reloj en modo entrenamiento', () => {
    const training = {
      ...startGame(createInitialGameState('entrenamiento')),
      timeRemainingSeconds: null,
    }

    expect(advanceClock(training, 10)).toEqual(training)
  })

  it('corta la partida al agotarse el tiempo en modo examen', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-20T15:00:00.000Z'))

    const state = {
      ...startGame(createInitialGameState('examen')),
      timeRemainingSeconds: 5,
    }

    const next = advanceClock(state, 10)

    expect(next.phase).toBe('game-over')
    expect(next.timeRemainingSeconds).toBe(0)
    expect(next.finishedAt).toBe('2026-04-20T15:00:00.000Z')
  })
})
