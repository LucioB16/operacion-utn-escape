export type InventoryModel =
  | 'sin-ruptura'
  | 'con-ruptura'
  | 'reabastecimiento-uniforme'
  | 'demanda-aleatoria'
  | 'descuento-cantidad'

export interface QuantityDiscountTier {
  minQty: number
  unitCost: number
}

export interface InventoryScenario {
  model: InventoryModel
  prompt: string
  demand: number
  orderCost: number
  holdingCost: number
  shortageCost?: number
  productionRate?: number
  demandRate?: number
  meanDailyDemand?: number
  stdDailyDemand?: number
  leadTimeDays?: number
  zValue?: number
  carryingRate?: number
  discountTiers?: QuantityDiscountTier[]
  sourceId: string
}

export interface RandomDemandExercise {
  prompt: string
  annualDemand: number
  orderCost: number
  holdingCost: number
  meanDailyDemand: number
  stdDailyDemand: number
  leadTimeDays: number
  zValue: number
  sourceId: string
}

export interface QuantityDiscountExercise {
  prompt: string
  annualDemand: number
  orderCost: number
  carryingRate: number
  tiers: QuantityDiscountTier[]
  sourceId: string
}

export interface QuantityDiscountCandidate {
  minQty: number
  unitCost: number
  eoq: number
  feasibleInTier: boolean
  evaluatedQty: number
  totalCost: number
}

export interface QuantityDiscountPlan {
  best: QuantityDiscountCandidate
  candidates: QuantityDiscountCandidate[]
}

export interface InventoryBundle {
  classification: InventoryScenario
  calculation: InventoryScenario
  ruptureDecision: {
    prompt: string
    answer: 'Conviene analizar ruptura' | 'No conviene ruptura'
  }
  randomDemandExercise: RandomDemandExercise
  quantityDiscountExercise: QuantityDiscountExercise
}

export interface InventoryBreakdown {
  orderCost: number
  holdingCost: number
  shortageCost: number
  purchaseCost: number
  totalCost: number
  maxInventory: number
  maxBackorder: number
  safetyStock: number
  reorderPoint: number
}

export interface RandomDemandBreakdown {
  lotSize: number
  safetyStock: number
  reorderPoint: number
  orderCost: number
  holdingCost: number
  totalRelevantCost: number
}

const DEFAULT_CARRYING_RATE = 0.25

const inventoryScenarios: InventoryScenario[] = [
  {
    model: 'sin-ruptura',
    prompt: 'La demanda es constante, el pedido llega completo en un solo lote y la empresa no acepta faltantes.',
    demand: 1200,
    orderCost: 1500,
    holdingCost: 8,
    sourceId: 'inventarios-cep',
  },
  {
    model: 'sin-ruptura',
    prompt: 'No hay pedidos pendientes permitidos y el abastecimiento ingresa instantáneamente.',
    demand: 1800,
    orderCost: 2200,
    holdingCost: 9,
    sourceId: 'inventarios-cep',
  },
  {
    model: 'con-ruptura',
    prompt: 'Hay demanda conocida, pedidos pendientes permitidos y un costo explícito por ruptura planeada.',
    demand: 1600,
    orderCost: 1200,
    holdingCost: 6,
    shortageCost: 18,
    sourceId: 'inventarios-cep',
  },
  {
    model: 'con-ruptura',
    prompt: 'El sistema admite faltantes planeados y el costo de ruptura es menor que el de sostener mucho stock.',
    demand: 2200,
    orderCost: 900,
    holdingCost: 5,
    shortageCost: 14,
    sourceId: 'inventarios-cep',
  },
  {
    model: 'reabastecimiento-uniforme',
    prompt: 'La producción repone en forma gradual y la tasa de producción supera a la tasa de demanda.',
    demand: 2400,
    orderCost: 1800,
    holdingCost: 7,
    productionRate: 4800,
    demandRate: 2400,
    sourceId: 'inventarios-reab',
  },
  {
    model: 'reabastecimiento-uniforme',
    prompt: 'El stock se fabrica internamente, entra de forma paulatina y nunca toda la cantidad de una sola vez.',
    demand: 3000,
    orderCost: 2000,
    holdingCost: 6,
    productionRate: 6000,
    demandRate: 3000,
    sourceId: 'inventarios-reab',
  },
  {
    model: 'demanda-aleatoria',
    prompt: 'La demanda diaria es incierta durante el lead time y necesitás punto de pedido con stock de seguridad.',
    demand: 9500,
    orderCost: 850,
    holdingCost: 5,
    meanDailyDemand: 32,
    stdDailyDemand: 6,
    leadTimeDays: 7,
    zValue: 1.28,
    sourceId: 'inventarios-cep',
  },
  {
    model: 'descuento-cantidad',
    prompt: 'El proveedor ofrece precios escalonados por cantidad y hay que evaluar el costo total por tramo.',
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
  },
]

const rupturePrompts: InventoryBundle['ruptureDecision'][] = [
  {
    prompt: 'Pedidos pendientes permitidos, costo de ruptura $5 y costo de mantenimiento $14. ¿Tiene sentido analizar una política con ruptura?',
    answer: 'Conviene analizar ruptura',
  },
  {
    prompt: 'No se admite demanda insatisfecha y la empresa penaliza fuertemente cualquier faltante. ¿Conviene usar el modelo con ruptura?',
    answer: 'No conviene ruptura',
  },
  {
    prompt: 'El costo por faltante planeado es bajo y el sistema puede operar con pedidos pendientes. ¿Vale la pena revisar el modelo con ruptura?',
    answer: 'Conviene analizar ruptura',
  },
]

const randomDemandExercises: RandomDemandExercise[] = [
  {
    prompt: 'Con demanda diaria media 32, desviación 6, lead time 7 días y z = 1.28, calculá el punto de pedido.',
    annualDemand: 9500,
    orderCost: 850,
    holdingCost: 5,
    meanDailyDemand: 32,
    stdDailyDemand: 6,
    leadTimeDays: 7,
    zValue: 1.28,
    sourceId: 'inventarios-cep',
  },
  {
    prompt: 'Con demanda diaria media 45, desviación 9, lead time 5 días y z = 1.65, calculá el punto de pedido.',
    annualDemand: 12000,
    orderCost: 920,
    holdingCost: 6,
    meanDailyDemand: 45,
    stdDailyDemand: 9,
    leadTimeDays: 5,
    zValue: 1.65,
    sourceId: 'inventarios-cep',
  },
]

const quantityDiscountExercises: QuantityDiscountExercise[] = [
  {
    prompt: 'Elegí el tramo de precio más conveniente evaluando costo total anual.',
    annualDemand: 12000,
    orderCost: 600,
    carryingRate: 0.22,
    tiers: [
      { minQty: 1, unitCost: 48 },
      { minQty: 300, unitCost: 45 },
      { minQty: 700, unitCost: 42 },
    ],
    sourceId: 'inventarios-cep',
  },
  {
    prompt: 'Compará tramos de descuento y elegí el de menor costo total.',
    annualDemand: 9000,
    orderCost: 500,
    carryingRate: 0.2,
    tiers: [
      { minQty: 1, unitCost: 52 },
      { minQty: 250, unitCost: 49 },
      { minQty: 600, unitCost: 46 },
    ],
    sourceId: 'inventarios-cep',
  },
]

function round2(value: number) {
  return Math.round(value * 100) / 100
}

function evaluateDiscountPlanFromInputs(
  demand: number,
  orderCost: number,
  carryingRate: number,
  tiers: QuantityDiscountTier[],
): QuantityDiscountPlan {
  const orderedTiers = [...tiers].sort((left, right) => left.minQty - right.minQty)

  const candidates = orderedTiers.map((tier, index) => {
    const upperBound = index < orderedTiers.length - 1 ? orderedTiers[index + 1].minQty - 1e-6 : Number.POSITIVE_INFINITY
    const holdingRate = carryingRate * tier.unitCost
    const eoqRaw = Math.sqrt((2 * demand * orderCost) / holdingRate)
    const feasibleInTier = eoqRaw >= tier.minQty && eoqRaw <= upperBound
    const evaluatedQtyRaw = feasibleInTier ? eoqRaw : tier.minQty
    const totalCostRaw = (demand * tier.unitCost)
      + ((demand / evaluatedQtyRaw) * orderCost)
      + ((evaluatedQtyRaw / 2) * holdingRate)

    return {
      minQty: tier.minQty,
      unitCost: tier.unitCost,
      eoq: round2(eoqRaw),
      feasibleInTier,
      evaluatedQty: round2(evaluatedQtyRaw),
      totalCost: round2(totalCostRaw),
    }
  })

  const best = candidates.reduce((bestCandidate, currentCandidate) => (
    currentCandidate.totalCost < bestCandidate.totalCost ? currentCandidate : bestCandidate
  ))

  return { best, candidates }
}

function discountPlanForScenario(scenario: InventoryScenario): QuantityDiscountPlan {
  return evaluateDiscountPlanFromInputs(
    scenario.demand,
    scenario.orderCost,
    scenario.carryingRate ?? DEFAULT_CARRYING_RATE,
    scenario.discountTiers ?? [{ minQty: 1, unitCost: scenario.holdingCost }],
  )
}

export function randomDemandBreakdown(exercise: RandomDemandExercise): RandomDemandBreakdown {
  const lotSize = round2(Math.sqrt((2 * exercise.annualDemand * exercise.orderCost) / exercise.holdingCost))
  const safetyStock = round2(exercise.zValue * exercise.stdDailyDemand * Math.sqrt(exercise.leadTimeDays))
  const reorderPoint = round2((exercise.meanDailyDemand * exercise.leadTimeDays) + safetyStock)
  const orderCost = round2((exercise.annualDemand / lotSize) * exercise.orderCost)
  const holdingCost = round2(exercise.holdingCost * ((lotSize / 2) + safetyStock))

  return {
    lotSize,
    safetyStock,
    reorderPoint,
    orderCost,
    holdingCost,
    totalRelevantCost: round2(orderCost + holdingCost),
  }
}

export function reorderPointRandomDemand(exercise: RandomDemandExercise) {
  return randomDemandBreakdown(exercise).reorderPoint
}

export function evaluateQuantityDiscount(exercise: QuantityDiscountExercise): QuantityDiscountPlan {
  return evaluateDiscountPlanFromInputs(
    exercise.annualDemand,
    exercise.orderCost,
    exercise.carryingRate,
    exercise.tiers,
  )
}

export function bestQuantityDiscountPlan(exercise: QuantityDiscountExercise) {
  return evaluateQuantityDiscount(exercise).best
}

export function optimalLotSize(scenario: InventoryScenario) {
  if (scenario.model === 'sin-ruptura' || scenario.model === 'demanda-aleatoria') {
    return round2(Math.sqrt((2 * scenario.demand * scenario.orderCost) / scenario.holdingCost))
  }

  if (scenario.model === 'con-ruptura') {
    const shortageCost = scenario.shortageCost ?? 1
    return round2(Math.sqrt(
      (2 * scenario.demand * scenario.orderCost * (scenario.holdingCost + shortageCost))
      / (scenario.holdingCost * shortageCost),
    ))
  }

  if (scenario.model === 'descuento-cantidad') {
    return discountPlanForScenario(scenario).best.evaluatedQty
  }

  const demandRate = scenario.demandRate ?? 1
  const productionRate = scenario.productionRate ?? demandRate + 1
  return round2(Math.sqrt(
    ((2 * scenario.demand * scenario.orderCost) / scenario.holdingCost) * (productionRate / (productionRate - demandRate)),
  ))
}

export function buildInventoryBreakdown(scenario: InventoryScenario): InventoryBreakdown {
  const q = optimalLotSize(scenario)

  if (scenario.model === 'sin-ruptura') {
    const orderCost = round2((scenario.demand / q) * scenario.orderCost)
    const holdingCost = round2((q / 2) * scenario.holdingCost)
    return {
      orderCost,
      holdingCost,
      shortageCost: 0,
      purchaseCost: 0,
      totalCost: round2(orderCost + holdingCost),
      maxInventory: round2(q),
      maxBackorder: 0,
      safetyStock: 0,
      reorderPoint: 0,
    }
  }

  if (scenario.model === 'con-ruptura') {
    const shortageCostRate = scenario.shortageCost ?? 1
    const maxInventory = round2((q * shortageCostRate) / (scenario.holdingCost + shortageCostRate))
    const maxBackorder = round2(q - maxInventory)
    const orderCost = round2((scenario.demand / q) * scenario.orderCost)
    const holdingCost = round2(scenario.holdingCost * ((maxInventory ** 2) / (2 * q)))
    const shortageCost = round2(shortageCostRate * ((maxBackorder ** 2) / (2 * q)))

    return {
      orderCost,
      holdingCost,
      shortageCost,
      purchaseCost: 0,
      totalCost: round2(orderCost + holdingCost + shortageCost),
      maxInventory,
      maxBackorder,
      safetyStock: 0,
      reorderPoint: 0,
    }
  }

  if (scenario.model === 'reabastecimiento-uniforme') {
    const demandRate = scenario.demandRate ?? 1
    const productionRate = scenario.productionRate ?? demandRate + 1
    const maxInventory = round2(q * (1 - demandRate / productionRate))
    const orderCost = round2((scenario.demand / q) * scenario.orderCost)
    const holdingCost = round2((maxInventory / 2) * scenario.holdingCost)

    return {
      orderCost,
      holdingCost,
      shortageCost: 0,
      purchaseCost: 0,
      totalCost: round2(orderCost + holdingCost),
      maxInventory,
      maxBackorder: 0,
      safetyStock: 0,
      reorderPoint: 0,
    }
  }

  if (scenario.model === 'demanda-aleatoria') {
    const meanDailyDemand = scenario.meanDailyDemand ?? 0
    const stdDailyDemand = scenario.stdDailyDemand ?? 0
    const leadTimeDays = scenario.leadTimeDays ?? 0
    const zValue = scenario.zValue ?? 0
    const safetyStock = round2(zValue * stdDailyDemand * Math.sqrt(leadTimeDays))
    const reorderPoint = round2((meanDailyDemand * leadTimeDays) + safetyStock)
    const orderCost = round2((scenario.demand / q) * scenario.orderCost)
    const holdingCost = round2(scenario.holdingCost * ((q / 2) + safetyStock))

    return {
      orderCost,
      holdingCost,
      shortageCost: 0,
      purchaseCost: 0,
      totalCost: round2(orderCost + holdingCost),
      maxInventory: round2(q + safetyStock),
      maxBackorder: 0,
      safetyStock,
      reorderPoint,
    }
  }

  const plan = discountPlanForScenario(scenario)
  const selectedTier = (scenario.discountTiers ?? [])[0]
  const selectedUnitCost = plan.best.unitCost ?? selectedTier?.unitCost ?? 0
  const carryingRate = scenario.carryingRate ?? DEFAULT_CARRYING_RATE
  const holdingRate = carryingRate * selectedUnitCost
  const orderCost = round2((scenario.demand / plan.best.evaluatedQty) * scenario.orderCost)
  const holdingCost = round2((plan.best.evaluatedQty / 2) * holdingRate)
  const purchaseCost = round2(scenario.demand * selectedUnitCost)

  return {
    orderCost,
    holdingCost,
    shortageCost: 0,
    purchaseCost,
    totalCost: round2(orderCost + holdingCost + purchaseCost),
    maxInventory: plan.best.evaluatedQty,
    maxBackorder: 0,
    safetyStock: 0,
    reorderPoint: 0,
  }
}

export function optimalTotalCost(scenario: InventoryScenario) {
  return buildInventoryBreakdown(scenario).totalCost
}

export function modelFormula(scenario: InventoryScenario) {
  if (scenario.model === 'sin-ruptura') {
    return 'Q* = sqrt(2DS/H)'
  }

  if (scenario.model === 'con-ruptura') {
    return 'Q* = sqrt(2DS(H+P)/(H·P))'
  }

  if (scenario.model === 'reabastecimiento-uniforme') {
    return 'Q* = sqrt((2DS/H) · p/(p-d))'
  }

  if (scenario.model === 'demanda-aleatoria') {
    return 'Q* = sqrt(2DS/H), R = dL + z·σ·sqrt(L)'
  }

  return 'CT = DC + (D/Q)S + (Q/2)iC, evaluando cada tramo'
}

export function createInventoryBundle(): InventoryBundle {
  const classificationIndex = Math.floor(Math.random() * inventoryScenarios.length)
  const calculationIndex = Math.floor(Math.random() * inventoryScenarios.length)
  const classification = structuredClone(inventoryScenarios[classificationIndex])
  let calculation = structuredClone(inventoryScenarios[calculationIndex])

  if (classification.prompt === calculation.prompt) {
    calculation = structuredClone(inventoryScenarios[(classificationIndex + 1) % inventoryScenarios.length])
  }

  return {
    classification,
    calculation,
    ruptureDecision: structuredClone(rupturePrompts[Math.floor(Math.random() * rupturePrompts.length)]),
    randomDemandExercise: structuredClone(randomDemandExercises[Math.floor(Math.random() * randomDemandExercises.length)]),
    quantityDiscountExercise: structuredClone(quantityDiscountExercises[Math.floor(Math.random() * quantityDiscountExercises.length)]),
  }
}
