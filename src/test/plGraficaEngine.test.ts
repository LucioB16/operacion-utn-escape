import { describe, expect, it, vi } from 'vitest'
import {
  createPLScenario,
  feasibleVertices,
  getVertexByLabel,
  objectiveValue,
  verifyPLScenarioWithGlpk,
} from '../features/sala-1-pl-grafica/plGraficaEngine'

describe('plGraficaEngine', () => {
  it('genera un escenario consistente y arma los vértices factibles en orden', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const scenario = createPLScenario()

    expect(scenario.title).toBe('Laboratorio de mezclas')
    expect(feasibleVertices(scenario).map((vertex) => vertex.label)).toEqual(['A', 'B', 'C', 'D'])
    expect(getVertexByLabel(scenario, 'C')?.x).toBe(6)
  })

  it('evalúa correctamente la función objetivo en un vértice', () => {
    const value = objectiveValue({ label: 'C', x: 6, y: 2 }, { x: 4, y: 5 })
    expect(value).toBe(34)
  })

  it('contrasta el óptimo con GLPK.js como verificador externo', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const scenario = createPLScenario()
    const { default: GLPKFactory } = await import('glpk.js/node')
    const verification = await verifyPLScenarioWithGlpk(scenario, GLPKFactory)

    expect(verification.matchesScenario).toBe(true)
    expect(verification.objectiveValue).toBeCloseTo(34, 2)
    expect(verification.variables.x).toBeCloseTo(6, 2)
    expect(verification.variables.y).toBeCloseTo(2, 2)
  })
})
