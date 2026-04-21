import { useState } from 'react'
import { createScoreDelta } from '../../game/core/scoring'
import type { FeedbackMessage, RoomComponentProps, RoomResolution } from '../../game/core/types'
import { withinTolerance } from '../../game/utils/tolerance'
import { FormulaTooltip } from '../shared/FormulaTooltip'
import { buildInventoryBreakdown, createInventoryBundle, modelFormula, optimalLotSize, optimalTotalCost } from './inventariosEngine'

const modelLabels = {
  'sin-ruptura': 'CEP sin ruptura',
  'con-ruptura': 'CEP con ruptura',
  'reabastecimiento-uniforme': 'Reabastecimiento uniforme',
} as const

function buildResolution(stepLabel: string, correct: boolean, completed: boolean, feedback: FeedbackMessage, gameMode: RoomComponentProps['gameMode']): RoomResolution {
  return {
    roomId: 'sala-3',
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

export function SalaInventarios({ disabled, gameMode, onResolve }: RoomComponentProps) {
  const [bundle] = useState(() => createInventoryBundle())
  const [stepIndex, setStepIndex] = useState(0)
  const [choice, setChoice] = useState('')
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null)

  const lot = optimalLotSize(bundle.calculation)
  const totalCost = optimalTotalCost(bundle.calculation)
  const breakdown = buildInventoryBreakdown(bundle.calculation)

  const steps = [
    {
      type: 'choice' as const,
      label: 'Identificación del modelo',
      prompt: bundle.classification.prompt,
      hints: [
        'Primero detectá si hay faltantes permitidos.',
        'Después fijate si el abastecimiento entra instantáneo o uniforme.',
      ],
      options: Object.values(modelLabels),
      expected: modelLabels[bundle.classification.model],
      success: 'Bien: identificaste el patrón correcto del caso.',
      failure: `El caso pedía ${modelLabels[bundle.classification.model]}.`,
    },
    {
      type: 'number' as const,
      label: 'Cantidad económica Q*',
      prompt: `Para el caso de cálculo (${modelLabels[bundle.calculation.model]}), con D = ${bundle.calculation.demand}, S = ${bundle.calculation.orderCost} y H = ${bundle.calculation.holdingCost}, calculá Q*.`,
      hints: [
        `Usá la estructura ${modelFormula(bundle.calculation)}.`,
        'No mezcles el modelo sin ruptura con reabastecimiento uniforme.',
      ],
      expected: lot,
      success: 'Q* correcto. La fórmula quedó bien aplicada.',
      failure: `El lote óptimo era ${formatNumber(lot)}.`,
    },
    {
      type: 'number' as const,
      label: 'Costo total óptimo',
      prompt: 'Ahora calculá el costo total relevante en la política óptima.',
      hints: [
        'Sumá costo de pedir + almacenamiento + ruptura si corresponde.',
        'No metas costo de compra unitario si no cambia la decisión.',
      ],
      expected: totalCost,
      success: 'Costo total correcto para el modelo seleccionado.',
      failure: `El costo total óptimo era ${formatNumber(totalCost)}.`,
    },
    {
      type: 'choice' as const,
      label: 'Criterio de ruptura',
      prompt: bundle.ruptureDecision.prompt,
      hints: [
        'Solo tiene sentido ruptura si el sistema admite faltantes planeados.',
        'El criterio depende de la relación entre costo de ruptura y mantener stock.',
      ],
      options: ['Conviene analizar ruptura', 'No conviene ruptura'],
      expected: bundle.ruptureDecision.answer,
      success: 'Correcto: solo conviene ruptura si la política permite faltantes planeados y el costo de ruptura no vuelve inviable la estrategia.',
      failure: `La respuesta correcta era: ${bundle.ruptureDecision.answer}.`,
    },
  ]

  const activeStep = steps[stepIndex]

  const resolve = (correct: boolean, message: FeedbackMessage) => {
    setFeedback(message)
    onResolve(buildResolution(activeStep.label, correct, stepIndex === steps.length - 1 && correct, message, gameMode))

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

    if (activeStep.type === 'choice') {
      const correct = choice === activeStep.expected
      resolve(correct, {
        tone: correct ? 'success' : 'danger',
        title: activeStep.label,
        body: correct ? activeStep.success : activeStep.failure,
        formula: 'Elegir modelo antes de calcular evita usar una fórmula que no corresponde.',
        sourceId: 'inventarios-cep',
        highlights: activeStep.hints,
      })
      return
    }

    const numericValue = Number(input.replace(',', '.'))
    const correct = Number.isFinite(numericValue) && withinTolerance(numericValue, activeStep.expected)
    resolve(correct, {
      tone: correct ? 'success' : 'danger',
      title: activeStep.label,
      body: correct ? activeStep.success : activeStep.failure,
      formula: activeStep.label === 'Cantidad económica Q*' ? modelFormula(bundle.calculation) : 'CT = pedir + almacenar + ruptura relevante',
      sourceId: bundle.calculation.sourceId,
      highlights: [
        `Costo de pedir = ${formatNumber(breakdown.orderCost)}`,
        `Costo de almacenar = ${formatNumber(breakdown.holdingCost)}`,
        `Costo de ruptura = ${formatNumber(breakdown.shortageCost)}`,
      ],
    })
  }

  return (
    <section className="room-panel">
      <header>
        <span className="eyebrow">Inventarios</span>
        <h2>Detectar modelo primero, calcular después</h2>
        <p>
          La sala mezcla clasificación y cálculo para que no caigas en el error clásico de forzar la fórmula equivocada sobre datos válidos.
        </p>
      </header>

      <div className="panel-grid">
        <article className="table-card">
          <h3>Datos del caso de cálculo</h3>
          <table>
            <tbody>
              <tr>
                <td>Modelo</td>
                <td>{modelLabels[bundle.calculation.model]}</td>
              </tr>
              <tr>
                <td>D</td>
                <td>{bundle.calculation.demand}</td>
              </tr>
              <tr>
                <td>S</td>
                <td>{bundle.calculation.orderCost}</td>
              </tr>
              <tr>
                <td>H</td>
                <td>{bundle.calculation.holdingCost}</td>
              </tr>
              {bundle.calculation.shortageCost ? (
                <tr>
                  <td>Costo de ruptura</td>
                  <td>{bundle.calculation.shortageCost}</td>
                </tr>
              ) : null}
              {bundle.calculation.productionRate ? (
                <tr>
                  <td>Tasa de producción</td>
                  <td>{bundle.calculation.productionRate}</td>
                </tr>
              ) : null}
            </tbody>
          </table>

          <div className="chip-row">
            <span className="chip">Q* esperado: {formatNumber(lot)}</span>
            <span className="chip">Inventario máximo: {formatNumber(breakdown.maxInventory)}</span>
            {bundle.calculation.model === 'con-ruptura' ? <span className="chip">Ruptura máxima: {formatNumber(breakdown.maxBackorder)}</span> : null}
          </div>

          <FormulaTooltip
            title="Secuencia segura"
            formula="1) Identificar supuestos  2) Elegir modelo  3) Calcular Q*  4) Evaluar costo total y criterio de ruptura"
            sourceLabel="Temas de Examen.docx + Modelos CEP y con Ruptura.pdf"
          />
        </article>

        <article className="table-card">
          <h3>Desglose guiado de costos</h3>
          <table>
            <tbody>
              <tr>
                <td>Costo de pedir</td>
                <td>{formatNumber(breakdown.orderCost)}</td>
              </tr>
              <tr>
                <td>Costo de almacenar</td>
                <td>{formatNumber(breakdown.holdingCost)}</td>
              </tr>
              <tr>
                <td>Costo de ruptura</td>
                <td>{formatNumber(breakdown.shortageCost)}</td>
              </tr>
              <tr>
                <td>Costo total</td>
                <td>{formatNumber(breakdown.totalCost)}</td>
              </tr>
            </tbody>
          </table>
          <div className="criteria-list">
            {activeStep.hints.map((hint) => (
              <span key={hint}>{hint}</span>
            ))}
          </div>
        </article>
      </div>

      <article className="question-card">
        <h3>{activeStep.label}</h3>
        <p>{activeStep.prompt}</p>

        {activeStep.type === 'choice' ? (
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
          <input
            className="answer-input"
            inputMode="decimal"
            onChange={(event) => setInput(event.target.value)}
            placeholder="Escribí el valor"
            type="text"
            value={input}
          />
        )}

        <div className="room-actions">
          <button className="validate-button" onClick={validate} type="button">
            Validar respuesta
          </button>
        </div>

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
