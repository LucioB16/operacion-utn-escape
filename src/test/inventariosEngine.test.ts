import { describe, expect, it, vi } from 'vitest'
import {
  bestQuantityDiscountPlan,
  buildInventoryBreakdown,
  createInventoryBundle,
  evaluateQuantityDiscount,
  modelFormula,
  optimalLotSize,
  optimalTotalCost,
  reorderPointRandomDemand,
  singlePeriodDemandBreakdown,
  singlePeriodOptimalOrder,
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

  it('resuelve demanda aleatoria con punto de pedido', () => {
    expect(reorderPointRandomDemand({
      prompt: 'Aleatoria',
      annualDemand: 9500,
      orderCost: 850,
      holdingCost: 5,
      meanDailyDemand: 32,
      stdDailyDemand: 6,
      leadTimeDays: 7,
      zValue: 1.28,
      sourceId: 'inventarios-cep',
    })).toBe(244.32)
  })

  it('calcula lote y desglose para escenario de demanda aleatoria', () => {
    const randomScenario = {
      model: 'demanda-aleatoria' as const,
      prompt: 'Aleatoria',
      demand: 9500,
      orderCost: 850,
      holdingCost: 5,
      meanDailyDemand: 32,
      stdDailyDemand: 6,
      leadTimeDays: 7,
      zValue: 1.28,
      sourceId: 'inventarios-cep',
    }

    expect(optimalLotSize(randomScenario)).toBe(1797.22)
    const breakdown = buildInventoryBreakdown(randomScenario)
    expect(breakdown.reorderPoint).toBe(244.32)
    expect(breakdown.safetyStock).toBe(20.32)
    expect(breakdown.totalCost).toBeGreaterThan(0)
  })

  it('elige el mejor tramo en descuento por cantidad', () => {
    const plan = bestQuantityDiscountPlan({
      prompt: 'Descuentos',
      annualDemand: 12000,
      orderCost: 600,
      carryingRate: 0.22,
      tiers: [
        { minQty: 1, unitCost: 48 },
        { minQty: 300, unitCost: 45 },
        { minQty: 700, unitCost: 42 },
      ],
      sourceId: 'inventarios-cep',
    })

    expect(plan.minQty).toBe(700)
    expect(plan.unitCost).toBe(42)
  })

  it('resuelve pedido único con demanda aleatoria discreta', () => {
    const exercise = {
      prompt: 'Diarios',
      purchaseCost: 25,
      salePrice: 35,
      demandDistribution: [
        { demand: 50, probability: 0.25 },
        { demand: 55, probability: 0.20 },
        { demand: 60, probability: 0.25 },
        { demand: 65, probability: 0.10 },
        { demand: 70, probability: 0.20 },
      ],
      sourceId: 'inventarios-aleatorio',
    }

    const breakdown = singlePeriodDemandBreakdown(exercise)

    expect(breakdown.criticalRatio).toBe(0.29)
    expect(breakdown.cumulativeRows.map((row) => row.cumulativeProbability)).toEqual([0.25, 0.45, 0.7, 0.8, 1])
    expect(singlePeriodOptimalOrder(exercise)).toBe(55)
  })

  it('calcula desglose para descuento por cantidad con costo de compra', () => {
    const breakdown = buildInventoryBreakdown({
      model: 'descuento-cantidad',
      prompt: 'Descuento',
      demand: 12000,
      orderCost: 600,
      holdingCost: 10,
      carryingRate: 0.22,
      discountTiers: [
        { minQty: 1, unitCost: 48 },
        { minQty: 300, unitCost: 45 },
        { minQty: 700, unitCost: 42 },
      ],
      sourceId: 'inventarios-cep',
    })

    expect(breakdown.purchaseCost).toBeGreaterThan(0)
    expect(breakdown.totalCost).toBeGreaterThan(breakdown.purchaseCost)
  })

  it('marca tramos factibles e infactibles en descuento', () => {
    const plan = evaluateQuantityDiscount({
      prompt: 'Tramos',
      annualDemand: 12000,
      orderCost: 600,
      carryingRate: 0.22,
      tiers: [
        { minQty: 1, unitCost: 48 },
        { minQty: 300, unitCost: 45 },
        { minQty: 700, unitCost: 42 },
      ],
      sourceId: 'inventarios-cep',
    })

    expect(plan.candidates.some((candidate) => candidate.feasibleInTier)).toBe(true)
    expect(plan.candidates.some((candidate) => !candidate.feasibleInTier)).toBe(true)
  })

  it('cubre fórmulas de todos los modelos', () => {
    expect(modelFormula({
      model: 'sin-ruptura',
      prompt: '',
      demand: 1,
      orderCost: 1,
      holdingCost: 1,
      sourceId: 'inventarios-cep',
    })).toContain('sqrt(2DS/H)')

    expect(modelFormula({
      model: 'con-ruptura',
      prompt: '',
      demand: 1,
      orderCost: 1,
      holdingCost: 1,
      sourceId: 'inventarios-cep',
    })).toContain('(H+P)')

    expect(modelFormula({
      model: 'reabastecimiento-uniforme',
      prompt: '',
      demand: 1,
      orderCost: 1,
      holdingCost: 1,
      sourceId: 'inventarios-reab',
    })).toContain('p/(p-d)')

    expect(modelFormula({
      model: 'demanda-aleatoria',
      prompt: '',
      demand: 1,
      orderCost: 1,
      holdingCost: 1,
      sourceId: 'inventarios-cep',
    })).toContain('R = dL')

    expect(modelFormula({
      model: 'descuento-cantidad',
      prompt: '',
      demand: 1,
      orderCost: 1,
      holdingCost: 1,
      sourceId: 'inventarios-cep',
    })).toContain('CT = DC')
  })

  it('usa fallback de parámetros opcionales sin romper cálculos', () => {
    const ruptureFallback = optimalLotSize({
      model: 'con-ruptura',
      prompt: '',
      demand: 1200,
      orderCost: 500,
      holdingCost: 4,
      sourceId: 'inventarios-cep',
    })
    const uniformFallback = optimalLotSize({
      model: 'reabastecimiento-uniforme',
      prompt: '',
      demand: 1200,
      orderCost: 500,
      holdingCost: 4,
      sourceId: 'inventarios-reab',
    })
    const discountFallback = buildInventoryBreakdown({
      model: 'descuento-cantidad',
      prompt: '',
      demand: 1200,
      orderCost: 500,
      holdingCost: 4,
      sourceId: 'inventarios-cep',
    })

    expect(ruptureFallback).toBeGreaterThan(0)
    expect(uniformFallback).toBeGreaterThan(0)
    expect(discountFallback.purchaseCost).toBeGreaterThanOrEqual(0)
  })

  it('genera bundle cuando clasificación y cálculo coinciden y cuando no coinciden', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)

    const bundle = createInventoryBundle()

    expect(bundle.classification.prompt).not.toBe(bundle.calculation.prompt)
    expect(bundle.randomDemandExercise.meanDailyDemand).toBeGreaterThan(0)
    expect(bundle.singlePeriodExercise.demandDistribution.length).toBeGreaterThan(1)
    expect(bundle.quantityDiscountExercise.tiers.length).toBeGreaterThan(1)

    randomSpy
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.4)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
    const bundleNoCollision = createInventoryBundle()
    expect(bundleNoCollision.classification.prompt).not.toBe('')
    expect(bundleNoCollision.calculation.prompt).not.toBe('')
  })
})
