import { describe, expect, it } from 'vitest'
import { sourceIndex, sourceMap } from '../game/content/sourceMap'
import { DEFAULT_DECIMAL_TOLERANCE, withinTolerance } from '../game/utils/tolerance'

describe('tolerance and source map', () => {
  it('respeta la tolerancia decimal pedida por el juego', () => {
    expect(DEFAULT_DECIMAL_TOLERANCE).toBe(0.05)
    expect(withinTolerance(10.04, 10)).toBe(true)
    expect(withinTolerance(10.2, 10)).toBe(false)
  })

  it('marca fuentes excluidas y evita temas prohibidos como contenido principal', () => {
    expect(sourceIndex['excluidos-cpm-pert'].excluded).toBe(true)
    expect(sourceMap.some((entry) => entry.id.includes('transporte'))).toBe(false)
    expect(sourceMap.some((entry) => entry.id.includes('transbordo'))).toBe(false)
  })
})
