export type InventoryModel = 'sin-ruptura' | 'con-ruptura' | 'reabastecimiento-uniforme'

export interface InventoryScenario {
  model: InventoryModel
  prompt: string
  demand: number
  orderCost: number
  holdingCost: number
  shortageCost?: number
  productionRate?: number
  demandRate?: number
  sourceId: string
}

export interface InventoryBundle {
  classification: InventoryScenario
  calculation: InventoryScenario
  ruptureDecision: {
    prompt: string
    answer: 'Conviene analizar ruptura' | 'No conviene ruptura'
  }
}

export interface InventoryBreakdown {
  orderCost: number
  holdingCost: number
  shortageCost: number
  totalCost: number
  maxInventory: number
  maxBackorder: number
}

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

function round2(value: number) {
  return Math.round(value * 100) / 100
}

export function optimalLotSize(scenario: InventoryScenario) {
  if (scenario.model === 'sin-ruptura') {
    return round2(Math.sqrt((2 * scenario.demand * scenario.orderCost) / scenario.holdingCost))
  }

  if (scenario.model === 'con-ruptura') {
    const shortageCost = scenario.shortageCost ?? 1
    return round2(Math.sqrt(
      (2 * scenario.demand * scenario.orderCost * (scenario.holdingCost + shortageCost))
        / (scenario.holdingCost * shortageCost),
    ))
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
      totalCost: round2(orderCost + holdingCost),
      maxInventory: round2(q),
      maxBackorder: 0,
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
      totalCost: round2(orderCost + holdingCost + shortageCost),
      maxInventory,
      maxBackorder,
    }
  }

  const demandRate = scenario.demandRate ?? 1
  const productionRate = scenario.productionRate ?? demandRate + 1
  const maxInventory = round2(q * (1 - demandRate / productionRate))
  const orderCost = round2((scenario.demand / q) * scenario.orderCost)
  const holdingCost = round2((maxInventory / 2) * scenario.holdingCost)

  return {
    orderCost,
    holdingCost,
    shortageCost: 0,
    totalCost: round2(orderCost + holdingCost),
    maxInventory,
    maxBackorder: 0,
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

  return 'Q* = sqrt((2DS/H) · p/(p-d))'
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
  }
}
