import { useEffect, useState } from 'react'
import { createScoreDelta } from '../../game/core/scoring'
import type { FeedbackMessage, RoomComponentProps, RoomResolution } from '../../game/core/types'
import { withinTolerance } from '../../game/utils/tolerance'
import { FormulaTooltip } from '../shared/FormulaTooltip'
import {
  analyzeIteration,
  basisChanges,
  createSimplexRoomScenario,
  deltaRange,
  objectiveValue,
  projectBasicSolution,
  projectObjective,
  verifySensitivityWithGlpk,
  type SensitivityGlpkVerification,
} from './simplexEngine'

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

function buildResolution(stepLabel: string, correct: boolean, completed: boolean, feedback: FeedbackMessage, gameMode: RoomComponentProps['gameMode']): RoomResolution {
  return {
    roomId: 'sala-2',
    stepLabel,
    correct,
    completed,
    feedback,
    ...createScoreDelta(correct, gameMode),
  }
}

export function SalaSimplexSensibilidad({ disabled, gameMode, onResolve }: RoomComponentProps) {
  const [scenario] = useState(() => createSimplexRoomScenario())
  const [stepIndex, setStepIndex] = useState(0)
  const [selectedChoice, setSelectedChoice] = useState('')
  const [numericAnswer, setNumericAnswer] = useState('')
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null)
  const [externalVerification, setExternalVerification] = useState<SensitivityGlpkVerification | null>(null)

  useEffect(() => {
    let active = true

    verifySensitivityWithGlpk(scenario.sensitivity)
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

  const iteration = analyzeIteration(scenario.iteration)
  const nextTableau = iteration.nextTableau
  const sensitivityRange = deltaRange(scenario.sensitivity)
  const projectedInside = projectBasicSolution(scenario.sensitivity, scenario.sensitivity.deltaInside)
  const projectedOutside = projectBasicSolution(scenario.sensitivity, scenario.sensitivity.deltaOutside)
  const intervalChoices = [
    `[${formatNumber(sensitivityRange.min)}, ${formatNumber(sensitivityRange.max)}]`,
    `[0, ${formatNumber(sensitivityRange.max)}]`,
    `[${formatNumber(sensitivityRange.min * 2)}, ${formatNumber(sensitivityRange.max / 2)}]`,
  ]

  const steps = [
    {
      kind: 'choice' as const,
      stepLabel: 'Variable que entra',
      prompt: 'Elegí la variable que entra a la base según Cj - Zj.',
      hints: [
        scenario.iteration.direction === 'min' ? 'Buscá el Cj - Zj más negativo.' : 'Buscá el Cj - Zj positivo más grande.',
        'No mires el nombre de la variable: mirá la mejora marginal.',
      ],
      choices: scenario.iteration.columns,
      correctChoice: iteration.entering?.variable ?? '',
      success: 'Correcto: detectaste la columna llave de la iteración.',
      failure: `Acá entraba ${iteration.entering?.variable ?? '-'} porque ${scenario.iteration.direction === 'min' ? 'era el Cj - Zj más negativo.' : 'era el Cj - Zj positivo más alto.'}`,
      formula: scenario.iteration.direction === 'min' ? 'entra = argmin(Cj - Zj)' : 'entra = argmax(Cj - Zj)',
      highlights: [`Cj - Zj = ${iteration.reducedCosts.join(' · ')}`],
    },
    {
      kind: 'choice' as const,
      stepLabel: 'Variable que sale',
      prompt: 'Aplicá theta = VLD / lambda_ij usando solo lambda_ij > 0. ¿Qué variable sale?',
      hints: [
        'Ignorá filas con lambda <= 0.',
        'Sale la básica con el menor theta positivo.',
      ],
      choices: scenario.iteration.rows.map((row) => row.basis),
      correctChoice: iteration.leaving?.basis ?? '',
      success: 'Bien: seleccionaste la fila puerta con el menor theta positivo.',
      failure: `La variable que salía era ${iteration.leaving?.basis ?? '-'} porque tenía el menor theta positivo.`,
      formula: 'theta = VLD / lambda_ij, solo si lambda_ij > 0',
      highlights: iteration.thetaRows.map((row) => `${row.basis}: λ=${formatNumber(row.coefficient)} · θ=${row.theta === null ? '—' : formatNumber(row.theta)}`),
    },
    {
      kind: 'number' as const,
      stepLabel: 'Nuevo VLD pivote',
      prompt: 'Después de normalizar la fila pivote, ¿cuál queda como nuevo VLD de esa fila?',
      hints: [
        `El pivot vale ${formatNumber(iteration.pivot ?? 0)}.`,
        'Dividí toda la fila pivote por ese valor.',
      ],
      expected: nextTableau?.rows[iteration.leaving?.rowIndex ?? 0].rhs ?? 0,
      success: 'Exacto: normalizaste la fila pivote dividiendo todo por el lambda del pivot.',
      failure: `El VLD correcto era ${formatNumber(nextTableau?.rows[iteration.leaving?.rowIndex ?? 0].rhs ?? 0)}.`,
      formula: 'fila pivote nueva = fila pivote actual / lambda_pivot',
      highlights: nextTableau
        ? nextTableau.rows[iteration.leaving?.rowIndex ?? 0].coefficients.map((value, index) => `${nextTableau.columns[index]} = ${formatNumber(value)}`)
        : [],
    },
    {
      kind: 'number' as const,
      stepLabel: 'Precio sombra',
      prompt: `En el escenario de sensibilidad, ¿cuál es el precio sombra de ${scenario.sensitivity.rhsLabels[scenario.sensitivity.resourceIndex]}?`,
      hints: [
        'Leé el recurso correcto antes de contestar.',
        'Ese valor multiplica el cambio del VLD dentro del intervalo.',
      ],
      expected: scenario.sensitivity.shadowPrices[scenario.sensitivity.resourceIndex],
      success: 'Sí: ese es el valor marginal del recurso mientras la base se mantiene.',
      failure: `El precio sombra correcto era ${formatNumber(scenario.sensitivity.shadowPrices[scenario.sensitivity.resourceIndex])}.`,
      formula: 'ΔZ = precio sombra · ΔVLD',
      highlights: [`Vector base actual: ${scenario.sensitivity.basicLabels.join(', ')}`],
    },
    {
      kind: 'choice' as const,
      stepLabel: 'Intervalo de sensibilidad',
      prompt: `¿Cuál es el intervalo admisible para Δ${scenario.sensitivity.rhsLabels[scenario.sensitivity.resourceIndex]} sin cambiar la base?`,
      hints: [
        'Usá x_B nueva = x_B + Δ · B^-1 · e_i.',
        'La base solo se mantiene si todas las básicas quedan no negativas.',
      ],
      choices: intervalChoices,
      correctChoice: intervalChoices[0],
      success: 'Bien: ese intervalo sale de exigir no negatividad en las básicas.',
      failure: `El intervalo correcto era ${intervalChoices[0]}.`,
      formula: 'x_B nueva = x_B + Δ · B^-1 · e_i',
      highlights: projectedInside.map((value, index) => `${scenario.sensitivity.basicLabels[index]}(Δ interno) = ${formatNumber(value)}`),
    },
    {
      kind: 'number' as const,
      stepLabel: 'Nuevo valor óptimo',
      prompt: `Si ${scenario.sensitivity.rhsLabels[scenario.sensitivity.resourceIndex]} aumenta en ${formatNumber(scenario.sensitivity.deltaInside)}, ¿cuál es el nuevo valor óptimo Z?`,
      hints: [
        'Estás dentro del intervalo, así que el precio sombra aplica directo.',
        'No recalcules todo el simplex: actualizá Z con el valor marginal.',
      ],
      expected: projectObjective(scenario.sensitivity, scenario.sensitivity.deltaInside),
      success: 'Perfecto: aplicaste el precio sombra dentro del intervalo de sensibilidad.',
      failure: `El nuevo valor óptimo era ${formatNumber(projectObjective(scenario.sensitivity, scenario.sensitivity.deltaInside))}.`,
      formula: 'Z nueva = Z base + precio sombra · Δ',
      highlights: [
        `Z base = ${formatNumber(scenario.sensitivity.baseObjective)}`,
        `Δ = ${formatNumber(scenario.sensitivity.deltaInside)}`,
      ],
    },
    {
      kind: 'choice' as const,
      stepLabel: 'Cambio de base',
      prompt: `Si el cambio fuese Δ = ${formatNumber(scenario.sensitivity.deltaOutside)}, ¿la base se mantiene?`,
      hints: [
        'Compará ese Δ con el intervalo admisible.',
        'Fuera del intervalo, ya no podés asegurar la misma base.',
      ],
      choices: ['Sí, la base sigue igual', 'No, la base cambia'],
      correctChoice: basisChanges(scenario.sensitivity, scenario.sensitivity.deltaOutside)
        ? 'No, la base cambia'
        : 'Sí, la base sigue igual',
      success: 'Correcto: al salirte del intervalo ya no podés garantizar la misma base.',
      failure: 'La base deja de ser válida fuera del intervalo admisible.',
      formula: 'Si Δ queda fuera del intervalo, cambia la base o deja de ser factible',
      highlights: projectedOutside.map((value, index) => `${scenario.sensitivity.basicLabels[index]}(Δ externo) = ${formatNumber(value)}`),
    },
  ]

  const activeStep = steps[stepIndex]

  const resolveAttempt = (correct: boolean, message: FeedbackMessage, completed: boolean) => {
    setFeedback(message)
    onResolve(buildResolution(activeStep.stepLabel, correct, completed, message, gameMode))

    if (correct && !completed) {
      setStepIndex((current) => current + 1)
      setSelectedChoice('')
      setNumericAnswer('')
    }
  }

  const validateChoice = () => {
    if (disabled || activeStep.kind !== 'choice' || !selectedChoice) {
      return
    }

    const correct = selectedChoice === activeStep.correctChoice
    const message: FeedbackMessage = {
      tone: correct ? 'success' : 'danger',
      title: correct ? `${activeStep.stepLabel}: resuelto` : `${activeStep.stepLabel}: ajuste necesario`,
      body: correct ? activeStep.success : activeStep.failure,
      formula: activeStep.formula,
      sourceId: 'dualidad-sensibilidad',
      highlights: activeStep.highlights,
    }

    resolveAttempt(correct, message, stepIndex === steps.length - 1 && correct)
  }

  const validateNumber = () => {
    if (disabled || activeStep.kind !== 'number' || numericAnswer.trim() === '') {
      return
    }

    const numericValue = Number(numericAnswer.replace(',', '.'))
    const correct = Number.isFinite(numericValue) && withinTolerance(numericValue, activeStep.expected)
    const message: FeedbackMessage = {
      tone: correct ? 'success' : 'danger',
      title: correct ? `${activeStep.stepLabel}: resuelto` : `${activeStep.stepLabel}: ajuste necesario`,
      body: correct ? activeStep.success : activeStep.failure,
      formula: activeStep.formula,
      sourceId: 'dualidad-sensibilidad',
      highlights: activeStep.highlights,
    }

    resolveAttempt(correct, message, stepIndex === steps.length - 1 && correct)
  }

  return (
    <section className="room-panel">
      <header>
        <span className="eyebrow">Sala central del prototipo</span>
        <h2>Simplex, sensibilidad y presión real de examen</h2>
        <p>
          Esta sala replica el corazón del final: primero pivotás una tabla, después evaluás precio sombra, intervalo admisible y nuevo Z ante cambios del VLD.
        </p>
      </header>

      <div className="metrics-grid">
        <article className="metric-chip">
          <strong>Dirección</strong>
          <span>{scenario.iteration.direction === 'min' ? 'Minimización' : 'Maximización'}</span>
        </article>
        <article className="metric-chip">
          <strong>Z actual</strong>
          <span>{formatNumber(objectiveValue(scenario.iteration))}</span>
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
          <h3>Tabla actual</h3>
          <table>
            <thead>
              <tr>
                <th>Cb</th>
                <th>Base</th>
                <th>VLD</th>
                {scenario.iteration.columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scenario.iteration.rows.map((row) => (
                <tr key={row.basis}>
                  <td>{formatNumber(row.cb)}</td>
                  <td>{row.basis}</td>
                  <td>{formatNumber(row.rhs)}</td>
                  {row.coefficients.map((coefficient, index) => (
                    <td key={`${row.basis}-${scenario.iteration.columns[index]}`}>{formatNumber(coefficient)}</td>
                  ))}
                </tr>
              ))}
              <tr>
                <td colSpan={3}>Cj - Zj</td>
                {iteration.reducedCosts.map((value, index) => (
                  <td key={`rc-${scenario.iteration.columns[index]}`}>{formatNumber(value)}</td>
                ))}
              </tr>
            </tbody>
          </table>

          <div className="chip-row">
            {scenario.iteration.columns.map((column, index) => (
              <span key={column} className={`chip ${iteration.entering?.variable === column ? 'chip-highlight' : ''}`}>
                {column}: {formatNumber(iteration.reducedCosts[index])}
              </span>
            ))}
          </div>

          <FormulaTooltip
            title="Regla de ingreso y salida"
            formula={scenario.iteration.direction === 'min' ? 'entra el Cj - Zj más negativo y sale el theta positivo mínimo' : 'entra el Cj - Zj positivo más grande y sale el theta positivo mínimo'}
            sourceIds={['temas-examen', 'preguntas-teorico']}
          />
        </article>

        <article className="table-card">
          <h3>Tabla de theta</h3>
          <table>
            <thead>
              <tr>
                <th>Base</th>
                <th>λ</th>
                <th>θ</th>
              </tr>
            </thead>
            <tbody>
              {iteration.thetaRows.map((row) => (
                <tr key={row.basis} className={iteration.leaving?.basis === row.basis ? 'row-highlight' : ''}>
                  <td>{row.basis}</td>
                  <td>{formatNumber(row.coefficient)}</td>
                  <td>{row.theta === null ? '—' : formatNumber(row.theta)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="chip-row">
            <span className="chip">Entra: {iteration.entering?.variable ?? '—'}</span>
            <span className="chip">Sale: {iteration.leaving?.basis ?? '—'}</span>
            <span className="chip">Pivot: {formatNumber(iteration.pivot ?? 0)}</span>
          </div>
        </article>
      </div>

      {nextTableau ? (
        <article className="table-card">
          <h3>Vista guiada de la siguiente tabla</h3>
          <table>
            <thead>
              <tr>
                <th>Cb</th>
                <th>Base</th>
                <th>VLD</th>
                {nextTableau.columns.map((column) => (
                  <th key={`next-${column}`}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nextTableau.rows.map((row) => (
                <tr key={`next-row-${row.basis}`}>
                  <td>{formatNumber(row.cb)}</td>
                  <td>{row.basis}</td>
                  <td>{formatNumber(row.rhs)}</td>
                  {row.coefficients.map((value, index) => (
                    <td key={`next-${row.basis}-${nextTableau.columns[index]}`}>{formatNumber(value)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      ) : null}

      <div className="panel-grid">
        <article className="table-card">
          <h3>Panel de sensibilidad</h3>
          <table>
            <thead>
              <tr>
                <th>Variable básica</th>
                <th>Valor</th>
                <th>B^-1 · e_i</th>
                <th>Con Δ interno</th>
                <th>Con Δ externo</th>
              </tr>
            </thead>
            <tbody>
              {scenario.sensitivity.basicLabels.map((label, index) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td>{formatNumber(scenario.sensitivity.basicSolution[index])}</td>
                  <td>{formatNumber(scenario.sensitivity.basisInverse[index][scenario.sensitivity.resourceIndex])}</td>
                  <td>{formatNumber(projectedInside[index])}</td>
                  <td>{formatNumber(projectedOutside[index])}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="chip-row">
            <span className="chip">Precio sombra: {formatNumber(scenario.sensitivity.shadowPrices[scenario.sensitivity.resourceIndex])}</span>
            <span className="chip">Δ interno: {formatNumber(scenario.sensitivity.deltaInside)}</span>
            <span className="chip">Δ externo: {formatNumber(scenario.sensitivity.deltaOutside)}</span>
            <span className="chip">
              Verificador GLPK sensibilidad: {externalVerification?.matchesBaseObjective
                && externalVerification.matchesProjectedObjective
                && externalVerification.matchesShadowPrice
                ? 'OK'
                : 'calculando'}
            </span>
          </div>
        </article>

        <article className="table-card">
          <h3>Chequeo del intervalo</h3>
          <div className="criteria-list">
            <span>Intervalo válido: [{formatNumber(sensitivityRange.min)}, {formatNumber(sensitivityRange.max)}]</span>
            <span>Z con Δ interno: {formatNumber(projectObjective(scenario.sensitivity, scenario.sensitivity.deltaInside))}</span>
            <span>{basisChanges(scenario.sensitivity, scenario.sensitivity.deltaOutside) ? 'Δ externo cambia la base' : 'Δ externo conserva la base'}</span>
          </div>

          <FormulaTooltip
            title="Cambio de VLD dentro del intervalo"
            formula="x_B nueva = x_B + Δ · B^-1 · e_i ; Z nueva = Z base + precio sombra · Δ"
            sourceIds={['dualidad-sensibilidad']}
          />
        </article>
      </div>

      <article className="question-card">
        <h3>{activeStep.stepLabel}</h3>
        <p>{activeStep.prompt}</p>
        <div className="criteria-list">
          {activeStep.hints.map((hint) => (
            <span key={hint}>{hint}</span>
          ))}
        </div>

        {activeStep.kind === 'choice' ? (
          <>
            <div className="choice-grid">
              {activeStep.choices.map((choice) => (
                <button
                  key={choice}
                  className={`choice-button ${selectedChoice === choice ? 'is-selected' : ''}`}
                  onClick={() => setSelectedChoice(choice)}
                  type="button"
                >
                  {choice}
                </button>
              ))}
            </div>
            <div className="room-actions">
              <button className="validate-button" onClick={validateChoice} type="button">
                Validar paso
              </button>
            </div>
          </>
        ) : (
          <div className="input-actions">
            <input
              className="answer-input"
              inputMode="decimal"
              onChange={(event) => setNumericAnswer(event.target.value)}
              placeholder="Escribí tu resultado"
              type="text"
              value={numericAnswer}
            />
            <button className="validate-button" onClick={validateNumber} type="button">
              Validar cálculo
            </button>
          </div>
        )}

        {feedback && (
          <article className={`feedback-card ${feedback.tone}`}>
            <strong>{feedback.title}</strong>
            <p>{feedback.body}</p>
            {feedback.formula ? <p className="muted">{feedback.formula}</p> : null}
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
