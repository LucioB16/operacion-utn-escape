import { formatTime } from './timer'
import type { SessionSummary } from './types'

export function computeAccuracy(correctAnswers: number, incorrectAnswers: number) {
  const total = correctAnswers + incorrectAnswers

  if (total === 0) {
    return 0
  }

  return Math.round((correctAnswers / total) * 100)
}

export function formatAccuracy(accuracy: number) {
  return `${accuracy}%`
}

export function formatDuration(durationSeconds: number | null) {
  if (durationSeconds === null) {
    return 'Libre'
  }

  return formatTime(durationSeconds)
}

export function buildHistoryStats(history: SessionSummary[]) {
  if (history.length === 0) {
    return {
      totalRuns: 0,
      victories: 0,
      bestXp: 0,
      averageAccuracy: 0,
      topRuns: [] as SessionSummary[],
    }
  }

  const totalRuns = history.length
  const victories = history.filter((entry) => entry.result === 'victory').length
  const bestXp = Math.max(...history.map((entry) => entry.xp))
  const averageAccuracy = Math.round(history.reduce((total, entry) => total + entry.accuracy, 0) / totalRuns)
  const topRuns = [...history]
    .sort((left, right) => {
      if (right.xp !== left.xp) {
        return right.xp - left.xp
      }

      return right.accuracy - left.accuracy
    })
    .slice(0, 5)

  return {
    totalRuns,
    victories,
    bestXp,
    averageAccuracy,
    topRuns,
  }
}
