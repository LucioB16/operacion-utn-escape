import { useEffect, useState } from 'react'
import type { FeedbackMessage, RoomComponentProps, RoomResolution } from '../../game/core/types'
import { createScoreDelta } from '../../game/core/scoring'
import { FormulaTooltip } from '../shared/FormulaTooltip'
import {
  createPLScenario,
  feasibleVertices,
  getVertexByLabel,
  objectiveValue,
  verifyPLScenarioWithGlpk,
  type PLExternalVerification,
} from './plGraficaEngine'

function toResolution(roomId: RoomResolution['roomId'], stepLabel: string, correct: boolean, completed: boolean, feedback: FeedbackMessage, gameMode: RoomComponentProps['gameMode']): RoomResolution {
  return {
    roomId,
    stepLabel,
    correct,
    completed,
    feedback,
    ...createScoreDelta(correct, gameMode),
  }
}

function toCanvasX(x: number) {
  return 42 + x * 34
}

function toCanvasY(y: number) {
  return 360 - y * 34
}

export function SalaPLGrafica({ disabled, gameMode, onResolve }: RoomComponentProps) {
  const [scenario] = useState(() => createPLScenario())
  const [stepIndex, setStepIndex] = useState(0)
  const [selectedValue, setSelectedValue] = useState('')
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null)
  const [externalVerification, setExternalVerification] = useState<PLExternalVerification | null>(null)

  useEffect(() => {
    let active = true

    verifyPLScenarioWithGlpk(scenario)
      .then((verification) => {
        if (active) {
          setExternalVerification(verification)
        }
      })
      .catch(() => {
        if (active) {
          setExternalVerification(null)
        }
      })

    return () => {
      active = false
    }
  }, [scenario])

  const polygonPoints = feasibleVertices(scenario)
    .map((vertex) => `${toCanvasX(vertex.x)},${toCanvasY(vertex.y)}`)
    .join(' ')

  const stepTitle = stepIndex === 0 ? 'Elegí el vértice óptimo' : 'Cerrá con una lectura del dual'

  const handleValidate = () => {
    if (!selectedValue || disabled) {
      return
    }

    if (stepIndex === 0) {
      const chosen = getVertexByLabel(scenario, selectedValue)
      const correct = selectedValue === scenario.optimalLabel
      const optimalVertex = getVertexByLabel(scenario, scenario.optimalLabel)
      const chosenValue = chosen ? objectiveValue(chosen, scenario.objective) : 0
      const optimalValue = optimalVertex ? objectiveValue(optimalVertex, scenario.objective) : 0

      const message: FeedbackMessage = correct
        ? {
            tone: 'success',
            title: 'Vértice óptimo detectado',
            body: `${selectedValue} maximiza Z = ${scenario.objective.x}x + ${scenario.objective.y}y con valor ${optimalValue.toFixed(2)}.`,
            formula: `Z = ${scenario.objective.x}x + ${scenario.objective.y}y`,
            sourceId: 'formulacion-modelos',
            highlights: [
              scenario.optimalReason,
              `Z(${scenario.optimalLabel}) = ${optimalValue.toFixed(2)}`,
            ],
          }
        : {
            tone: 'danger',
            title: 'No era el vértice ganador',
            body: `La región factible se evalúa en los vértices. ${scenario.optimalLabel} da ${optimalValue.toFixed(2)}, mientras que ${selectedValue} deja ${chosenValue.toFixed(2)}.`,
            formula: 'Evaluar Z en cada vértice factible',
            sourceId: 'formulacion-modelos',
            highlights: [
              scenario.optimalReason,
              `Comparación directa: ${scenario.optimalLabel} = ${optimalValue.toFixed(2)} vs ${selectedValue} = ${chosenValue.toFixed(2)}`,
            ],
          }

      setFeedback(message)
      onResolve(toResolution('sala-1', 'Vértice óptimo', correct, false, message, gameMode))

      if (correct) {
        setStepIndex(1)
        setSelectedValue('')
      }

      return
    }

    const correct = selectedValue === scenario.dualAnswer
    const message: FeedbackMessage = correct
      ? {
          tone: 'success',
          title: 'Lectura dual consistente',
          body: 'Bien: en sensibilidad, la variable dual valora el recurso y mide cuánto cambia el objetivo si sumás una unidad sin cambiar la base.',
          formula: 'precio sombra = variación marginal de Z por una unidad adicional del recurso',
          sourceId: scenario.sourceId,
          highlights: [
            'El dual no produce unidades: valora recursos.',
            'Si la base no cambia, el precio sombra funciona como mejora marginal.',
          ],
        }
      : {
          tone: 'danger',
          title: 'La interpretación dual iba por otro lado',
          body: 'En el dual no estás contando restricciones ni producción física: estás valorando recursos escasos y su impacto marginal sobre Z.',
          formula: 'variable dual = valor marginal del recurso',
          sourceId: scenario.sourceId,
          highlights: [
            'Precio sombra positivo = recurso limitante con valor económico.',
            'No describe holguras ni cantidades producidas automáticamente.',
          ],
        }

    setFeedback(message)
    onResolve(toResolution('sala-1', 'Interpretación dual', correct, correct, message, gameMode))
  }

  return (
    <section className="room-panel">
      <header>
        <span className="eyebrow">Programación lineal gráfica</span>
        <h2>{scenario.title}</h2>
        <p>
          Objetivo: maximizar <span className="math-inline">Z = {scenario.objective.x}x + {scenario.objective.y}y</span>. La compuerta se abre solo si detectás la región factible y el vértice más rentable.
        </p>
      </header>

      <div className="panel-grid">
        <article className="graph-card">
          <svg className="network-canvas" viewBox="0 0 420 390" role="img" aria-label="Región factible">
            <line x1="36" y1="360" x2="380" y2="360" stroke="rgba(144,178,163,0.6)" strokeWidth="2" />
            <line x1="42" y1="20" x2="42" y2="360" stroke="rgba(144,178,163,0.6)" strokeWidth="2" />
            <polygon points={polygonPoints} fill="rgba(60,255,146,0.18)" stroke="rgba(60,255,146,0.7)" strokeWidth="3" />

            {scenario.vertices.map((vertex) => (
              <g key={vertex.label}>
                <circle cx={toCanvasX(vertex.x)} cy={toCanvasY(vertex.y)} r="7" fill="rgba(122,217,255,0.85)" />
                <text x={toCanvasX(vertex.x) + 10} y={toCanvasY(vertex.y) - 10} fill="#e9f6f1" fontSize="14">
                  {vertex.label} ({vertex.x}, {vertex.y})
                </text>
              </g>
            ))}
          </svg>

          <div className="graph-legend">
            <span className="legend-item">
              <span className="legend-swatch legend-feasible" />
              Región factible
            </span>
            <span className="legend-item">
              <span className="legend-swatch legend-vertex" />
              Vértices evaluables
            </span>
          </div>

          <div className="chip-row">
            <span className="chip">
              Verificador GLPK: {externalVerification?.matchesScenario
                ? `OK, Z = ${externalVerification.objectiveValue.toFixed(2)}`
                : 'calculando'}
            </span>
          </div>
        </article>

        <article className="table-card">
          <h3>{stepTitle}</h3>
          <p className="subtle-copy">
            Restricciones activas: {scenario.constraints.map((constraint) => constraint.label).join(' · ')}
          </p>

          <div className="choice-grid">
            {(stepIndex === 0 ? scenario.vertices.map((vertex) => ({
              value: vertex.label,
              label: `${vertex.label} -> Z = ${objectiveValue(vertex, scenario.objective).toFixed(2)}`,
            })) : scenario.dualChoices).map((choice) => (
              <button
                key={choice.value}
                className={`choice-button ${selectedValue === choice.value ? 'is-selected' : ''}`}
                onClick={() => setSelectedValue(choice.value)}
                type="button"
              >
                {choice.label}
              </button>
            ))}
          </div>

          <div className="room-actions">
            <button className="validate-button" onClick={handleValidate} type="button">
              Validar decisión
            </button>
          </div>

          <FormulaTooltip
            title="Criterio del método gráfico"
            formula="1) Identificar región factible  2) Evaluar Z en vértices  3) Elegir el mejor valor"
            sourceIds={['temas-examen', 'formulacion-modelos']}
          />

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
      </div>
    </section>
  )
}
