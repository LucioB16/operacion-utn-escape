import { describe, expect, it, vi } from 'vitest'
import {
  analyzeIteration,
  basisChanges,
  createSimplexRoomScenario,
  deltaRange,
  objectiveValue,
  projectBasicSolution,
  projectObjective,
} from '../features/sala-2-simplex/simplexEngine'

describe('simplexEngine', () => {
  it('analiza una iteración y encuentra columna, fila y pivot correctos', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const scenario = createSimplexRoomScenario()
    const analysis = analyzeIteration(scenario.iteration)

    expect(objectiveValue(scenario.iteration)).toBe(12500)
    expect(analysis.reducedCosts).toEqual([0, -375, 0, 0])
    expect(analysis.entering?.variable).toBe('x2')
    expect(analysis.leaving?.basis).toBe('x1')
    expect(analysis.pivot).toBe(2.5)
    expect(analysis.nextTableau?.rows[1].rhs).toBe(20)
  })

  it('proyecta sensibilidad y detecta cuándo cambia la base', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const scenario = createSimplexRoomScenario()

    expect(deltaRange(scenario.sensitivity)).toEqual({ min: -10, max: 20 })
    expect(projectBasicSolution(scenario.sensitivity, 15)).toEqual([25, 5])
    expect(projectObjective(scenario.sensitivity, 15)).toBe(1150)
    expect(basisChanges(scenario.sensitivity, 25)).toBe(true)
  })
})
