import { describe, expect, it, vi } from 'vitest'
import {
  createForecastBundle,
  exponentialSmoothingNext,
  movingAverageForecast,
  movingAverageMAD,
  pessimisticDemandScenario,
  seasonalIndexRows,
  strongestSeason,
  weightedMovingAverage,
  weightedMovingAverageBreakdown,
} from '../features/sala-4-pronosticos/pronosticosEngine'

describe('pronosticosEngine', () => {
  it('resuelve promedio ponderado, suavizado y MAD sobre el primer bundle', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const bundle = createForecastBundle()

    expect(weightedMovingAverage(bundle.weightedSeries, bundle.weights)).toBe(14.7)
    expect(exponentialSmoothingNext(bundle.smoothingSeries, bundle.alpha, bundle.initialForecast)).toBe(33.92)
    expect(movingAverageForecast(bundle.movingAverageSeries, bundle.movingWindow)).toBe(35.33)
    expect(movingAverageMAD(bundle.movingAverageSeries, bundle.movingWindow)).toBe(3)
    expect(pessimisticDemandScenario(35.33, 3)).toBe(42.83)
  })

  it('arma desgloses útiles para feedback y detecta la estación dominante', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const bundle = createForecastBundle()

    expect(weightedMovingAverageBreakdown(bundle.weightedSeries, bundle.weights)).toEqual([
      { period: 't-2', value: 14, weight: 0.2, contribution: 2.8 },
      { period: 't-1', value: 13, weight: 0.3, contribution: 3.9 },
      { period: 't-0', value: 16, weight: 0.5, contribution: 8 },
    ])

    const seasonalRows = seasonalIndexRows(bundle.seasonalMatrix)
    expect(seasonalRows).toHaveLength(4)
    expect(strongestSeason(bundle.seasonalMatrix).season).toBe('T4')
  })
})
