import type { GameMode } from './types'

export const CORRECT_XP = 100
export const INCORRECT_XP = -50
export const CORRECT_TIME_DELTA_SECONDS = 30
export const INCORRECT_TIME_DELTA_SECONDS = -60

export function createScoreDelta(correct: boolean, mode: GameMode = 'examen') {
  return {
    xpDelta: correct ? CORRECT_XP : INCORRECT_XP,
    timeDeltaSeconds: mode === 'examen'
      ? (correct ? CORRECT_TIME_DELTA_SECONDS : INCORRECT_TIME_DELTA_SECONDS)
      : 0,
  }
}
