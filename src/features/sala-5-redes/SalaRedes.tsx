import { useState } from 'react'
import { createScoreDelta } from '../../game/core/scoring'
import type { FeedbackMessage, RoomComponentProps, RoomResolution } from '../../game/core/types'
import { withinTolerance } from '../../game/utils/tolerance'
import { FormulaTooltip } from '../shared/FormulaTooltip'
import {
  createNetworkScenario,
  dijkstraTrace,
  formatPath,
  isSpanningTree,
  minimumSpanningTreeTrace,
  selectedWeight,
  verifyNetworkWithGraphlib,
} from './redesEngine'

function buildResolution(
  stepLabel: string,
  correct: boolean,
  completed: boolean,
  feedback: FeedbackMessage,
  gameMode: RoomComponentProps['gameMode'],
): RoomResolution {
  return {
    roomId: 'sala-5',
    stepLabel,
    correct,
    completed,
    feedback,
    ...createScoreDelta(correct, gameMode),
  }
}

export function SalaRedes({ disabled, gameMode, onResolve }: RoomComponentProps) {
  const [scenario] = useState(() => createNetworkScenario())
  const [stepIndex, setStepIndex] = useState(0)
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<string[]>([])
  const [answer, setAnswer] = useState('')
  const [choice, setChoice] = useState('')
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null)

  const mstTrace = minimumSpanningTreeTrace(scenario.edges, scenario.nodes)
  const mst = mstTrace.accepted
  const mstIds = new Set(mst.map((edge) => edge.id))
  const selectedEdges = scenario.edges.filter((edge) => selectedEdgeIds.includes(edge.id))
  const dijkstra = dijkstraTrace(scenario)
  const shortestPath = formatPath(dijkstra.path)
  const pathOptions = scenario.shortestPathOptions.map((path) => formatPath(path))
  const externalVerification = verifyNetworkWithGraphlib(scenario)

  const toggleEdge = (edgeId: string) => {
    if (disabled || stepIndex !== 0) {
      return
    }

    setSelectedEdgeIds((current) => (
      current.includes(edgeId)
        ? current.filter((id) => id !== edgeId)
        : [...current, edgeId]
    ))
  }

  const resolve = (correct: boolean, label: string, completed: boolean, message: FeedbackMessage) => {
    setFeedback(message)
    onResolve(buildResolution(label, correct, completed, message, gameMode))

    if (correct && !completed) {
      setStepIndex((current) => current + 1)
      setAnswer('')
      setChoice('')
    }
  }

  const validateTree = () => {
    if (disabled) {
      return
    }

    const correct = isSpanningTree(selectedEdges, scenario.nodes)
      && selectedEdges.length === mst.length
      && selectedEdges.every((edge) => mstIds.has(edge.id))

    resolve(correct, 'Árbol de expansión mínima', false, correct
      ? {
          tone: 'success',
          title: 'Árbol mínimo correcto',
          body: `Conectaste toda la red sin ciclos y con costo total ${selectedWeight(selectedEdges)}.`,
          formula: 'Kruskal: elegir la arista más barata que no forme ciclo',
          sourceId: scenario.sourceId,
          highlights: mstTrace.steps
            .filter((step) => step.accepted)
            .map((step) => `${step.edgeId} (${step.weight}) entra porque ${step.reason.toLowerCase()}`),
        }
      : {
          tone: 'danger',
          title: 'Todavía no es el árbol mínimo',
          body: 'Revisá si conectaste todos los nodos, si evitaste ciclos y si dejaste afuera una arista más barata.',
          formula: 'Un AEM tiene n-1 aristas, conecta toda la red y no admite ciclos',
          sourceId: scenario.sourceId,
          highlights: [
            `Tu costo actual es ${selectedWeight(selectedEdges)} con ${selectedEdges.length} aristas.`,
            `El árbol correcto usa ${mst.length} aristas y costo ${selectedWeight(mst)}.`,
          ],
        })
  }

  const validateCost = () => {
    const numericValue = Number(answer.replace(',', '.'))
    const correct = Number.isFinite(numericValue) && withinTolerance(numericValue, dijkstra.cost)

    resolve(correct, 'Camino de valor mínimo', false, correct
      ? {
          tone: 'success',
          title: 'Dijkstra bien aplicado',
          body: `El costo mínimo desde ${scenario.origin} hasta ${scenario.target} quedó bien identificado.`,
          formula: 'Dijkstra fija etiquetas permanentes desde el menor costo tentativo',
          sourceId: 'final-2026-redes',
          highlights: [
            `Ruta óptima: ${shortestPath}`,
            `Costo mínimo: ${dijkstra.cost}`,
          ],
        }
      : {
          tone: 'danger',
          title: 'Costo mínimo incorrecto',
          body: `El costo correcto era ${dijkstra.cost}.`,
          formula: 'Dijkstra acumula el menor costo tentativo disponible',
          sourceId: 'final-2026-redes',
          highlights: [
            `Ruta óptima: ${shortestPath}`,
            `Última etiqueta permanente de ${scenario.target}: ${dijkstra.cost}`,
          ],
        })
  }

  const validatePath = () => {
    const correct = choice === shortestPath

    resolve(correct, 'Ruta óptima', false, correct
      ? {
          tone: 'success',
          title: 'Ruta mínima cerrada',
          body: 'Bien: distinguís costo mínimo y camino mínimo, que en examen suelen evaluarse por separado.',
          formula: 'camino óptimo = secuencia que logra el costo mínimo final',
          sourceId: scenario.sourceId,
          highlights: [
            `Ruta: ${shortestPath}`,
            `Costo asociado: ${dijkstra.cost}`,
          ],
        }
      : {
          tone: 'danger',
          title: 'La ruta elegida no era la mejor',
          body: 'Podías llegar al nodo destino, pero no con el costo acumulado mínimo que fija Dijkstra.',
          formula: 'comparar caminos exige respetar el costo acumulado, no solo la cantidad de aristas',
          sourceId: scenario.sourceId,
          highlights: [
            `Ruta correcta: ${shortestPath}`,
            `Costo mínimo: ${dijkstra.cost}`,
          ],
        })
  }

  const validateTheory = () => {
    const correct = choice === 'Encontrar los caminos de valor mínimo desde un origen hacia todos los demás nodos.'

    resolve(correct, 'Definición aplicada', true, correct
      ? {
          tone: 'success',
          title: 'Definición cerrada',
          body: 'Exacto: la teoría quedó pegada al procedimiento que acabás de resolver.',
          formula: 'Dijkstra = caminos de valor mínimo desde un origen',
          sourceId: 'preguntas-teorico',
          highlights: [
            'No construye necesariamente un árbol de costo global mínimo.',
            'Sí deja etiquetas permanentes de menor costo desde el origen.',
          ],
        }
      : {
          tone: 'danger',
          title: 'La definición iba por Dijkstra',
          body: 'No busca un árbol mínimo completo ni la menor cantidad de arcos: busca caminos mínimos desde un origen.',
          formula: 'Dijkstra = caminos mínimos desde un nodo origen',
          sourceId: 'preguntas-teorico',
          highlights: [
            'Árbol mínimo y camino mínimo no son el mismo problema.',
            'Kruskal/Prim optimizan la red completa; Dijkstra optimiza rutas desde un origen.',
          ],
        })
  }

  const activeHints = [
    stepIndex === 0 && 'Elegí primero las aristas más baratas que no generen ciclo.',
    stepIndex === 1 && `Seguimiento útil: desde ${scenario.origin} la ruta mínima final termina en ${scenario.target}.`,
    stepIndex === 2 && 'Una ruta puede conectar bien, pero perder por costo acumulado.',
    stepIndex === 3 && 'La teoría buena te ayuda a no mezclar AEM con caminos mínimos.',
  ].filter(Boolean) as string[]

  return (
    <section className="room-panel">
      <header>
        <span className="eyebrow">Redes</span>
        <h2>Kruskal para conectar, Dijkstra para escapar</h2>
        <p>
          El examen suele mezclar árbol, árbol de expansión mínima y camino de valor mínimo. Acá los resolvés sobre la misma red, con validación inmediata y trazas visibles.
        </p>
      </header>

      <div className="metrics-grid">
        <article className="metric-chip">
          <strong>Nodos</strong>
          <span>{scenario.nodes.length}</span>
        </article>
        <article className="metric-chip">
          <strong>Origen / destino</strong>
          <span>
            {scenario.origin} → {scenario.target}
          </span>
        </article>
        <article className="metric-chip">
          <strong>Etapa</strong>
          <span>
            {stepIndex + 1}/4
          </span>
        </article>
      </div>

      <article className="network-stage">
        <svg className="network-canvas" viewBox="0 0 470 240" role="img" aria-label="Red ponderada">
          {scenario.edges.map((edge) => {
            const from = scenario.nodes.find((node) => node.id === edge.from)!
            const to = scenario.nodes.find((node) => node.id === edge.to)!
            const selected = selectedEdgeIds.includes(edge.id)
            const inOptimalTree = mstIds.has(edge.id)

            return (
              <g key={edge.id}>
                <line
                  stroke={selected ? 'rgba(60,255,146,0.9)' : inOptimalTree ? 'rgba(122,217,255,0.7)' : 'rgba(144,178,163,0.55)'}
                  strokeWidth={selected ? 5 : inOptimalTree ? 4 : 3}
                  x1={from.x}
                  x2={to.x}
                  y1={from.y}
                  y2={to.y}
                />
                <text fill="#ffd166" fontSize="16" x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 8}>
                  {edge.weight}
                </text>
              </g>
            )
          })}

          {scenario.nodes.map((node) => (
            <g key={node.id}>
              <circle cx={node.x} cy={node.y} fill="#04110d" r="22" stroke="rgba(122,217,255,0.8)" strokeWidth="3" />
              <text fill="#e9f6f1" fontSize="18" textAnchor="middle" x={node.x} y={node.y + 6}>
                {node.id}
              </text>
            </g>
          ))}
        </svg>

        <div className="network-toolbar">
          {scenario.edges.map((edge) => (
            <button
              key={edge.id}
              className={`edge-button ${selectedEdgeIds.includes(edge.id) ? 'selected' : ''}`}
              onClick={() => toggleEdge(edge.id)}
              type="button"
            >
              {edge.id} · {edge.weight}
            </button>
          ))}
        </div>

        <div className="chip-row">
          <span className="chip">Aristas elegidas: {selectedEdgeIds.length}</span>
          <span className="chip">Costo actual: {selectedWeight(selectedEdges)}</span>
          <span className="chip">Costo óptimo de ruta: {dijkstra.cost}</span>
          <span className="chip">
            Verificador graphlib: {externalVerification.matchesDijkstra && externalVerification.matchesMst ? 'OK' : 'revisar'}
          </span>
        </div>

        <FormulaTooltip
          title="Resumen de redes"
          formula="árbol = conecta sin ciclos · AEM = n-1 aristas con costo mínimo · Dijkstra = caminos mínimos desde un origen"
          sourceLabel="5. Modelos de redes.pdf + final del 23/02/2026"
        />
      </article>

      <div className="panel-grid">
        <article className="table-card">
          <h3>Traza de Kruskal</h3>
          <table>
            <thead>
              <tr>
                <th>Arista</th>
                <th>Peso</th>
                <th>Decisión</th>
              </tr>
            </thead>
            <tbody>
              {mstTrace.steps.map((step) => (
                <tr key={step.edgeId} className={step.accepted ? 'row-highlight' : ''}>
                  <td>{step.edgeId}</td>
                  <td>{step.weight}</td>
                  <td>{step.accepted ? 'Entra' : 'Se descarta'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="table-card">
          <h3>Etiquetas de Dijkstra</h3>
          <table>
            <thead>
              <tr>
                <th>Nodo fijo</th>
                {scenario.nodes.map((node) => (
                  <th key={node.id}>{node.id}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dijkstra.rows.map((row) => (
                <tr key={row.current}>
                  <td>{row.current}</td>
                  {scenario.nodes.map((node) => (
                    <td key={`${row.current}-${node.id}`}>
                      {Number.isFinite(row.distances[node.id]) ? row.distances[node.id] : '∞'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </div>

      <article className="question-card">
        <h3>
          {stepIndex === 0 && 'Árbol de expansión mínima'}
          {stepIndex === 1 && 'Camino de valor mínimo'}
          {stepIndex === 2 && 'Ruta óptima'}
          {stepIndex === 3 && 'Teoría aplicada'}
        </h3>

        <div className="criteria-list">
          {activeHints.map((hint) => (
            <span key={hint}>{hint}</span>
          ))}
        </div>

        {stepIndex === 0 ? (
          <>
            <p>Seleccioná las aristas correctas y validá la estructura mínima.</p>
            <div className="room-actions">
              <button className="validate-button" onClick={validateTree} type="button">
                Validar árbol
              </button>
            </div>
          </>
        ) : null}

        {stepIndex === 1 ? (
          <>
            <p>Ingresá el costo mínimo desde {scenario.origin} hasta {scenario.target} usando Dijkstra.</p>
            <div className="input-actions">
              <input
                className="answer-input"
                inputMode="decimal"
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="Costo mínimo"
                type="text"
                value={answer}
              />
              <button className="validate-button" onClick={validateCost} type="button">
                Validar costo
              </button>
            </div>
          </>
        ) : null}

        {stepIndex === 2 ? (
          <>
            <p>Elegí la ruta que efectivamente logra ese costo mínimo.</p>
            <div className="choice-grid">
              {pathOptions.map((option) => (
                <button
                  key={option}
                  className={`choice-button ${choice === option ? 'is-selected' : ''}`}
                  onClick={() => setChoice(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="room-actions">
              <button className="validate-button" onClick={validatePath} type="button">
                Validar ruta
              </button>
            </div>
          </>
        ) : null}

        {stepIndex === 3 ? (
          <>
            <p>¿Qué hace el algoritmo de Dijkstra en una red con n nodos?</p>
            <div className="choice-grid">
              {[
                'Encontrar los caminos de valor mínimo desde un origen hacia todos los demás nodos.',
                'Construir una red con n-1 ligaduras de costo total mínimo.',
                'Conectar todos los nodos con la menor cantidad posible de arcos.',
              ].map((option) => (
                <button
                  key={option}
                  className={`choice-button ${choice === option ? 'is-selected' : ''}`}
                  onClick={() => setChoice(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="room-actions">
              <button className="validate-button" onClick={validateTheory} type="button">
                Cerrar sala
              </button>
            </div>
          </>
        ) : null}

        {feedback && (
          <article className={`feedback-card ${feedback.tone}`}>
            <strong>{feedback.title}</strong>
            <p>{feedback.body}</p>
            {feedback.highlights?.length ? (
              <ul className="feedback-list">
                {feedback.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </article>
        )}
      </article>
    </section>
  )
}
