import { computeAccuracy } from './stats'
import { createScoreDelta } from './scoring'
import { INITIAL_TIME_SECONDS, applyTimerDelta } from './timer'
import type { GameEvent, GameMode, GameState, RoomId, RoomResolution, SessionSummary } from './types'

export function createInitialGameState(mode: GameMode = 'examen'): GameState {
  return {
    mode,
    phase: 'briefing',
    xp: 0,
    timeRemainingSeconds: mode === 'examen' ? INITIAL_TIME_SECONDS : null,
    currentRoomIndex: 0,
    completedRoomIds: [],
    events: [],
    correctAnswers: 0,
    incorrectAnswers: 0,
    startedAt: null,
    finishedAt: null,
    lastFeedback: null,
  }
}

export function startGame(state: GameState): GameState {
  if (state.phase !== 'briefing') {
    return state
  }

  return {
    ...state,
    phase: 'playing',
    startedAt: state.startedAt ?? new Date().toISOString(),
  }
}

export function switchGameMode(state: GameState, mode: GameMode) {
  if (state.phase !== 'briefing') {
    return state
  }

  return createInitialGameState(mode)
}

export function getRankFromXp(xp: number) {
  if (xp >= 1300) {
    return 'Arquitecto de la Cátedra'
  }

  if (xp >= 900) {
    return 'Especialista en Optimización'
  }

  if (xp >= 500) {
    return 'Practicante con Sangre Fría'
  }

  return 'Recursante en Modo Turbo'
}

function buildEvent(resolution: RoomResolution): GameEvent {
  return {
    roomId: resolution.roomId,
    stepLabel: resolution.stepLabel,
    correct: resolution.correct,
    xpDelta: resolution.xpDelta,
    timeDeltaSeconds: resolution.timeDeltaSeconds,
    feedbackTitle: resolution.feedback.title,
    occurredAt: new Date().toISOString(),
  }
}

export function applyRoomResolution(state: GameState, resolution: RoomResolution, roomOrder: RoomId[]) {
  if (state.phase !== 'playing') {
    return state
  }

  const fallbackScore = createScoreDelta(resolution.correct, state.mode)
  const xp = state.xp + (resolution.xpDelta ?? fallbackScore.xpDelta)
  const timeRemainingSeconds = applyTimerDelta(
    state.timeRemainingSeconds,
    resolution.timeDeltaSeconds ?? fallbackScore.timeDeltaSeconds,
  )

  const completedRoomIds = resolution.completed && !state.completedRoomIds.includes(resolution.roomId)
    ? [...state.completedRoomIds, resolution.roomId]
    : state.completedRoomIds

  const currentRoomIndex = resolution.completed
    ? Math.min(state.currentRoomIndex + 1, roomOrder.length - 1)
    : state.currentRoomIndex

  let phase: GameState['phase'] = state.phase

  if (timeRemainingSeconds === 0) {
    phase = 'game-over'
  } else if (completedRoomIds.length === roomOrder.length) {
    phase = 'victory'
  }

  const correctAnswers = state.correctAnswers + (resolution.correct ? 1 : 0)
  const incorrectAnswers = state.incorrectAnswers + (resolution.correct ? 0 : 1)
  const finishedAt = phase === 'victory' || phase === 'game-over' ? new Date().toISOString() : state.finishedAt

  return {
    ...state,
    xp,
    timeRemainingSeconds,
    currentRoomIndex,
    completedRoomIds,
    phase,
    correctAnswers,
    incorrectAnswers,
    finishedAt,
    lastFeedback: resolution.feedback,
    events: [buildEvent(resolution), ...state.events].slice(0, 10),
  }
}

export function summarizeSession(state: GameState, totalRooms: number): SessionSummary | null {
  if ((state.phase !== 'victory' && state.phase !== 'game-over') || !state.finishedAt) {
    return null
  }

  const accuracy = computeAccuracy(state.correctAnswers, state.incorrectAnswers)
  const durationSeconds = state.mode === 'examen'
    ? INITIAL_TIME_SECONDS - (state.timeRemainingSeconds ?? INITIAL_TIME_SECONDS)
    : null

  return {
    id: state.finishedAt,
    finishedAt: state.finishedAt,
    mode: state.mode,
    result: state.phase,
    xp: state.xp,
    accuracy,
    correctAnswers: state.correctAnswers,
    incorrectAnswers: state.incorrectAnswers,
    completedRooms: Math.min(state.completedRoomIds.length, totalRooms),
    durationSeconds,
    rank: getRankFromXp(state.xp),
  }
}
