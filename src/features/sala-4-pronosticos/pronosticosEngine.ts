export interface ForecastBundle {
  weightedSeries: number[]
  weights: number[]
  smoothingSeries: number[]
  alpha: number
  initialForecast: number
  movingAverageSeries: number[]
  movingWindow: number
  seasonalMatrix: number[][]
}

export interface WeightedContribution {
  period: string
  value: number
  weight: number
  contribution: number
}

export interface SmoothingTraceRow {
  period: string
  actual: number
  previousForecast: number
  nextForecast: number
}

export interface MovingAverageTraceRow {
  period: string
  actual: number
  forecast: number
  absoluteError: number
}

export interface SeasonalIndexRow {
  season: string
  average: number
  index: number
}

function round2(value: number) {
  return Math.round(value * 100) / 100
}

export function weightedMovingAverage(series: number[], weights: number[]) {
  const window = series.slice(series.length - weights.length)
  return round2(window.reduce((total, value, index) => total + value * weights[index], 0))
}

export function weightedMovingAverageBreakdown(series: number[], weights: number[]): WeightedContribution[] {
  const window = series.slice(series.length - weights.length)

  return window.map((value, index) => ({
    period: `t-${weights.length - index - 1}`,
    value,
    weight: weights[index],
    contribution: round2(value * weights[index]),
  }))
}

export function exponentialSmoothingTrace(series: number[], alpha: number, initialForecast: number): SmoothingTraceRow[] {
  let forecast = initialForecast

  return series.map((actual, index) => {
    const previousForecast = round2(forecast)
    forecast = round2(alpha * actual + (1 - alpha) * forecast)

    return {
      period: `t${index + 1}`,
      actual,
      previousForecast,
      nextForecast: forecast,
    }
  })
}

export function exponentialSmoothingNext(series: number[], alpha: number, initialForecast: number) {
  const trace = exponentialSmoothingTrace(series, alpha, initialForecast)
  return trace.at(-1)?.nextForecast ?? round2(initialForecast)
}

export function movingAverageForecast(series: number[], window: number) {
  const values = series.slice(series.length - window)
  return round2(values.reduce((total, value) => total + value, 0) / values.length)
}

export function movingAverageErrorTable(series: number[], window: number): MovingAverageTraceRow[] {
  const rows: MovingAverageTraceRow[] = []

  for (let index = window; index < series.length; index += 1) {
    const forecast = movingAverageForecast(series.slice(0, index), window)
    rows.push({
      period: `t${index + 1}`,
      actual: series[index],
      forecast,
      absoluteError: round2(Math.abs(series[index] - forecast)),
    })
  }

  return rows
}

export function movingAverageMAD(series: number[], window: number) {
  const rows = movingAverageErrorTable(series, window)
  return round2(rows.reduce((total, row) => total + row.absoluteError, 0) / rows.length)
}

export function pessimisticDemandScenario(forecast: number, mad: number) {
  return round2(forecast + 2.5 * mad)
}

export function seasonalIndicesByAverage(matrix: number[][]) {
  const flattened = matrix.flat()
  const grandAverage = flattened.reduce((total, value) => total + value, 0) / flattened.length

  return matrix[0].map((_, seasonIndex) => {
    const seasonAverage = matrix.reduce((total, row) => total + row[seasonIndex], 0) / matrix.length
    return round2(seasonAverage / grandAverage)
  })
}

export function seasonalIndexRows(matrix: number[][]): SeasonalIndexRow[] {
  const indices = seasonalIndicesByAverage(matrix)

  return indices.map((index, seasonIndex) => {
    const average = round2(matrix.reduce((total, row) => total + row[seasonIndex], 0) / matrix.length)

    return {
      season: `T${seasonIndex + 1}`,
      average,
      index,
    }
  })
}

export function strongestSeason(matrix: number[][]) {
  return seasonalIndexRows(matrix).reduce((best, current) => (current.index > best.index ? current : best))
}

const bundles: ForecastBundle[] = [
  {
    weightedSeries: [20, 21, 15, 14, 13, 16],
    weights: [0.2, 0.3, 0.5],
    smoothingSeries: [30, 32, 30, 39, 33, 34],
    alpha: 0.5,
    initialForecast: 29,
    movingAverageSeries: [30, 32, 30, 39, 33, 34],
    movingWindow: 3,
    seasonalMatrix: [
      [120, 150, 190, 230],
      [140, 175, 220, 260],
      [155, 195, 245, 290],
    ],
  },
  {
    weightedSeries: [36, 34, 35, 37, 34, 33],
    weights: [0.2, 0.3, 0.5],
    smoothingSeries: [18, 20, 21, 19, 25, 24],
    alpha: 0.4,
    initialForecast: 17,
    movingAverageSeries: [22, 24, 21, 27, 25, 29],
    movingWindow: 3,
    seasonalMatrix: [
      [80, 115, 150, 170],
      [95, 120, 160, 182],
      [102, 128, 168, 190],
    ],
  },
  {
    weightedSeries: [44, 41, 39, 40, 46, 50],
    weights: [0.1, 0.3, 0.6],
    smoothingSeries: [55, 58, 57, 61, 63, 62],
    alpha: 0.35,
    initialForecast: 54,
    movingAverageSeries: [42, 45, 47, 46, 50, 52, 51],
    movingWindow: 4,
    seasonalMatrix: [
      [210, 260, 330, 390],
      [225, 278, 345, 405],
      [240, 290, 360, 420],
    ],
  },
  {
    weightedSeries: [70, 68, 71, 73, 75, 74],
    weights: [0.25, 0.25, 0.5],
    smoothingSeries: [62, 64, 63, 66, 69, 71],
    alpha: 0.45,
    initialForecast: 60,
    movingAverageSeries: [58, 60, 61, 65, 67, 70, 72],
    movingWindow: 3,
    seasonalMatrix: [
      [150, 185, 210, 240],
      [158, 190, 225, 250],
      [165, 198, 232, 264],
    ],
  },
  {
    weightedSeries: [3600, 3400, 3500, 3700, 3400, 3300, 3850, 3600, 3500, 3250, 3400, 3300],
    weights: [0.2, 0.3, 0.5],
    smoothingSeries: [3600, 3400, 3500, 3700, 3400, 3300, 3850, 3600, 3500, 3250, 3400, 3300],
    alpha: 0.7,
    initialForecast: 2600,
    movingAverageSeries: [30, 32, 30, 39, 33, 34, 34, 38, 36, 39, 30, 36],
    movingWindow: 3,
    seasonalMatrix: [
      [10, 70, 120, 30],
      [11, 65, 135, 38],
      [12, 72, 155, 50],
    ],
  },
  {
    weightedSeries: [185.72, 167.84, 205.11, 210.36, 255.57, 261.19],
    weights: [0.2, 0.3, 0.5],
    smoothingSeries: [185.72, 167.84, 205.11, 210.36, 255.57, 261.19],
    alpha: 0.4,
    initialForecast: 185.72,
    movingAverageSeries: [205, 251, 304, 295, 352, 335, 320, 350, 365, 350, 385, 410],
    movingWindow: 4,
    seasonalMatrix: [
      [25, 28, 35, 50],
      [60, 60, 40, 35],
      [30, 25, 25, 20],
    ],
  },
]

export function createForecastBundle() {
  return structuredClone(bundles[Math.floor(Math.random() * bundles.length)])
}
