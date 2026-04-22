import { describe, expect, it, vi } from 'vitest'
import {
  createNetworkScenario,
  dijkstraTrace,
  formatPath,
  isSpanningTree,
  minimumSpanningTreeTrace,
  selectedWeight,
  verifyNetworkWithGraphlib,
} from '../features/sala-5-redes/redesEngine'

describe('redesEngine', () => {
  it('encuentra el árbol de expansión mínima del primer escenario', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const scenario = createNetworkScenario()
    const trace = minimumSpanningTreeTrace(scenario.edges, scenario.nodes)

    expect(trace.accepted.map((edge) => edge.id)).toEqual(['BC', 'AC', 'DE', 'EF', 'BD'])
    expect(selectedWeight(trace.accepted)).toBe(13)
    expect(isSpanningTree(trace.accepted, scenario.nodes)).toBe(true)
  })

  it('corre Dijkstra y reconstruye la ruta mínima', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const scenario = createNetworkScenario()
    const result = dijkstraTrace(scenario)

    expect(result.cost).toBe(13)
    expect(result.path).toEqual(['A', 'C', 'B', 'D', 'E', 'F'])
    expect(formatPath(result.path)).toBe('A -> C -> B -> D -> E -> F')
    expect(result.rows.at(-1)?.distances.F).toBe(13)
  })

  it('contrasta Dijkstra y árbol mínimo con graphlib', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const scenario = createNetworkScenario()
    const verification = verifyNetworkWithGraphlib(scenario)

    expect(verification.matchesDijkstra).toBe(true)
    expect(verification.matchesMst).toBe(true)
    expect(verification.dijkstraCost).toBe(13)
    expect(verification.primCost).toBe(13)
  })
})
