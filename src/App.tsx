import { useEffect, useRef, useState } from 'react'
import type { RoomComponentProps, RoomDefinition, RoomId, RoomResolution } from './game/core/types'
import { applyRoomResolution, createInitialGameState, startGame, summarizeSession, switchGameMode } from './game/core/gameState'
import { appendSessionSummary, loadStoredGameData, saveStoredGameData, updatePreferredMode } from './game/core/storage'
import { advanceClock } from './game/core/timer'
import { sourceIndex } from './game/content/sourceMap'
import { SalaPLGrafica } from './features/sala-1-pl-grafica/SalaPLGrafica'
import { SalaSimplexSensibilidad } from './features/sala-2-simplex/SalaSimplexSensibilidad'
import { SalaInventarios } from './features/sala-3-inventarios/SalaInventarios'
import { SalaPronosticos } from './features/sala-4-pronosticos/SalaPronosticos'
import { SalaRedes } from './features/sala-5-redes/SalaRedes'
import { GameShell } from './features/shared/GameShell'

const rooms: RoomDefinition[] = [
  {
    id: 'sala-1',
    title: 'Sala 1',
    subtitle: 'Región Factible Bajo Presión',
    topic: 'Programación lineal gráfica',
    summary: 'Leé restricciones, ubicá la región factible y elegí el vértice óptimo antes de que se cierre la compuerta.',
    sources: ['temas-examen', 'preguntas-teorico', 'resumen-iop', 'formulacion-modelos', 'resolucion-problemas', 'casos-guia-iop'],
  },
  {
    id: 'sala-2',
    title: 'Sala 2',
    subtitle: 'El Escape Room del Simplex',
    topic: 'Simplex y sensibilidad',
    summary: 'Detectá la columna llave, la fila puerta, el pivot y cómo cambia Z cuando se mueve el VLD.',
    sources: ['temas-examen', 'preguntas-teorico', 'dualidad-sensibilidad', 'resolucion-problemas', 'parcial-segundo-compilado', 'final-2026-simplex'],
  },
  {
    id: 'sala-3',
    title: 'Sala 3',
    subtitle: 'Supervivencia en el Almacén',
    topic: 'Inventarios',
    summary: 'Identificá el modelo correcto, calculá Q* y justificá si tolerar ruptura tiene sentido económico.',
    sources: ['temas-examen', 'inventarios-administracion', 'inventarios-cep', 'inventarios-reab', 'inventarios-aleatorio', 'inventarios-descuento-ejemplo', 'parcial-segundo-2021', 'parcial-segundo-hechos'],
  },
  {
    id: 'sala-4',
    title: 'Sala 4',
    subtitle: 'El Oráculo de la Demanda',
    topic: 'Pronósticos',
    summary: 'Combiná promedios, suavizado, MAD y estacionalidad para salir de la niebla de demanda.',
    sources: ['temas-examen', 'resumen-iop', 'pronosticos-pdf', 'pronosticos-xlsx', 'notebooklm-guia', 'notebooklm-guia-pdf', 'final-2026-pronosticos', 'final-2026-resolucion-03', 'final-2026-resolucion-34', 'final-2026-resolucion-45'],
  },
  {
    id: 'sala-5',
    title: 'Sala 5',
    subtitle: 'Conquistador de Redes',
    topic: 'Redes',
    summary: 'Armá un árbol de expansión mínima y cerrá la ruta óptima con Dijkstra.',
    sources: ['temas-examen', 'preguntas-teorico', 'redes-modelos', 'redes-guia-parte-1', 'redes-guia-parte-2', 'redes-arbol-camino', 'redes-flujo', 'final-2026-redes'],
  },
]

const roomOrder = rooms.map((room) => room.id)

function renderRoom(roomId: RoomId, props: RoomComponentProps) {
  switch (roomId) {
    case 'sala-1':
      return <SalaPLGrafica key={`room-${roomId}-${props.sessionKey}`} {...props} />
    case 'sala-2':
      return <SalaSimplexSensibilidad key={`room-${roomId}-${props.sessionKey}`} {...props} />
    case 'sala-3':
      return <SalaInventarios key={`room-${roomId}-${props.sessionKey}`} {...props} />
    case 'sala-4':
      return <SalaPronosticos key={`room-${roomId}-${props.sessionKey}`} {...props} />
    case 'sala-5':
      return <SalaRedes key={`room-${roomId}-${props.sessionKey}`} {...props} />
    default:
      return null
  }
}

function App() {
  const [storedData, setStoredData] = useState(() => loadStoredGameData())
  const [gameState, setGameState] = useState(() => createInitialGameState(loadStoredGameData().preferredMode))
  const [runToken, setRunToken] = useState(0)
  const persistedSessionIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (gameState.phase !== 'playing') {
      return undefined
    }

    const timerId = window.setInterval(() => {
      setGameState((current) => advanceClock(current, 1))
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [gameState.phase])

  useEffect(() => {
    saveStoredGameData(storedData)
  }, [storedData])

  useEffect(() => {
    const summary = summarizeSession(gameState, rooms.length)

    if (!summary || persistedSessionIdRef.current === summary.id) {
      return
    }

    persistedSessionIdRef.current = summary.id
    setStoredData((current) => appendSessionSummary(current, summary))
  }, [gameState])

  const activeRoom = rooms[Math.min(gameState.currentRoomIndex, rooms.length - 1)]

  const handleStart = () => {
    setGameState((current) => startGame(current))
  }

  const handleRestart = () => {
    setGameState(createInitialGameState(gameState.mode))
    setRunToken((current) => current + 1)
    persistedSessionIdRef.current = null
  }

  const handleModeChange = (mode: RoomComponentProps['gameMode']) => {
    setStoredData((current) => updatePreferredMode(current, mode))
    setGameState((current) => switchGameMode(current, mode))
    setRunToken((current) => current + 1)
    persistedSessionIdRef.current = null
  }

  const handleResolve = (resolution: RoomResolution) => {
    setGameState((current) => applyRoomResolution(current, resolution, roomOrder))
  }

  return (
    <GameShell
      activeRoom={activeRoom}
      gameState={gameState}
      rooms={rooms}
      sourceIndex={sourceIndex}
      storedHistory={storedData.history}
      onModeChange={handleModeChange}
      onStart={handleStart}
      onRestart={handleRestart}
    >
      {renderRoom(activeRoom.id, {
        disabled: gameState.phase !== 'playing',
        gameMode: gameState.mode,
        onResolve: handleResolve,
        sourceIds: activeRoom.sources,
        sessionKey: `${runToken}-${activeRoom.id}`,
      })}
    </GameShell>
  )
}

export default App
