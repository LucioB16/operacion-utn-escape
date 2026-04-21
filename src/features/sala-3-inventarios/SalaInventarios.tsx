import { useState } from 'react'
import { createScoreDelta } from '../../game/core/scoring'
import type { FeedbackMessage, RoomComponentProps, RoomResolution } from '../../game/core/types'
import { withinTolerance } from '../../game/utils/tolerance'
import { FormulaTooltip } from '../shared/FormulaTooltip'
import {
  buildInventoryBreakdown,
  createInventoryBundle,
  evaluateQuantityDiscount,
  modelFormula,
  optimalLotSize,
  optimalTotalCost,
  randomDemandBreakdown,
} from './inventariosEngine'

const modelLabels = {
  'sin-ruptura': 'CEP sin ruptura',
  'con-ruptura': 'CEP con ruptura',
  'reabastecimiento-uniforme': 'Reabastecimiento uniforme',
  'demanda-aleatoria': 'Demanda aleatoria',
  'descuento-cantidad': 'Descuento por cantidad',
} as const

type InventoryStep =
  | {
      type: 'choice'
      label: string
      prompt: string
      hints: string[]
      options: string[]
      expected: string
      success: string
      failure: string
      formula: string
      sourceId: string
      highlights: string[]
    }
  | {
      type: 'number'
      label: string
      prompt: string
      hints: string[]
      expected: number
      success: string
      failure: string
      formula: string
      sourceId: string
      highlights: string[]
    }

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
  const randomDemand = randomDemandBreakdown(bundle.randomDemandExercise)
  const discountPlan = evaluateQuantityDiscount(bundle.quantityDiscountExercise)

  const discountOptions = discountPlan.candidates.map((candidate) => (
    `Desde ${candidate.minQty} u. (C=${formatNumber(candidate.unitCost)})`
  ))
  const bestDiscountOption = `Desde ${discountPlan.best.minQty} u. (C=${formatNumber(discountPlan.best.unitCost)})`

  const steps: InventoryStep[] = [
    {
      type: 'choice',
      label: 'Identificación del modelo',
      prompt: bundle.classification.prompt,
      hints: [
        'Primero detectá si hay faltantes permitidos.',
        'Después fijate si el abastecimiento entra instantáneo, uniforme o con incertidumbre.',
      ],
      options: Object.values(modelLabels),
      expected: modelLabels[bundle.classification.model],
      success: 'Bien: identificaste el patrón correcto del caso.',
      failure: `El caso pedía ${modelLabels[bundle.classification.model]}.`,
      formula: 'Elegir modelo antes de calcular evita usar una fórmula que no corresponde.',
      sourceId: 'inventarios-cep',
      highlights: [
        'Mismo dato, distinto modelo = resultados inconsistentes.',
        'Primero supuestos, después fórmula.',
      ],
    },
    {
      type: 'number',
      label: 'Cantidad económica Q*',
      prompt: `Para el caso de cálculo (${modelLabels[bundle.calculation.model]}), con D = ${bundle.calculation.demand}, S = ${bundle.calculation.orderCost} y H = ${bundle.calculation.holdingCost}, calculá Q*.`,
      hints: [
        `Usá la estructura ${modelFormula(bundle.calculation)}.`,
        'No mezcles fórmulas de modelos distintos.',
      ],
      expected: lot,
      success: 'Q* correcto. La fórmula quedó bien aplicada.',
      failure: `El lote óptimo era ${formatNumber(lot)}.`,
      formula: modelFormula(bundle.calculation),
      sourceId: bundle.calculation.sourceId,
      highlights: [
        `Costo de pedir = ${formatNumber(breakdown.orderCost)}`,
        `Costo de almacenar = ${formatNumber(breakdown.holdingCost)}`,
      ],
    },
    {
      type: 'number',
      label: 'Costo total óptimo',
      prompt: 'Ahora calculá el costo total relevante en la política óptima.',
      hints: [
        'Sumá pedir + almacenar + ruptura cuando aplique.',
        'Si hay descuentos por cantidad, sumá también costo de compra.',
      ],
      expected: totalCost,
      success: 'Costo total correcto para el modelo seleccionado.',
      failure: `El costo total óptimo era ${formatNumber(totalCost)}.`,
      formula: 'CT = pedir + almacenar + ruptura + compra (si corresponde)',
      sourceId: bundle.calculation.sourceId,
      highlights: [
        `Costo de pedir = ${formatNumber(breakdown.orderCost)}`,
        `Costo de almacenar = ${formatNumber(breakdown.holdingCost)}`,
        `Costo de ruptura = ${formatNumber(breakdown.shortageCost)}`,
        `Costo de compra = ${formatNumber(breakdown.purchaseCost)}`,
      ],
    },
    {
      type: 'choice',
      label: 'Criterio de ruptura',
      prompt: bundle.ruptureDecision.prompt,
      hints: [
        'Solo tiene sentido ruptura si el sistema admite faltantes planeados.',
        'El criterio depende de la relación entre costo de ruptura y mantener stock.',
      ],
      options: ['Conviene analizar ruptura', 'No conviene ruptura'],
      expected: bundle.ruptureDecision.answer,
      success: 'Correcto: el criterio de ruptura está bien interpretado.',
      failure: `La respuesta correcta era: ${bundle.ruptureDecision.answer}.`,
      formula: 'Analizar ruptura cuando faltante planificado es viable y económicamente justificable.',
      sourceId: 'inventarios-cep',
      highlights: [
        'Si no se permite faltante, no hay modelo con ruptura.',
        'La decisión depende de costos relativos, no de intuición.',
      ],
    },
    {
      type: 'number',
      label: 'Demanda aleatoria: punto de pedido',
      prompt: bundle.randomDemandExercise.prompt,
      hints: [
        'Primero calculá stock de seguridad con z · sigma · sqrt(L).',
        'Después sumá demanda media durante lead time.',
      ],
      expected: randomDemand.reorderPoint,
      success: 'Punto de pedido correcto para demanda incierta.',
      failure: `El punto de pedido correcto era ${formatNumber(randomDemand.reorderPoint)}.`,
      formula: 'R = d·L + z·sigma·sqrt(L)',
      sourceId: bundle.randomDemandExercise.sourceId,
      highlights: [
        `Stock de seguridad = ${formatNumber(randomDemand.safetyStock)}`,
        `Q* de referencia = ${formatNumber(randomDemand.lotSize)}`,
        `Costo relevante (pedir + mantener) = ${formatNumber(randomDemand.totalRelevantCost)}`,
      ],
    },
    {
      type: 'choice',
      label: 'Descuento por cantidad: mejor tramo',
      prompt: `${bundle.quantityDiscountExercise.prompt} D = ${bundle.quantityDiscountExercise.annualDemand}, S = ${bundle.quantityDiscountExercise.orderCost}, i = ${bundle.quantityDiscountExercise.carryingRate}.`,
      hints: [
        'Evaluá CT por cada tramo, no solo el precio unitario.',
        'Un tramo con menor precio puede perder por holding y ordering si Q no cierra.',
      ],
      options: discountOptions,
      expected: bestDiscountOption,
      success: 'Tramo correcto: minimiza costo total anual.',
      failure: `El tramo óptimo era ${bestDiscountOption}.`,
      formula: 'CT = DC + (D/Q)S + (Q/2)iC evaluado por tramo',
      sourceId: bundle.quantityDiscountExercise.sourceId,
      highlights: discountPlan.candidates.map((candidate) => (
        `Desde ${candidate.minQty}: Q eval=${formatNumber(candidate.evaluatedQty)}, CT=${formatNumber(candidate.totalCost)}`
      )),
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
        formula: activeStep.formula,
        sourceId: activeStep.sourceId,
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
      sourceId: activeStep.sourceId,
      highlights: activeStep.highlights,
    })
  }

  return (
    <section className="room-panel">
      <header>
        <span className="eyebrow">Inventarios</span>
        <h2>Detectar modelo primero, calcular después</h2>
        <p>
          Esta sala ahora cubre los seis frentes de práctica más útiles: identificación, Q*, costo total, ruptura, demanda aleatoria y descuentos por cantidad.
        </p>
      </header>

      <div className="metrics-grid">
        <article className="metric-chip">
          <strong>Modelo actual</strong>
          <span>{modelLabels[bundle.calculation.model]}</span>
        </article>
        <article className="metric-chip">
          <strong>Q* esperado</strong>
          <span>{formatNumber(lot)}</span>
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
              {bundle.calculation.carryingRate ? (
                <tr>
                  <td>Tasa de mantenimiento i</td>
                  <td>{bundle.calculation.carryingRate}</td>
                </tr>
              ) : null}
            </tbody>
          </table>

          <div className="chip-row">
            <span className="chip">Inventario máximo: {formatNumber(breakdown.maxInventory)}</span>
            {breakdown.maxBackorder > 0 ? <span className="chip">Ruptura máxima: {formatNumber(breakdown.maxBackorder)}</span> : null}
            {breakdown.reorderPoint > 0 ? <span className="chip">Punto de pedido: {formatNumber(breakdown.reorderPoint)}</span> : null}
          </div>

          <FormulaTooltip
            title="Secuencia segura"
            formula="1) Identificar supuestos  2) Elegir modelo  3) Calcular Q*  4) Evaluar costo total y política"
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
                <td>Costo de compra</td>
                <td>{formatNumber(breakdown.purchaseCost)}</td>
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

      <article className="table-card">
        <h3>Ejercicios extra de práctica</h3>
        <table>
          <thead>
            <tr>
              <th>Bloque</th>
              <th>Dato clave</th>
              <th>Referencia</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Demanda aleatoria</td>
              <td>d={bundle.randomDemandExercise.meanDailyDemand}, sigma={bundle.randomDemandExercise.stdDailyDemand}, L={bundle.randomDemandExercise.leadTimeDays}, z={bundle.randomDemandExercise.zValue}</td>
              <td>R esperado: {formatNumber(randomDemand.reorderPoint)}</td>
            </tr>
            <tr>
              <td>Descuento por cantidad</td>
              <td>D={bundle.quantityDiscountExercise.annualDemand}, i={bundle.quantityDiscountExercise.carryingRate}</td>
              <td>Tramo óptimo: {bestDiscountOption}</td>
            </tr>
          </tbody>
        </table>
      </article>

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
