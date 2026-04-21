export type RoomId = 'sala-1' | 'sala-2' | 'sala-3' | 'sala-4' | 'sala-5'

export type GameMode = 'examen' | 'entrenamiento'

export type GamePhase = 'briefing' | 'playing' | 'game-over' | 'victory'

export type FeedbackTone = 'success' | 'danger' | 'info'

export interface FeedbackMessage {
  tone: FeedbackTone
  title: string
  body: string
  formula?: string
  sourceId?: string
  highlights?: string[]
}

export interface RoomResolution {
  roomId: RoomId
  stepLabel: string
  correct: boolean
  completed: boolean
  xpDelta: number
  timeDeltaSeconds: number
  feedback: FeedbackMessage
}

export interface GameEvent {
  roomId: RoomId
  stepLabel: string
  correct: boolean
  xpDelta: number
  timeDeltaSeconds: number
  feedbackTitle: string
  occurredAt: string
}

export interface GameState {
  mode: GameMode
  phase: GamePhase
  xp: number
  timeRemainingSeconds: number | null
  currentRoomIndex: number
  completedRoomIds: RoomId[]
  events: GameEvent[]
  correctAnswers: number
  incorrectAnswers: number
  startedAt: string | null
  finishedAt: string | null
  lastFeedback: FeedbackMessage | null
}

export interface SourceMapEntry {
  id: string
  label: string
  path: string
  topics: string[]
  priority: 'alta' | 'media' | 'baja'
  reason: string
  excluded?: boolean
}

export interface RoomDefinition {
  id: RoomId
  title: string
  subtitle: string
  topic: string
  summary: string
  sources: string[]
}

export interface RoomComponentProps {
  disabled: boolean
  gameMode: GameMode
  onResolve: (resolution: RoomResolution) => void
  sourceIds: string[]
  sessionKey: string
}

export interface SessionSummary {
  id: string
  finishedAt: string
  mode: GameMode
  result: Extract<GamePhase, 'victory' | 'game-over'>
  xp: number
  accuracy: number
  correctAnswers: number
  incorrectAnswers: number
  completedRooms: number
  durationSeconds: number | null
  rank: string
}

export interface StoredGameData {
  preferredMode: GameMode
  history: SessionSummary[]
}
