import type { GameState } from './types'

export const INITIAL_TIME_SECONDS = 15 * 60

export function clampTime(seconds: number) {
  return Math.max(0, Math.round(seconds))
}

export function applyTimerDelta(currentSeconds: number | null, deltaSeconds: number) {
  if (currentSeconds === null) {
    return null
  }

  return clampTime(currentSeconds + deltaSeconds)
}

export function formatTime(totalSeconds: number | null) {
  if (totalSeconds === null) {
    return 'Libre'
  }

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function advanceClock(state: GameState, elapsedSeconds: number) {
  if (state.phase !== 'playing' || state.mode === 'entrenamiento') {
    return state
  }

  const timeRemainingSeconds = applyTimerDelta(state.timeRemainingSeconds, -elapsedSeconds)
  const phase: GameState['phase'] = timeRemainingSeconds === 0 ? 'game-over' : state.phase

  return {
    ...state,
    timeRemainingSeconds,
    phase,
    finishedAt: timeRemainingSeconds === 0 ? new Date().toISOString() : state.finishedAt,
  }
}
