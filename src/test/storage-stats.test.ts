import { describe, expect, it } from 'vitest'
import { appendSessionSummary, loadStoredGameData, saveStoredGameData, updatePreferredMode } from '../game/core/storage'
import { buildHistoryStats, computeAccuracy, formatAccuracy, formatDuration } from '../game/core/stats'
import type { SessionSummary } from '../game/core/types'

function createSummary(overrides: Partial<SessionSummary> = {}): SessionSummary {
  return {
    id: 'run-1',
    finishedAt: '2026-04-20T12:00:00.000Z',
    mode: 'examen',
    result: 'victory',
    xp: 900,
    accuracy: 80,
    correctAnswers: 8,
    incorrectAnswers: 2,
    completedRooms: 5,
    durationSeconds: 600,
    rank: 'Especialista en Optimización',
    ...overrides,
  }
}

describe('storage and stats', () => {
  it('carga y guarda datos locales del navegador', () => {
    expect(loadStoredGameData()).toEqual({
      preferredMode: 'examen',
      history: [],
    })

    saveStoredGameData({
      preferredMode: 'entrenamiento',
      history: [createSummary()],
    })

    expect(loadStoredGameData().preferredMode).toBe('entrenamiento')
    expect(loadStoredGameData().history).toHaveLength(1)
  })

  it('actualiza modo preferido y deduplica historial por id', () => {
    const data = appendSessionSummary({
      preferredMode: 'examen',
      history: [createSummary({ id: 'old', xp: 400 })],
    }, createSummary({ id: 'old', xp: 950 }))

    expect(updatePreferredMode(data, 'entrenamiento').preferredMode).toBe('entrenamiento')
    expect(data.history).toHaveLength(1)
    expect(data.history[0].xp).toBe(950)
  })

  it('construye estadísticas locales y ordena el top por XP y precisión', () => {
    const history = [
      createSummary({ id: 'a', xp: 700, accuracy: 70, result: 'game-over' }),
      createSummary({ id: 'b', xp: 950, accuracy: 78 }),
      createSummary({ id: 'c', xp: 950, accuracy: 88 }),
    ]

    const stats = buildHistoryStats(history)

    expect(stats.totalRuns).toBe(3)
    expect(stats.victories).toBe(2)
    expect(stats.bestXp).toBe(950)
    expect(stats.averageAccuracy).toBe(79)
    expect(stats.topRuns[0].id).toBe('c')
  })

  it('formatea precisión y duración', () => {
    expect(computeAccuracy(3, 1)).toBe(75)
    expect(formatAccuracy(75)).toBe('75%')
    expect(formatDuration(90)).toBe('01:30')
    expect(formatDuration(null)).toBe('Libre')
  })
})
