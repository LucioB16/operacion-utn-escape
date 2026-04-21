import { describe, expect, it, vi } from 'vitest'
import { applyRoomResolution, createInitialGameState, startGame, summarizeSession, switchGameMode } from '../game/core/gameState'
import type { RoomId, RoomResolution } from '../game/core/types'

const roomOrder: RoomId[] = ['sala-1', 'sala-2', 'sala-3', 'sala-4', 'sala-5']

function createResolution(overrides: Partial<RoomResolution> = {}): RoomResolution {
  return {
    roomId: 'sala-1',
    stepLabel: 'Paso',
    correct: true,
    completed: false,
    xpDelta: 100,
    timeDeltaSeconds: 30,
    feedback: {
      tone: 'success',
      title: 'Paso correcto',
      body: 'Resolución válida',
    },
    ...overrides,
  }
}

describe('gameState', () => {
  it('crea estado inicial según el modo', () => {
    expect(createInitialGameState('examen').timeRemainingSeconds).toBe(900)
    expect(createInitialGameState('entrenamiento').timeRemainingSeconds).toBeNull()
  })

  it('cambia de modo solo en briefing', () => {
    const briefing = createInitialGameState('examen')
    const switched = switchGameMode(briefing, 'entrenamiento')
    expect(switched.mode).toBe('entrenamiento')

    const playing = startGame(briefing)
    expect(switchGameMode(playing, 'entrenamiento')).toBe(playing)
  })

  it('inicia la partida y fija startedAt', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-20T12:00:00.000Z'))

    const started = startGame(createInitialGameState())

    expect(started.phase).toBe('playing')
    expect(started.startedAt).toBe('2026-04-20T12:00:00.000Z')
  })

  it('aplica una resolución correcta y cierra la victoria al completar la última sala', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-20T12:30:00.000Z'))

    const state = {
      ...startGame(createInitialGameState()),
      currentRoomIndex: 4,
      completedRoomIds: ['sala-1', 'sala-2', 'sala-3', 'sala-4'] as RoomId[],
    }

    const next = applyRoomResolution(state, createResolution({
      roomId: 'sala-5',
      completed: true,
    }), roomOrder)

    expect(next.phase).toBe('victory')
    expect(next.completedRoomIds).toEqual(roomOrder)
    expect(next.correctAnswers).toBe(1)
    expect(next.lastFeedback?.title).toBe('Paso correcto')
    expect(next.finishedAt).toBe('2026-04-20T12:30:00.000Z')
  })

  it('marca game over cuando una mala respuesta deja el reloj en cero', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-20T13:00:00.000Z'))

    const state = {
      ...startGame(createInitialGameState()),
      timeRemainingSeconds: 20,
    }

    const next = applyRoomResolution(state, createResolution({
      correct: false,
      xpDelta: -50,
      timeDeltaSeconds: -60,
      feedback: {
        tone: 'danger',
        title: 'Error',
        body: 'Cálculo incorrecto',
      },
    }), roomOrder)

    expect(next.phase).toBe('game-over')
    expect(next.timeRemainingSeconds).toBe(0)
    expect(next.incorrectAnswers).toBe(1)
    expect(next.finishedAt).toBe('2026-04-20T13:00:00.000Z')
  })

  it('resume una sesión finalizada con métricas locales', () => {
    const summary = summarizeSession({
      ...createInitialGameState('examen'),
      phase: 'victory',
      xp: 950,
      correctAnswers: 8,
      incorrectAnswers: 2,
      completedRoomIds: roomOrder,
      timeRemainingSeconds: 780,
      finishedAt: '2026-04-20T14:00:00.000Z',
    }, roomOrder.length)

    expect(summary).not.toBeNull()
    expect(summary?.durationSeconds).toBe(120)
    expect(summary?.accuracy).toBe(80)
    expect(summary?.rank).toBe('Especialista en Optimización')
  })
})
