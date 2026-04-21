import { describe, expect, it, vi } from 'vitest'
import { createPLScenario, feasibleVertices, getVertexByLabel, objectiveValue } from '../features/sala-1-pl-grafica/plGraficaEngine'

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
})
