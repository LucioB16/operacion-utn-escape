import { Graph, alg } from '@dagrejs/graphlib'

export interface NetworkNode {
  id: string
  x: number
  y: number
}

export interface NetworkEdge {
  id: string
  from: string
  to: string
  weight: number
}

export interface NetworkScenario {
  sourceId: string
  origin: string
  target: string
  nodes: NetworkNode[]
  edges: NetworkEdge[]
  shortestPathOptions: string[][]
}

export interface KruskalStep {
  edgeId: string
  weight: number
  accepted: boolean
  reason: string
}

export interface DijkstraTraceRow {
  current: string
  distances: Record<string, number>
}

export interface DijkstraResult {
  cost: number
  path: string[]
  rows: DijkstraTraceRow[]
}

export interface GraphlibNetworkVerification {
  dijkstraCost: number
  dijkstraPath: string[]
  primCost: number
  primEdgeIds: string[]
  matchesDijkstra: boolean
  matchesMst: boolean
}

class DisjointSet {
  private parent = new Map<string, string>()

  constructor(nodes: string[]) {
    nodes.forEach((node) => {
      this.parent.set(node, node)
    })
  }

  find(node: string): string {
    const current = this.parent.get(node) ?? node

    if (current === node) {
      return node
    }

    const root = this.find(current)
    this.parent.set(node, root)
    return root
  }

  union(left: string, right: string) {
    const leftRoot = this.find(left)
    const rightRoot = this.find(right)

    if (leftRoot !== rightRoot) {
      this.parent.set(leftRoot, rightRoot)
    }
  }
}

function buildAdjacency(edges: NetworkEdge[]) {
  const adjacency = new Map<string, NetworkEdge[]>()

  edges.forEach((edge) => {
    adjacency.set(edge.from, [...(adjacency.get(edge.from) ?? []), edge])
    adjacency.set(edge.to, [...(adjacency.get(edge.to) ?? []), edge])
  })

  return adjacency
}

export function minimumSpanningTreeTrace(edges: NetworkEdge[], nodes: NetworkNode[]) {
  const set = new DisjointSet(nodes.map((node) => node.id))
  const ordered = [...edges].sort((a, b) => a.weight - b.weight)
  const steps: KruskalStep[] = []
  const accepted: NetworkEdge[] = []

  ordered.forEach((edge) => {
    const wouldCycle = set.find(edge.from) === set.find(edge.to)

    if (wouldCycle) {
      steps.push({
        edgeId: edge.id,
        weight: edge.weight,
        accepted: false,
        reason: 'Forma ciclo con aristas ya elegidas.',
      })
      return
    }

    set.union(edge.from, edge.to)
    accepted.push(edge)
    steps.push({
      edgeId: edge.id,
      weight: edge.weight,
      accepted: true,
      reason: 'Conecta componentes distintas sin cerrar ciclo.',
    })
  })

  return {
    accepted,
    steps,
  }
}

export function minimumSpanningTree(edges: NetworkEdge[], nodes: NetworkNode[]) {
  return minimumSpanningTreeTrace(edges, nodes).accepted
}

export function selectedWeight(edges: NetworkEdge[]) {
  return edges.reduce((total, edge) => total + edge.weight, 0)
}

export function isSpanningTree(selectedEdges: NetworkEdge[], nodes: NetworkNode[]) {
  if (selectedEdges.length !== nodes.length - 1) {
    return false
  }

  const set = new DisjointSet(nodes.map((node) => node.id))

  for (const edge of selectedEdges) {
    if (set.find(edge.from) === set.find(edge.to)) {
      return false
    }

    set.union(edge.from, edge.to)
  }

  const root = set.find(nodes[0].id)
  return nodes.every((node) => set.find(node.id) === root)
}

export function dijkstraTrace(scenario: NetworkScenario): DijkstraResult {
  const distances = new Map<string, number>()
  const previous = new Map<string, string | null>()
  const queue = new Set(scenario.nodes.map((node) => node.id))
  const adjacency = buildAdjacency(scenario.edges)
  const rows: DijkstraTraceRow[] = []

  scenario.nodes.forEach((node) => {
    distances.set(node.id, node.id === scenario.origin ? 0 : Infinity)
    previous.set(node.id, null)
  })

  while (queue.size > 0) {
    const current = [...queue].reduce((best, candidate) => (
      (distances.get(candidate) ?? Infinity) < (distances.get(best) ?? Infinity) ? candidate : best
    ))
    queue.delete(current)

    ;(adjacency.get(current) ?? []).forEach((edge) => {
      const neighbor = edge.from === current ? edge.to : edge.from

      if (!queue.has(neighbor)) {
        return
      }

      const newDistance = (distances.get(current) ?? Infinity) + edge.weight

      if (newDistance < (distances.get(neighbor) ?? Infinity)) {
        distances.set(neighbor, newDistance)
        previous.set(neighbor, current)
      }
    })

    rows.push({
      current,
      distances: Object.fromEntries(
        scenario.nodes.map((node) => [node.id, distances.get(node.id) ?? Infinity]),
      ),
    })
  }

  const path: string[] = []
  let cursor: string | null = scenario.target

  while (cursor) {
    path.unshift(cursor)
    cursor = previous.get(cursor) ?? null
  }

  return {
    cost: distances.get(scenario.target) ?? Infinity,
    path,
    rows,
  }
}

export function dijkstraCost(scenario: NetworkScenario) {
  return dijkstraTrace(scenario).cost
}

export function formatPath(path: string[]) {
  return path.join(' -> ')
}

function buildGraphlibGraph(scenario: NetworkScenario) {
  const graph = new Graph({ directed: false })

  scenario.nodes.forEach((node) => graph.setNode(node.id))
  scenario.edges.forEach((edge) => {
    graph.setEdge(edge.from, edge.to, { id: edge.id, weight: edge.weight })
  })

  return graph
}

export function verifyNetworkWithGraphlib(scenario: NetworkScenario): GraphlibNetworkVerification {
  const graph = buildGraphlibGraph(scenario)
  const weight = (edge: { v: string; w: string; name?: string }) => graph.edge(edge).weight
  const ownDijkstra = dijkstraTrace(scenario)
  const distances = alg.dijkstra(graph, scenario.origin, weight, (nodeId) => graph.nodeEdges(nodeId) ?? [])

  const dijkstraPath: string[] = []
  let cursor: string | undefined = scenario.target

  while (cursor) {
    dijkstraPath.unshift(cursor)
    cursor = distances[cursor]?.predecessor
  }

  const primTree = alg.prim(graph, weight)
  const primEdgeIds = primTree.edges().map((edge) => graph.edge(edge).id).sort()
  const ownMst = minimumSpanningTree(scenario.edges, scenario.nodes)
  const ownMstIds = ownMst.map((edge) => edge.id).sort()
  const primCost = primTree.edges().reduce((total, edge) => total + graph.edge(edge).weight, 0)
  const ownMstCost = selectedWeight(ownMst)

  return {
    dijkstraCost: distances[scenario.target]?.distance ?? Number.POSITIVE_INFINITY,
    dijkstraPath,
    primCost,
    primEdgeIds,
    matchesDijkstra: (distances[scenario.target]?.distance ?? Number.POSITIVE_INFINITY) === ownDijkstra.cost
      && formatPath(dijkstraPath) === formatPath(ownDijkstra.path),
    matchesMst: primCost === ownMstCost && primEdgeIds.join('|') === ownMstIds.join('|'),
  }
}

const scenarios: NetworkScenario[] = [
  {
    sourceId: 'redes-modelos',
    origin: 'A',
    target: 'F',
    nodes: [
      { id: 'A', x: 60, y: 70 },
      { id: 'B', x: 170, y: 40 },
      { id: 'C', x: 170, y: 150 },
      { id: 'D', x: 300, y: 75 },
      { id: 'E', x: 300, y: 180 },
      { id: 'F', x: 410, y: 120 },
    ],
    edges: [
      { id: 'AB', from: 'A', to: 'B', weight: 4 },
      { id: 'AC', from: 'A', to: 'C', weight: 2 },
      { id: 'BC', from: 'B', to: 'C', weight: 1 },
      { id: 'BD', from: 'B', to: 'D', weight: 5 },
      { id: 'CD', from: 'C', to: 'D', weight: 8 },
      { id: 'CE', from: 'C', to: 'E', weight: 10 },
      { id: 'DE', from: 'D', to: 'E', weight: 2 },
      { id: 'DF', from: 'D', to: 'F', weight: 6 },
      { id: 'EF', from: 'E', to: 'F', weight: 3 },
    ],
    shortestPathOptions: [
      ['A', 'C', 'B', 'D', 'E', 'F'],
      ['A', 'B', 'D', 'F'],
      ['A', 'C', 'E', 'F'],
    ],
  },
  {
    sourceId: 'final-2026-redes',
    origin: 'A',
    target: 'G',
    nodes: [
      { id: 'A', x: 60, y: 120 },
      { id: 'B', x: 140, y: 50 },
      { id: 'C', x: 150, y: 185 },
      { id: 'D', x: 260, y: 40 },
      { id: 'E', x: 255, y: 130 },
      { id: 'F', x: 270, y: 215 },
      { id: 'G', x: 400, y: 120 },
    ],
    edges: [
      { id: 'AB', from: 'A', to: 'B', weight: 3 },
      { id: 'AC', from: 'A', to: 'C', weight: 6 },
      { id: 'BC', from: 'B', to: 'C', weight: 2 },
      { id: 'BD', from: 'B', to: 'D', weight: 5 },
      { id: 'BE', from: 'B', to: 'E', weight: 4 },
      { id: 'CE', from: 'C', to: 'E', weight: 3 },
      { id: 'CF', from: 'C', to: 'F', weight: 7 },
      { id: 'DE', from: 'D', to: 'E', weight: 2 },
      { id: 'EG', from: 'E', to: 'G', weight: 6 },
      { id: 'FG', from: 'F', to: 'G', weight: 4 },
      { id: 'EF', from: 'E', to: 'F', weight: 3 },
    ],
    shortestPathOptions: [
      ['A', 'B', 'E', 'G'],
      ['A', 'C', 'F', 'G'],
      ['A', 'B', 'D', 'E', 'G'],
    ],
  },
  {
    sourceId: 'redes-modelos',
    origin: 'P',
    target: 'U',
    nodes: [
      { id: 'P', x: 70, y: 95 },
      { id: 'Q', x: 165, y: 40 },
      { id: 'R', x: 170, y: 160 },
      { id: 'S', x: 285, y: 55 },
      { id: 'T', x: 295, y: 180 },
      { id: 'U', x: 410, y: 120 },
    ],
    edges: [
      { id: 'PQ', from: 'P', to: 'Q', weight: 5 },
      { id: 'PR', from: 'P', to: 'R', weight: 4 },
      { id: 'QR', from: 'Q', to: 'R', weight: 1 },
      { id: 'QS', from: 'Q', to: 'S', weight: 6 },
      { id: 'RT', from: 'R', to: 'T', weight: 5 },
      { id: 'RS', from: 'R', to: 'S', weight: 3 },
      { id: 'ST', from: 'S', to: 'T', weight: 2 },
      { id: 'SU', from: 'S', to: 'U', weight: 7 },
      { id: 'TU', from: 'T', to: 'U', weight: 4 },
    ],
    shortestPathOptions: [
      ['P', 'R', 'T', 'U'],
      ['P', 'Q', 'S', 'U'],
      ['P', 'R', 'S', 'T', 'U'],
    ],
  },
]

export function createNetworkScenario() {
  return structuredClone(scenarios[Math.floor(Math.random() * scenarios.length)])
}
