import type { ReactNode } from 'react'
import { getRankFromXp } from '../../game/core/gameState'
import { buildHistoryStats, computeAccuracy, formatAccuracy, formatDuration } from '../../game/core/stats'
import { formatTime, INITIAL_TIME_SECONDS } from '../../game/core/timer'
import type { GameMode, GameState, RoomDefinition, SessionSummary, SourceMapEntry } from '../../game/core/types'

interface GameShellProps {
  activeRoom: RoomDefinition
  gameState: GameState
  rooms: RoomDefinition[]
  sourceIndex: Record<string, SourceMapEntry>
  storedHistory: SessionSummary[]
  onModeChange: (mode: GameMode) => void
  onStart: () => void
  onRestart: () => void
  children: ReactNode
}

function buildStatusCopy(gameState: GameState) {
  if (gameState.phase === 'victory') {
    return {
      title: 'Escape completado',
      description: `Saliste con ${gameState.xp} XP y rango ${getRankFromXp(gameState.xp)}.`,
      cta: 'Jugar otra vuelta',
    }
  }

  if (gameState.phase === 'game-over') {
    return {
      title: 'Tiempo agotado',
      description: 'Te quedaste sin margen. Reiniciá la corrida y priorizá las respuestas más seguras.',
      cta: 'Reintentar misión',
    }
  }

  return {
    title: 'Briefing operativo',
    description: gameState.mode === 'examen'
      ? 'Tenés 15 minutos, cinco salas secuenciales y penalizaciones reales. La teoría aparece solo cuando mejora tu velocidad resolutiva.'
      : 'Entrenamiento libre, sin cronómetro, para practicar procesos y feedback paso a paso antes de rendir.',
    cta: 'Iniciar infiltración',
  }
}

export function GameShell({
  activeRoom,
  gameState,
  rooms,
  sourceIndex,
  storedHistory,
  onModeChange,
  onStart,
  onRestart,
  children,
}: GameShellProps) {
  const statusCopy = buildStatusCopy(gameState)
  const activeSources = activeRoom.sources.map((sourceId) => sourceIndex[sourceId]).filter(Boolean)
  const corpusSources = Object.values(sourceIndex).filter((source) => !source.excluded)
  const excludedSources = Object.values(sourceIndex).filter((source) => source.excluded)
  const completionRatio = `${gameState.completedRoomIds.length}/${rooms.length}`
  const historyStats = buildHistoryStats(storedHistory)
  const currentAccuracy = computeAccuracy(gameState.correctAnswers, gameState.incorrectAnswers)

  return (
    <main className={`app-shell phase-${gameState.phase} mode-${gameState.mode}`}>
      <header className="shell-header">
        <div>
          <p className="eyebrow">Operación UTN</p>
          <h1>El Escape de la Incertidumbre</h1>
          <p className="hero-copy">
            Entrenador práctico finalista para Investigación Operativa. Todo el contenido se apoya primero en el corpus local relevado.
          </p>
        </div>

        <div className="hero-stats">
          <article className="stat-card">
            <span>Tiempo</span>
            <strong>{formatTime(gameState.timeRemainingSeconds)}</strong>
            <small>{gameState.mode === 'examen' ? `Inicio en ${formatTime(INITIAL_TIME_SECONDS)}` : 'Modo libre sin cronómetro'}</small>
          </article>
          <article className="stat-card">
            <span>XP</span>
            <strong>{gameState.xp}</strong>
            <small>Rango: {getRankFromXp(gameState.xp)}</small>
          </article>
          <article className="stat-card">
            <span>{gameState.phase === 'playing' ? 'Precisión' : 'Salas'}</span>
            <strong>{gameState.phase === 'playing' ? formatAccuracy(currentAccuracy) : completionRatio}</strong>
            <small>{gameState.phase === 'playing' ? activeRoom.subtitle : activeRoom.topic}</small>
          </article>
        </div>
      </header>

      <section className="shell-grid">
        <aside className="sidebar-card">
          <h2>Ruta de salas</h2>
          <ol className="room-list">
            {rooms.map((room, index) => {
              const completed = gameState.completedRoomIds.includes(room.id)
              const active = room.id === activeRoom.id

              return (
                <li key={room.id} className={`room-pill ${completed ? 'is-complete' : ''} ${active ? 'is-active' : ''}`}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{room.subtitle}</strong>
                    <small>{room.topic}</small>
                  </div>
                </li>
              )
            })}
          </ol>

          <h2>Corpus activo</h2>
          <div className="source-list">
            {activeSources.map((source) => (
              <article key={source.id} className="source-card">
                <span className={`priority-tag priority-${source.priority}`}>{source.priority}</span>
                <strong>
                  <a className="source-link" href={source.driveLinks[0]?.url} rel="noreferrer" target="_blank">
                    {source.label}
                  </a>
                </strong>
                <small>{source.path}</small>
                {source.driveLinks.length > 1 ? (
                  <small>
                    Drive:
                    {' '}
                    {source.driveLinks.map((link, index) => (
                      <span key={link.url}>
                        <a className="source-link" href={link.url} rel="noreferrer" target="_blank">{link.label}</a>
                        {index < source.driveLinks.length - 1 ? ' · ' : null}
                      </span>
                    ))}
                  </small>
                ) : null}
                <p>{source.reason}</p>
              </article>
            ))}
          </div>

          <h2>Temas excluidos</h2>
          {excludedSources.map((source) => (
            <article key={source.id} className="source-card source-card--excluded">
              <strong>
                {source.driveLinks.map((link, index) => (
                  <span key={link.url}>
                    <a className="source-link" href={link.url} rel="noreferrer" target="_blank">{link.label}</a>
                    {index < source.driveLinks.length - 1 ? ' · ' : null}
                  </span>
                ))}
              </strong>
              <p>{source.reason}</p>
            </article>
          ))}

          <h2>Corpus completo relevado</h2>
          <details className="corpus-summary">
            <summary>{corpusSources.length} fuentes accesibles en Drive</summary>
            <div className="source-list">
              {corpusSources.map((source) => (
                <article key={`catalog-${source.id}`} className="source-card">
                  <strong>
                    <a className="source-link" href={source.driveLinks[0]?.url} rel="noreferrer" target="_blank">
                      {source.label}
                    </a>
                  </strong>
                  <small>{source.path}</small>
                </article>
              ))}
            </div>
          </details>
        </aside>

        <section className="playfield-card">
          <div className="mission-card">
            <span className="eyebrow">Sala activa</span>
            <h2>{activeRoom.subtitle}</h2>
            <p>{activeRoom.summary}</p>
            <div className="mode-switch">
              <button
                className={`ghost-button ${gameState.mode === 'examen' ? 'is-active' : ''}`}
                disabled={gameState.phase !== 'briefing'}
                onClick={() => onModeChange('examen')}
                type="button"
              >
                Modo examen
              </button>
              <button
                className={`ghost-button ${gameState.mode === 'entrenamiento' ? 'is-active' : ''}`}
                disabled={gameState.phase !== 'briefing'}
                onClick={() => onModeChange('entrenamiento')}
                type="button"
              >
                Modo entrenamiento
              </button>
            </div>
          </div>

          {gameState.phase === 'playing' ? (
            children
          ) : (
            <section className={`status-screen status-screen--${gameState.phase}`}>
              <h2>{statusCopy.title}</h2>
              <p>{statusCopy.description}</p>
              <div className="status-actions">
                {gameState.phase === 'briefing' ? (
                  <button className="primary-button" onClick={onStart} type="button">
                    {statusCopy.cta}
                  </button>
                ) : (
                  <button className="primary-button" onClick={onRestart} type="button">
                    {statusCopy.cta}
                  </button>
                )}
              </div>
              <div className="status-hints">
                <span>Correcta: +100 XP / +30 s</span>
                <span>{gameState.mode === 'examen' ? 'Incorrecta: -50 XP / -60 s' : 'Incorrecta: -50 XP / sin castigo de tiempo'}</span>
                <span>{gameState.mode === 'examen' ? 'La Sala 2 es la prueba central del prototipo.' : 'Modo libre para practicar sin reloj.'}</span>
              </div>
            </section>
          )}
        </section>

        <aside className="sidebar-card">
          <h2>Ranking local</h2>
          <div className="event-list">
            {historyStats.topRuns.length === 0 ? (
              <p className="muted">Todavía no hay partidas guardadas en este navegador.</p>
            ) : (
              historyStats.topRuns.map((entry, index) => (
                <article key={entry.id} className="event-card ok">
                  <strong>#{index + 1} · {entry.rank}</strong>
                  <small>{entry.mode === 'examen' ? 'Examen' : 'Entrenamiento'} · {entry.result === 'victory' ? 'Victoria' : 'Corte por tiempo'}</small>
                  <p>{entry.xp} XP · {formatAccuracy(entry.accuracy)} · {formatDuration(entry.durationSeconds)}</p>
                </article>
              ))
            )}
          </div>

          <h2>Estadísticas locales</h2>
          <div className="criteria-list">
            <span>Partidas: {historyStats.totalRuns}</span>
            <span>Victorias: {historyStats.victories}</span>
            <span>Mejor XP: {historyStats.bestXp}</span>
            <span>Precisión media: {formatAccuracy(historyStats.averageAccuracy)}</span>
          </div>

          <h2>Bitácora reciente</h2>
          <div className="event-list">
            {gameState.events.length === 0 ? (
              <p className="muted">
                Todavía no hay intentos registrados. Cuando empieces, cada decisión va a impactar la XP y, en modo examen, también el cronómetro.
              </p>
            ) : (
              gameState.events.map((event) => (
                <article key={`${event.occurredAt}-${event.stepLabel}`} className={`event-card ${event.correct ? 'ok' : 'ko'}`}>
                  <strong>{event.feedbackTitle}</strong>
                  <small>{event.stepLabel}</small>
                  <p>
                    {event.correct ? '+' : ''}
                    {event.xpDelta} XP · {event.timeDeltaSeconds > 0 ? '+' : ''}
                    {event.timeDeltaSeconds}s
                  </p>
                </article>
              ))
            )}
          </div>

          {gameState.lastFeedback ? (
            <>
              <h2>Último feedback</h2>
              <article className={`feedback-card ${gameState.lastFeedback.tone}`}>
                <strong>{gameState.lastFeedback.title}</strong>
                <p>{gameState.lastFeedback.body}</p>
                {gameState.lastFeedback.highlights?.length ? (
                  <ul className="feedback-list">
                    {gameState.lastFeedback.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            </>
          ) : null}

          <h2>Criterio de diseño</h2>
          <div className="criteria-list">
            <span>80% práctica / 20% teoría aplicada</span>
            <span>Lógica matemática desacoplada de la UI</span>
            <span>Persistencia solo local en el browser</span>
            <span>Sin CPM, PERT, transporte ni transbordo</span>
          </div>
        </aside>
      </section>
    </main>
  )
}
