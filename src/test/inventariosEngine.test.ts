import { describe, expect, it, vi } from 'vitest'
import {
  buildInventoryBreakdown,
  createInventoryBundle,
  modelFormula,
  optimalLotSize,
  optimalTotalCost,
} from '../features/sala-3-inventarios/inventariosEngine'

describe('inventariosEngine', () => {
  it('calcula Q* y costo total para CEP sin ruptura', () => {
    const scenario = {
      model: 'sin-ruptura' as const,
      prompt: 'Caso base',
      demand: 1200,
      orderCost: 1500,
      holdingCost: 8,
      sourceId: 'inventarios-cep',
    }

    expect(optimalLotSize(scenario)).toBe(670.82)
    expect(optimalTotalCost(scenario)).toBe(5366.56)
    expect(modelFormula(scenario)).toBe('Q* = sqrt(2DS/H)')
  })

  it('calcula desglose para modelo con ruptura y para reabastecimiento uniforme', () => {
    const rupture = buildInventoryBreakdown({
      model: 'con-ruptura',
      prompt: 'Ruptura',
      demand: 1600,
      orderCost: 1200,
      holdingCost: 6,
      shortageCost: 18,
      sourceId: 'inventarios-cep',
    })

    const uniform = buildInventoryBreakdown({
      model: 'reabastecimiento-uniforme',
      prompt: 'Uniforme',
      demand: 2400,
      orderCost: 1800,
      holdingCost: 7,
      productionRate: 4800,
      demandRate: 2400,
      sourceId: 'inventarios-reab',
    })

    expect(rupture.maxBackorder).toBeGreaterThan(0)
    expect(rupture.totalCost).toBe(4156.93)
    expect(uniform.maxInventory).toBe(785.59)
    expect(uniform.totalCost).toBe(5499.11)
  })

  it('genera un bundle con ejercicios distintos para clasificar y calcular', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)

    const bundle = createInventoryBundle()

    expect(bundle.classification.prompt).not.toBe(bundle.calculation.prompt)
    expect(bundle.ruptureDecision.answer).toBe('Conviene analizar ruptura')
  })
})
