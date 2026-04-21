import type { GameMode, SessionSummary, StoredGameData } from './types'

const STORAGE_KEY = 'operacion-utn-escape:v1'

const defaultStoredData: StoredGameData = {
  preferredMode: 'examen',
  history: [],
}

function hasLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function loadStoredGameData(): StoredGameData {
  if (!hasLocalStorage()) {
    return defaultStoredData
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return defaultStoredData
    }

    const parsed = JSON.parse(raw) as Partial<StoredGameData>

    return {
      preferredMode: parsed.preferredMode === 'entrenamiento' ? 'entrenamiento' : 'examen',
      history: Array.isArray(parsed.history) ? parsed.history : [],
    }
  } catch {
    return defaultStoredData
  }
}

export function saveStoredGameData(data: StoredGameData) {
  if (!hasLocalStorage()) {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function updatePreferredMode(data: StoredGameData, preferredMode: GameMode): StoredGameData {
  return {
    ...data,
    preferredMode,
  }
}

export function appendSessionSummary(data: StoredGameData, summary: SessionSummary): StoredGameData {
  const history = [summary, ...data.history.filter((entry) => entry.id !== summary.id)].slice(0, 20)

  return {
    ...data,
    history,
  }
}
