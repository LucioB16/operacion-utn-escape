import type { LP, Options, Result } from 'glpk.js'

type OptimizationDirection = 'max' | 'min'

interface SimplexRow {
  basis: string
  cb: number
  rhs: number
  coefficients: number[]
}

export interface SimplexTableau {
  direction: OptimizationDirection
  columns: string[]
  objective: number[]
  rows: SimplexRow[]
}

export interface ThetaRow {
  basis: string
  coefficient: number
  theta: number | null
  rowIndex: number
}

export interface SensitivityScenario {
  baseObjective: number
  rhsLabels: string[]
  basicLabels: string[]
  basicSolution: number[]
  basisInverse: number[][]
  shadowPrices: number[]
  resourceIndex: number
  deltaInside: number
  deltaOutside: number
}

export interface SensitivityGlpkVerification {
  baseObjective: number
  projectedObjective: number
  impliedShadowPrice: number
  expectedBaseObjective: number
  expectedProjectedObjective: number
  expectedShadowPrice: number
  matchesBaseObjective: boolean
  matchesProjectedObjective: boolean
  matchesShadowPrice: boolean
}

interface GlpkLike {
  GLP_MAX: number
  GLP_UP: number
  GLP_LO: number
  GLP_MSG_OFF: number
  solve: (lp: LP, options?: number | Options) => Result | Promise<Result>
}

export type GlpkFactory = () => Promise<GlpkLike>

export interface SimplexRoomScenario {
  iteration: SimplexTableau
  sensitivity: SensitivityScenario
}

const EPSILON = 1e-9

function round2(value: number) {
  return Math.round(value * 100) / 100
}

function round6(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000
}

export function objectiveValue(tableau: SimplexTableau) {
  return round2(tableau.rows.reduce((total, row) => total + row.cb * row.rhs, 0))
}

export function computeZj(tableau: SimplexTableau) {
  return tableau.columns.map((_, columnIndex) => round2(
    tableau.rows.reduce((total, row) => total + row.cb * row.coefficients[columnIndex], 0),
  ))
}

export function computeReducedCosts(tableau: SimplexTableau) {
  const zj = computeZj(tableau)
  return tableau.objective.map((coefficient, index) => round2(coefficient - zj[index]))
}

export function pickEnteringVariable(tableau: SimplexTableau) {
  const reducedCosts = computeReducedCosts(tableau)
  const candidates = reducedCosts
    .map((value, index) => ({ value, index, variable: tableau.columns[index] }))
    .filter((candidate) => (
      tableau.direction === 'max'
        ? candidate.value > EPSILON
        : candidate.value < -EPSILON
    ))

  if (candidates.length === 0) {
    return null
  }

  return tableau.direction === 'max'
    ? candidates.reduce((best, current) => (current.value > best.value ? current : best))
    : candidates.reduce((best, current) => (current.value < best.value ? current : best))
}

export function computeThetaRows(tableau: SimplexTableau, enteringIndex: number): ThetaRow[] {
  return tableau.rows.map((row, rowIndex) => {
    const coefficient = row.coefficients[enteringIndex]
    const theta = coefficient > EPSILON ? round2(row.rhs / coefficient) : null

    return {
      basis: row.basis,
      coefficient: round2(coefficient),
      theta,
      rowIndex,
    }
  })
}

export function pickLeavingRow(thetaRows: ThetaRow[]) {
  const feasibleRows = thetaRows.filter((row) => row.theta !== null)

  if (feasibleRows.length === 0) {
    return null
  }

  return feasibleRows.reduce((best, current) => ((current.theta ?? Infinity) < (best.theta ?? Infinity) ? current : best))
}

export function pivotValue(tableau: SimplexTableau, pivotRowIndex: number, pivotColumnIndex: number) {
  return round2(tableau.rows[pivotRowIndex].coefficients[pivotColumnIndex])
}

export function pivotTableau(tableau: SimplexTableau, pivotRowIndex: number, pivotColumnIndex: number) {
  const pivot = pivotValue(tableau, pivotRowIndex, pivotColumnIndex)
  const normalizedPivot = {
    ...tableau.rows[pivotRowIndex],
    basis: tableau.columns[pivotColumnIndex],
    cb: tableau.objective[pivotColumnIndex],
    rhs: round2(tableau.rows[pivotRowIndex].rhs / pivot),
    coefficients: tableau.rows[pivotRowIndex].coefficients.map((coefficient) => round2(coefficient / pivot)),
  }

  const rows = tableau.rows.map((row, rowIndex) => {
    if (rowIndex === pivotRowIndex) {
      return normalizedPivot
    }

    const factor = row.coefficients[pivotColumnIndex]

    return {
      ...row,
      rhs: round2(row.rhs - factor * normalizedPivot.rhs),
      coefficients: row.coefficients.map((coefficient, columnIndex) => round2(
        coefficient - factor * normalizedPivot.coefficients[columnIndex],
      )),
    }
  })

  return {
    ...tableau,
    rows,
  }
}

export function analyzeIteration(tableau: SimplexTableau) {
  const reducedCosts = computeReducedCosts(tableau)
  const entering = pickEnteringVariable(tableau)
  const thetaRows = entering ? computeThetaRows(tableau, entering.index) : []
  const leaving = thetaRows.length > 0 ? pickLeavingRow(thetaRows) : null
  const pivot = entering && leaving ? pivotValue(tableau, leaving.rowIndex, entering.index) : null
  const nextTableau = entering && leaving ? pivotTableau(tableau, leaving.rowIndex, entering.index) : null

  return {
    reducedCosts,
    entering,
    thetaRows,
    leaving,
    pivot,
    nextTableau,
  }
}

export function deltaRange(scenario: SensitivityScenario) {
  const directionColumn = scenario.basisInverse.map((row) => row[scenario.resourceIndex])
  let min = -Infinity
  let max = Infinity

  directionColumn.forEach((coefficient, index) => {
    if (Math.abs(coefficient) < EPSILON) {
      return
    }

    const bound = -scenario.basicSolution[index] / coefficient

    if (coefficient > 0) {
      min = Math.max(min, bound)
    } else {
      max = Math.min(max, bound)
    }
  })

  return {
    min: round2(min),
    max: round2(max),
  }
}

export function projectBasicSolution(scenario: SensitivityScenario, delta: number) {
  return scenario.basicSolution.map((value, index) => {
    const adjustment = scenario.basisInverse[index][scenario.resourceIndex] * delta
    return round2(value + adjustment)
  })
}

export function projectObjective(scenario: SensitivityScenario, delta: number) {
  return round2(scenario.baseObjective + scenario.shadowPrices[scenario.resourceIndex] * delta)
}

export function basisChanges(scenario: SensitivityScenario, delta: number) {
  const range = deltaRange(scenario)
  return delta < range.min - EPSILON || delta > range.max + EPSILON
}

function invert2x2(matrix: number[][]) {
  const [[a, b], [c, d]] = matrix
  const determinant = a * d - b * c

  if (Math.abs(determinant) < EPSILON) {
    throw new Error('La matriz de base no es invertible.')
  }

  return [
    [d / determinant, -b / determinant],
    [-c / determinant, a / determinant],
  ]
}

function multiplyMatrixVector(matrix: number[][], vector: number[]) {
  return matrix.map((row) => row.reduce((total, value, index) => total + value * vector[index], 0))
}

function multiplyRowVectorMatrix(vector: number[], matrix: number[][]) {
  return matrix[0].map((_, columnIndex) => (
    vector.reduce((total, value, rowIndex) => total + value * matrix[rowIndex][columnIndex], 0)
  ))
}

function createSensitivityLp(scenario: SensitivityScenario, rhsDelta = 0, glpk: GlpkLike): LP {
  const basisMatrix = invert2x2(scenario.basisInverse)
  const baseRhs = multiplyMatrixVector(basisMatrix, scenario.basicSolution)
  const objective = multiplyRowVectorMatrix(scenario.shadowPrices, basisMatrix)
  const rhs = baseRhs.map((value, index) => (
    index === scenario.resourceIndex ? value + rhsDelta : value
  ))

  return {
    name: `sensibilidad-${scenario.rhsLabels[scenario.resourceIndex]}`,
    objective: {
      direction: glpk.GLP_MAX,
      name: 'Z',
      vars: scenario.basicLabels.map((label, index) => ({
        name: label,
        coef: objective[index],
      })),
    },
    subjectTo: basisMatrix.map((row, index) => ({
      name: scenario.rhsLabels[index],
      vars: scenario.basicLabels.map((label, columnIndex) => ({
        name: label,
        coef: row[columnIndex],
      })),
      bnds: { type: glpk.GLP_UP, ub: rhs[index], lb: 0 },
    })),
    bounds: scenario.basicLabels.map((label) => ({
      name: label,
      type: glpk.GLP_LO,
      lb: 0,
      ub: 0,
    })),
  }
}

async function createBrowserGlpk(): Promise<GlpkLike> {
  const { default: GLPKFactory } = await import('glpk.js')
  return GLPKFactory()
}

export async function verifySensitivityWithGlpk(
  scenario: SensitivityScenario,
  createGlpk: GlpkFactory = createBrowserGlpk,
): Promise<SensitivityGlpkVerification> {
  const glpk = await createGlpk()
  const baseResult = await glpk.solve(createSensitivityLp(scenario, 0, glpk), { msglev: glpk.GLP_MSG_OFF })
  const projectedResult = await glpk.solve(createSensitivityLp(scenario, scenario.deltaInside, glpk), { msglev: glpk.GLP_MSG_OFF })
  const baseObjective = round6(baseResult.result.z)
  const projectedObjective = round6(projectedResult.result.z)
  const expectedBaseObjective = round6(scenario.baseObjective)
  const expectedProjectedObjective = round6(projectObjective(scenario, scenario.deltaInside))
  const impliedShadowPrice = round6((projectedObjective - baseObjective) / scenario.deltaInside)
  const expectedShadowPrice = round6(scenario.shadowPrices[scenario.resourceIndex])

  return {
    baseObjective,
    projectedObjective,
    impliedShadowPrice,
    expectedBaseObjective,
    expectedProjectedObjective,
    expectedShadowPrice,
    matchesBaseObjective: Math.abs(baseObjective - expectedBaseObjective) <= 0.05,
    matchesProjectedObjective: Math.abs(projectedObjective - expectedProjectedObjective) <= 0.05,
    matchesShadowPrice: Math.abs(impliedShadowPrice - expectedShadowPrice) <= 0.05,
  }
}

const scenarioPairs: SimplexRoomScenario[] = [
  {
    iteration: {
      direction: 'min',
      columns: ['x1', 'x2', 's1', 's2'],
      objective: [250, 250, 0, 0],
      rows: [
        { basis: 's1', cb: 0, rhs: 1050, coefficients: [0, -57.5, 1, 0] },
        { basis: 'x1', cb: 250, rhs: 50, coefficients: [1, 2.5, 0, 0] },
        { basis: 's2', cb: 0, rhs: 60, coefficients: [0, 1, 0, 1] },
      ],
    },
    sensitivity: {
      baseObjective: 1000,
      rhsLabels: ['R1', 'R2'],
      basicLabels: ['x1', 'x2'],
      basicSolution: [10, 20],
      basisInverse: [
        [1, -1],
        [-1, 2],
      ],
      shadowPrices: [10, 20],
      resourceIndex: 0,
      deltaInside: 15,
      deltaOutside: 25,
    },
  },
  {
    iteration: {
      direction: 'max',
      columns: ['x1', 'x2', 's1', 's2'],
      objective: [40, 30, 0, 0],
      rows: [
        { basis: 's1', cb: 0, rhs: 40, coefficients: [2, 1, 1, 0] },
        { basis: 's2', cb: 0, rhs: 30, coefficients: [1, 1, 0, 1] },
      ],
    },
    sensitivity: {
      baseObjective: 960,
      rhsLabels: ['R1', 'R2'],
      basicLabels: ['x1', 'x2'],
      basicSolution: [8, 12],
      basisInverse: [
        [1, 0.25],
        [-0.5, 1],
      ],
      shadowPrices: [14, 12],
      resourceIndex: 0,
      deltaInside: 6,
      deltaOutside: 24,
    },
  },
  {
    iteration: {
      direction: 'max',
      columns: ['x1', 'x2', 's1', 's2'],
      objective: [30, 20, 0, 0],
      rows: [
        { basis: 's1', cb: 0, rhs: 24, coefficients: [2, 1, 1, 0] },
        { basis: 's2', cb: 0, rhs: 18, coefficients: [1, 3, 0, 1] },
      ],
    },
    sensitivity: {
      baseObjective: 720,
      rhsLabels: ['R1', 'R2'],
      basicLabels: ['x1', 'x2'],
      basicSolution: [6, 4],
      basisInverse: [
        [0.6, -0.2],
        [-0.2, 0.4],
      ],
      shadowPrices: [8, 12],
      resourceIndex: 1,
      deltaInside: 5,
      deltaOutside: 35,
    },
  },
  {
    iteration: {
      direction: 'min',
      columns: ['x1', 'x2', 's1', 's2'],
      objective: [180, 240, 0, 0],
      rows: [
        { basis: 's1', cb: 0, rhs: 600, coefficients: [0, -20, 1, 0] },
        { basis: 'x1', cb: 180, rhs: 30, coefficients: [1, 1.5, 0, 0] },
        { basis: 's2', cb: 0, rhs: 120, coefficients: [0, 3, 0, 1] },
      ],
    },
    sensitivity: {
      baseObjective: 5400,
      rhsLabels: ['R1', 'R2'],
      basicLabels: ['x1', 'x2'],
      basicSolution: [12, 18],
      basisInverse: [
        [0.5, -0.25],
        [-0.5, 0.75],
      ],
      shadowPrices: [16, 22],
      resourceIndex: 1,
      deltaInside: 10,
      deltaOutside: 40,
    },
  },
]

export function createSimplexRoomScenario() {
  return structuredClone(scenarioPairs[Math.floor(Math.random() * scenarioPairs.length)])
}
