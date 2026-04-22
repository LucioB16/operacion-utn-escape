import type { LP, Options, Result } from 'glpk.js'

export interface PLVertex {
  label: string
  x: number
  y: number
}

export interface PLConstraint {
  label: string
  a: number
  b: number
  limit: number
}

export interface PLScenario {
  title: string
  objective: {
    x: number
    y: number
  }
  constraints: PLConstraint[]
  vertices: PLVertex[]
  feasibleOrder: string[]
  optimalLabel: string
  optimalReason: string
  dualPrompt: string
  dualChoices: Array<{ value: string; label: string }>
  dualAnswer: string
  sourceId: string
}

export interface PLExternalVerification {
  status: number
  objectiveValue: number
  variables: {
    x: number
    y: number
  }
  expectedObjectiveValue: number
  matchesScenario: boolean
}

interface GlpkLike {
  GLP_MAX: number
  GLP_UP: number
  GLP_LO: number
  GLP_MSG_OFF: number
  solve: (lp: LP, options?: number | Options) => Result | Promise<Result>
}

export type GlpkFactory = () => Promise<GlpkLike>

const scenarios: PLScenario[] = [
  {
    title: 'Laboratorio de mezclas',
    objective: { x: 4, y: 5 },
    constraints: [
      { label: 'x + y <= 8', a: 1, b: 1, limit: 8 },
      { label: 'x + 2y <= 10', a: 1, b: 2, limit: 10 },
    ],
    vertices: [
      { label: 'A', x: 0, y: 0 },
      { label: 'B', x: 8, y: 0 },
      { label: 'C', x: 6, y: 2 },
      { label: 'D', x: 0, y: 5 },
    ],
    feasibleOrder: ['A', 'B', 'C', 'D'],
    optimalLabel: 'C',
    optimalReason: 'C es el vértice donde la recta de isoganancia toca por última vez la región factible.',
    dualPrompt: 'Si el recurso asociado a x + 2y <= 10 aumenta una unidad y la base no cambia, ¿qué representa su variable dual?',
    dualChoices: [
      { value: 'marginal', label: 'La mejora marginal del valor óptimo por una unidad adicional del recurso.' },
      { value: 'conteo', label: 'La cantidad de restricciones activas en la región factible.' },
      { value: 'produccion', label: 'La producción adicional automática de x en la solución primal.' },
    ],
    dualAnswer: 'marginal',
    sourceId: 'preguntas-teorico',
  },
  {
    title: 'Célula de empaquetado',
    objective: { x: 6, y: 4 },
    constraints: [
      { label: '2x + y <= 12', a: 2, b: 1, limit: 12 },
      { label: 'x + y <= 7', a: 1, b: 1, limit: 7 },
    ],
    vertices: [
      { label: 'A', x: 0, y: 0 },
      { label: 'B', x: 6, y: 0 },
      { label: 'C', x: 5, y: 2 },
      { label: 'D', x: 0, y: 7 },
    ],
    feasibleOrder: ['A', 'B', 'C', 'D'],
    optimalLabel: 'C',
    optimalReason: 'C domina al resto porque maximiza Z sin salir de ambas restricciones.',
    dualPrompt: 'En el dual, ¿cómo se interpreta una restricción limitante con precio sombra positivo?',
    dualChoices: [
      { value: 'recurso', label: 'Como un recurso escaso cuya disponibilidad adicional mejora el objetivo.' },
      { value: 'holgura', label: 'Como una holgura obligatoriamente positiva.' },
      { value: 'degenerada', label: 'Como una señal de degeneración en la base.' },
    ],
    dualAnswer: 'recurso',
    sourceId: 'preguntas-teorico',
  },
  {
    title: 'Mesa de corte',
    objective: { x: 7, y: 3 },
    constraints: [
      { label: 'x + y <= 9', a: 1, b: 1, limit: 9 },
      { label: '2x + y <= 14', a: 2, b: 1, limit: 14 },
    ],
    vertices: [
      { label: 'A', x: 0, y: 0 },
      { label: 'B', x: 7, y: 0 },
      { label: 'C', x: 5, y: 4 },
      { label: 'D', x: 0, y: 9 },
    ],
    feasibleOrder: ['A', 'B', 'C', 'D'],
    optimalLabel: 'B',
    optimalReason: 'B empuja la ganancia sobre x, que tiene el mayor coeficiente en Z.',
    dualPrompt: 'Si una restricción no limitante tiene precio sombra 0, ¿qué te está diciendo el dual?',
    dualChoices: [
      { value: 'sin-valor', label: 'Que una unidad extra del recurso no mejora Z en esa base.' },
      { value: 'siempre-optimiza', label: 'Que el recurso adicional garantiza una nueva solución óptima.' },
      { value: 'infactible', label: 'Que el primal deja de ser factible.' },
    ],
    dualAnswer: 'sin-valor',
    sourceId: 'preguntas-teorico',
  },
  {
    title: 'Línea de ensamblado',
    objective: { x: 5, y: 6 },
    constraints: [
      { label: 'x + 2y <= 12', a: 1, b: 2, limit: 12 },
      { label: '3x + y <= 15', a: 3, b: 1, limit: 15 },
    ],
    vertices: [
      { label: 'A', x: 0, y: 0 },
      { label: 'B', x: 5, y: 0 },
      { label: 'C', x: 3.6, y: 4.2 },
      { label: 'D', x: 0, y: 6 },
    ],
    feasibleOrder: ['A', 'B', 'C', 'D'],
    optimalLabel: 'C',
    optimalReason: 'C equilibra ambos recursos activos y deja la mayor isoganancia dentro de la región.',
    dualPrompt: 'Cuando el dual valora ambos recursos con precio sombra positivo, ¿qué describe eso?',
    dualChoices: [
      { value: 'escasez', label: 'Que ambos recursos son escasos y empujan el valor óptimo.' },
      { value: 'redundancia', label: 'Que las restricciones son redundantes.' },
      { value: 'degeneracion', label: 'Que la base es degenerada por definición.' },
    ],
    dualAnswer: 'escasez',
    sourceId: 'preguntas-teorico',
  },
]

export function createPLScenario() {
  return structuredClone(scenarios[Math.floor(Math.random() * scenarios.length)])
}

export function objectiveValue(vertex: PLVertex, objective: PLScenario['objective']) {
  return vertex.x * objective.x + vertex.y * objective.y
}

export function getVertexByLabel(scenario: PLScenario, label: string) {
  return scenario.vertices.find((vertex) => vertex.label === label)
}

export function feasibleVertices(scenario: PLScenario) {
  return scenario.feasibleOrder
    .map((label) => getVertexByLabel(scenario, label))
    .filter((vertex): vertex is PLVertex => Boolean(vertex))
}

async function createBrowserGlpk(): Promise<GlpkLike> {
  const { default: GLPKFactory } = await import('glpk.js')
  return GLPKFactory()
}

export async function verifyPLScenarioWithGlpk(
  scenario: PLScenario,
  createGlpk: GlpkFactory = createBrowserGlpk,
): Promise<PLExternalVerification> {
  const glpk = await createGlpk()
  const lp: LP = {
    name: scenario.title,
    objective: {
      direction: glpk.GLP_MAX,
      name: 'Z',
      vars: [
        { name: 'x', coef: scenario.objective.x },
        { name: 'y', coef: scenario.objective.y },
      ],
    },
    subjectTo: scenario.constraints.map((constraint) => ({
      name: constraint.label,
      vars: [
        { name: 'x', coef: constraint.a },
        { name: 'y', coef: constraint.b },
      ],
      bnds: { type: glpk.GLP_UP, ub: constraint.limit, lb: 0 },
    })),
    bounds: [
      { name: 'x', type: glpk.GLP_LO, lb: 0, ub: 0 },
      { name: 'y', type: glpk.GLP_LO, lb: 0, ub: 0 },
    ],
  }

  const result = await glpk.solve(lp, { msglev: glpk.GLP_MSG_OFF })
  const optimalVertex = getVertexByLabel(scenario, scenario.optimalLabel)
  const expectedObjectiveValue = optimalVertex ? objectiveValue(optimalVertex, scenario.objective) : Number.NaN

  return {
    status: result.result.status,
    objectiveValue: result.result.z,
    variables: {
      x: result.result.vars.x ?? 0,
      y: result.result.vars.y ?? 0,
    },
    expectedObjectiveValue,
    matchesScenario: Math.abs(result.result.z - expectedObjectiveValue) <= 0.05,
  }
}
