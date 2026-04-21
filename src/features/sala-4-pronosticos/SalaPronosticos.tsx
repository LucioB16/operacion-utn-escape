import { useState } from 'react'
import { createScoreDelta } from '../../game/core/scoring'
import type { FeedbackMessage, RoomComponentProps, RoomResolution } from '../../game/core/types'
import { withinTolerance } from '../../game/utils/tolerance'
import { FormulaTooltip } from '../shared/FormulaTooltip'
import {
  createForecastBundle,
  exponentialSmoothingNext,
  exponentialSmoothingTrace,
  movingAverageErrorTable,
  movingAverageForecast,
  movingAverageMAD,
  pessimisticDemandScenario,
  seasonalIndexRows,
  strongestSeason,
  weightedMovingAverage,
  weightedMovingAverageBreakdown,
} from './pronosticosEngine'

function buildResolution(
  stepLabel: string,
  correct: boolean,
  completed: boolean,
  feedback: FeedbackMessage,
  gameMode: RoomComponentProps['gameMode'],
): RoomResolution {
  return {
    roomId: 'sala-4',
    stepLabel,
    correct,
    completed,
    feedback,
    ...createScoreDelta(correct, gameMode),
  }
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

export function SalaPronosticos({ disabled, gameMode, onResolve }: RoomComponentProps) {
  const [bundle] = useState(() => createForecastBundle())
  const [stepIndex, setStepIndex] = useState(0)
  const [choice, setChoice] = useState('')
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null)

  const weighted = weightedMovingAverage(bundle.weightedSeries, bundle.weights)
  const weightedRows = weightedMovingAverageBreakdown(bundle.weightedSeries, bundle.weights)
  const smoothingTrace = exponentialSmoothingTrace(bundle.smoothingSeries, bundle.alpha, bundle.initialForecast)
  const smoothed = exponentialSmoothingNext(bundle.smoothingSeries, bundle.alpha, bundle.initialForecast)
  const moving = movingAverageForecast(bundle.movingAverageSeries, bundle.movingWindow)
  const errorRows = movingAverageErrorTable(bundle.movingAverageSeries, bundle.movingWindow)
  const mad = movingAverageMAD(bundle.movingAverageSeries, bundle.movingWindow)
  const pessimistic = pessimisticDemandScenario(moving, mad)
  const seasonalRows = seasonalIndexRows(bundle.seasonalMatrix)
  const dominantSeason = strongestSeason(bundle.seasonalMatrix)

  const steps = [
    {
      kind: 'number' as const,
      label: 'Promedio móvil ponderado',
      prompt: `Con pesos ${bundle.weights.join(', ')} y serie ${bundle.weightedSeries.join(', ')}, calculá el próximo pronóstico ponderado.`,
      expected: weighted,
      formula: 'PMP = Σ (peso_i · dato_i)',
      hints: [
        'Usá solo la última ventana con la misma longitud que el vector de pesos.',
        'Si los pesos ya suman 1, no hace falta volver a normalizar.',
      ],
      highlights: weightedRows.map((row) => `${row.period}: ${row.value} × ${row.weight} = ${formatNumber(row.contribution)}`),
      success: 'Pronóstico ponderado correcto. La serie reciente quedó bien valorizada.',
      failure: `El valor correcto era ${formatNumber(weighted)}.`,
    },
    {
      kind: 'number' as const,
      label: 'Suavizado exponencial',
      prompt: `Usando alpha = ${bundle.alpha} y pronóstico inicial ${bundle.initialForecast}, calculá el siguiente pronóstico para la serie ${bundle.smoothingSeries.join(', ')}.`,
      expected: smoothed,
      formula: 'F(t+1) = α · X(t) + (1 - α) · F(t)',
      hints: [
        'Cada paso mezcla el último dato real con el pronóstico anterior.',
        'No arranques de cero: respetá el pronóstico inicial dado por el ejercicio.',
      ],
      highlights: smoothingTrace.slice(-3).map((row) => (
        `${row.period}: ${formatNumber(bundle.alpha)} × ${row.actual} + ${formatNumber(1 - bundle.alpha)} × ${formatNumber(row.previousForecast)} = ${formatNumber(row.nextForecast)}`
      )),
      success: 'Suavizado exponencial resuelto con la recurrencia correcta.',
      failure: `El pronóstico correcto era ${formatNumber(smoothed)}.`,
    },
    {
      kind: 'number' as const,
      label: 'MAD',
      prompt: `Con promedio móvil de n = ${bundle.movingWindow} sobre la serie ${bundle.movingAverageSeries.join(', ')}, calculá la MAD.`,
      expected: mad,
      formula: 'MAD = promedio de |error_t|',
      hints: [
        'Primero obtené cada pronóstico móvil y después calculá el error absoluto.',
        'No promedies los datos reales: promediá los errores absolutos.',
      ],
      highlights: errorRows.map((row) => (
        `${row.period}: real ${row.actual}, pronóstico ${formatNumber(row.forecast)}, |error| = ${formatNumber(row.absoluteError)}`
      )),
      success: 'MAD correcta. Ya tenés una medida estable del error medio.',
      failure: `La MAD correcta era ${formatNumber(mad)}.`,
    },
    {
      kind: 'number' as const,
      label: 'Escenario pesimista',
      prompt: `Si el pronóstico vigente es ${formatNumber(moving)}, calculá x_t + 2.5 × MAD para cubrir el caso pesimista.`,
      expected: pessimistic,
      formula: 'escenario pesimista = x_t + 2.5 × MAD',
      hints: [
        'Tomá como x_t el pronóstico base ya calculado.',
        'La corrección por MAD amplía el colchón frente a error de pronóstico.',
      ],
      highlights: [
        `Pronóstico base = ${formatNumber(moving)}`,
        `MAD = ${formatNumber(mad)}`,
        `Escenario pesimista = ${formatNumber(moving)} + 2.5 × ${formatNumber(mad)} = ${formatNumber(pessimistic)}`,
      ],
      success: 'Escenario pesimista bien calculado.',
      failure: `El escenario pesimista daba ${formatNumber(pessimistic)}.`,
    },
    {
      kind: 'choice' as const,
      label: 'Índice estacional dominante',
      prompt: '¿Qué trimestre tiene el índice estacional más alto en la matriz trimestral?',
      options: seasonalRows.map((row) => row.season),
      expected: dominantSeason.season,
      formula: 'índice estacional = promedio de la estación / promedio general',
      hints: [
        'Compará el promedio de cada trimestre contra el promedio global.',
        'El índice más alto marca la estación con mayor presión relativa de demanda.',
      ],
      highlights: seasonalRows.map((row) => `${row.season}: promedio ${formatNumber(row.average)}, índice ${formatNumber(row.index)}`),
      success: 'Correcto: detectaste la estacionalidad dominante.',
      failure: `El trimestre dominante era ${dominantSeason.season}.`,
    },
  ]

  const activeStep = steps[stepIndex]

  const resolve = (correct: boolean, feedbackMessage: FeedbackMessage) => {
    setFeedback(feedbackMessage)
    onResolve(buildResolution(activeStep.label, correct, stepIndex === steps.length - 1 && correct, feedbackMessage, gameMode))

    if (correct && stepIndex < steps.length - 1) {
      setStepIndex((current) => current + 1)
      setChoice('')
      setInput('')
    }
  }

  const validate = () => {
    if (disabled) {
      return
    }

    if (activeStep.kind === 'choice') {
      const correct = choice === activeStep.expected
      resolve(correct, {
        tone: correct ? 'success' : 'danger',
        title: activeStep.label,
        body: correct ? activeStep.success : activeStep.failure,
        formula: activeStep.formula,
        sourceId: 'pronosticos-pdf',
        highlights: activeStep.highlights,
      })
      return
    }

    const numericValue = Number(input.replace(',', '.'))
    const correct = Number.isFinite(numericValue) && withinTolerance(numericValue, activeStep.expected)
    resolve(correct, {
      tone: correct ? 'success' : 'danger',
      title: activeStep.label,
      body: correct ? activeStep.success : activeStep.failure,
      formula: activeStep.formula,
      sourceId: activeStep.label === 'Promedio móvil ponderado' ? 'pronosticos-xlsx' : 'pronosticos-pdf',
      highlights: activeStep.highlights,
    })
  }

  return (
    <section className="room-panel">
      <header>
        <span className="eyebrow">Pronósticos</span>
        <h2>Medí el error antes de confiar en la demanda</h2>
        <p>
          Esta sala replica la lógica de práctica del Excel: primero proyectás, después medís el error y recién ahí ajustás un escenario pesimista o la lectura estacional.
        </p>
      </header>

      <div className="metrics-grid">
        <article className="metric-chip">
          <strong>Ventana móvil</strong>
          <span>{bundle.movingWindow} períodos</span>
        </article>
        <article className="metric-chip">
          <strong>Alpha</strong>
          <span>{formatNumber(bundle.alpha)}</span>
        </article>
        <article className="metric-chip">
          <strong>Etapa</strong>
          <span>
            {stepIndex + 1}/{steps.length}
          </span>
        </article>
      </div>

      <div className="panel-grid">
        <article className="table-card">
          <h3>Trazas del cálculo</h3>
          <table>
            <thead>
              <tr>
                <th>Base</th>
                <th>Dato</th>
                <th>Apoyo</th>
              </tr>
            </thead>
            <tbody>
              {weightedRows.map((row) => (
                <tr key={row.period}>
                  <td>{row.period}</td>
                  <td>{row.value}</td>
                  <td>{formatNumber(row.weight)} → {formatNumber(row.contribution)}</td>
                </tr>
              ))}
              {smoothingTrace.slice(-2).map((row) => (
                <tr key={row.period}>
                  <td>{row.period}</td>
                  <td>{row.actual}</td>
                  <td>{formatNumber(row.previousForecast)} → {formatNumber(row.nextForecast)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="chip-row">
            <span className="chip">PMP esperado: {formatNumber(weighted)}</span>
            <span className="chip">Suavizado esperado: {formatNumber(smoothed)}</span>
          </div>
        </article>

        <article className="table-card">
          <h3>Errores y estacionalidad</h3>
          <table>
            <thead>
              <tr>
                <th>Período</th>
                <th>Real</th>
                <th>Pronóstico</th>
                <th>|Error|</th>
              </tr>
            </thead>
            <tbody>
              {errorRows.map((row) => (
                <tr key={row.period}>
                  <td>{row.period}</td>
                  <td>{row.actual}</td>
                  <td>{formatNumber(row.forecast)}</td>
                  <td>{formatNumber(row.absoluteError)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="chip-row">
            <span className="chip">MAD: {formatNumber(mad)}</span>
            <span className="chip">Escenario pesimista: {formatNumber(pessimistic)}</span>
            <span className="chip">Pico estacional: {dominantSeason.season}</span>
          </div>
        </article>
      </div>

      <article className="table-card">
        <h3>Índices estacionales por promedio</h3>
        <table>
          <thead>
            <tr>
              <th>Estación</th>
              <th>Promedio</th>
              <th>Índice</th>
            </tr>
          </thead>
          <tbody>
            {seasonalRows.map((row) => (
              <tr key={row.season} className={row.season === dominantSeason.season ? 'row-highlight' : ''}>
                <td>{row.season}</td>
                <td>{formatNumber(row.average)}</td>
                <td>{formatNumber(row.index)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <FormulaTooltip
          title="Checklist de pronóstico"
          formula="promedio móvil / ponderado + suavizado + MAD + x_t + 2.5 × MAD + índices estacionales"
          sourceLabel="Pronóstico.xlsx + Modelos de Pronósticos.pdf"
        />
      </article>

      <article className="question-card">
        <h3>{activeStep.label}</h3>
        <p>{activeStep.prompt}</p>
        <div className="criteria-list">
          {activeStep.hints.map((hint) => (
            <span key={hint}>{hint}</span>
          ))}
        </div>

        {activeStep.kind === 'choice' ? (
          <div className="choice-grid">
            {activeStep.options.map((option) => (
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
        ) : (
          <div className="input-actions">
            <input
              className="answer-input"
              inputMode="decimal"
              onChange={(event) => setInput(event.target.value)}
              placeholder="Escribí tu resultado"
              type="text"
              value={input}
            />
            <button className="validate-button" onClick={validate} type="button">
              Validar cálculo
            </button>
          </div>
        )}

        {activeStep.kind === 'choice' ? (
          <div className="room-actions">
            <button className="validate-button" onClick={validate} type="button">
              Validar lectura
            </button>
          </div>
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
