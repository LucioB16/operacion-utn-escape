import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createInitialGameState } from '../game/core/gameState'
import { sourceIndex } from '../game/content/sourceMap'
import { GameShell } from '../features/shared/GameShell'
import type { RoomDefinition, SessionSummary } from '../game/core/types'

const rooms: RoomDefinition[] = [
  {
    id: 'sala-1',
    title: 'Sala 1',
    subtitle: 'Región Factible Bajo Presión',
    topic: 'Programación lineal gráfica',
    summary: 'Resumen de sala',
    sources: ['temas-examen'],
  },
]

function createSummary(overrides: Partial<SessionSummary> = {}): SessionSummary {
  return {
    id: 'run-1',
    finishedAt: '2026-04-20T12:00:00.000Z',
    mode: 'examen',
    result: 'victory',
    xp: 1200,
    accuracy: 90,
    correctAnswers: 9,
    incorrectAnswers: 1,
    completedRooms: 5,
    durationSeconds: 600,
    rank: 'Especialista en Optimización',
    ...overrides,
  }
}

describe('GameShell', () => {
  it('muestra briefing, ranking local y permite cambiar el modo', async () => {
    const user = userEvent.setup()
    const onModeChange = vi.fn()

    render(
      <GameShell
        activeRoom={rooms[0]}
        gameState={createInitialGameState('examen')}
        rooms={rooms}
        sourceIndex={sourceIndex}
        storedHistory={[createSummary()]}
        onModeChange={onModeChange}
        onStart={vi.fn()}
        onRestart={vi.fn()}
      >
        <div>Contenido</div>
      </GameShell>,
    )

    expect(screen.getByText('Briefing operativo')).toBeInTheDocument()
    expect(screen.getByText(/ranking local/i)).toBeInTheDocument()
    expect(screen.getByText(/1200 XP/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /modo entrenamiento/i }))
    expect(onModeChange).toHaveBeenCalledWith('entrenamiento')
  })

  it('muestra la pantalla de victoria con botón de reinicio', () => {
    render(
      <GameShell
        activeRoom={rooms[0]}
        gameState={{
          ...createInitialGameState('examen'),
          phase: 'victory',
          xp: 1350,
          completedRoomIds: ['sala-1'],
          finishedAt: '2026-04-20T13:00:00.000Z',
        }}
        rooms={rooms}
        sourceIndex={sourceIndex}
        storedHistory={[]}
        onModeChange={vi.fn()}
        onStart={vi.fn()}
        onRestart={vi.fn()}
      >
        <div>Contenido</div>
      </GameShell>,
    )

    expect(screen.getByText('Escape completado')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /jugar otra vuelta/i })).toBeInTheDocument()
  })

  it('muestra game over cuando el tiempo se agotó', () => {
    render(
      <GameShell
        activeRoom={rooms[0]}
        gameState={{
          ...createInitialGameState('examen'),
          phase: 'game-over',
          timeRemainingSeconds: 0,
          finishedAt: '2026-04-20T13:10:00.000Z',
        }}
        rooms={rooms}
        sourceIndex={sourceIndex}
        storedHistory={[]}
        onModeChange={vi.fn()}
        onStart={vi.fn()}
        onRestart={vi.fn()}
      >
        <div>Contenido</div>
      </GameShell>,
    )

    expect(screen.getByText('Tiempo agotado')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reintentar misión/i })).toBeInTheDocument()
  })

  it('renderiza el contenido jugable y el ultimo feedback cuando la fase esta en playing', () => {
    render(
      <GameShell
        activeRoom={rooms[0]}
        gameState={{
          ...createInitialGameState('examen'),
          phase: 'playing',
          events: [
            {
              roomId: 'sala-1',
              occurredAt: '2026-04-20T13:11:00.000Z',
              stepLabel: 'Iteracion 1',
              feedbackTitle: 'Pivot correcto',
              correct: true,
              xpDelta: 100,
              timeDeltaSeconds: 30,
            },
          ],
          lastFeedback: {
            tone: 'success',
            title: 'Buen avance',
            body: 'Elegiste bien la variable que entra.',
            highlights: ['Cj - Zj maximo', 'theta valido'],
          },
        }}
        rooms={rooms}
        sourceIndex={sourceIndex}
        storedHistory={[]}
        onModeChange={vi.fn()}
        onStart={vi.fn()}
        onRestart={vi.fn()}
      >
        <div>Contenido en juego</div>
      </GameShell>,
    )

    expect(screen.getByText('Contenido en juego')).toBeInTheDocument()
    expect(screen.getByText('Buen avance')).toBeInTheDocument()
    expect(screen.getByText('Cj - Zj maximo')).toBeInTheDocument()
  })

  it('muestra links de Drive para fuentes con multiples documentos', () => {
    const roomWithExcludedSource: RoomDefinition = {
      id: 'sala-1',
      title: 'Sala 1',
      subtitle: 'Fuente multiple',
      topic: 'Validacion de links',
      summary: 'Resumen',
      sources: ['excluidos-cpm-pert'],
    }

    render(
      <GameShell
        activeRoom={roomWithExcludedSource}
        gameState={createInitialGameState('examen')}
        rooms={[roomWithExcludedSource]}
        sourceIndex={sourceIndex}
        storedHistory={[]}
        onModeChange={vi.fn()}
        onStart={vi.fn()}
        onRestart={vi.fn()}
      >
        <div>Contenido</div>
      </GameShell>,
    )

    const cpmLinks = screen.getAllByRole('link', { name: /cpm\.pdf/i })
    const pertLinks = screen.getAllByRole('link', { name: /pert\.pdf/i })

    expect(cpmLinks.length).toBeGreaterThan(0)
    expect(pertLinks.length).toBeGreaterThan(0)
  })
})
