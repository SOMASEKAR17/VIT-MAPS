/**
 * Collection of shortest-path algorithms for indoor navigation.
 * Each algorithm exports a function with the same signature:
 *   (startId, endId, nodes) => Node[]
 *
 * `nodes` is a flat array of node objects with `nodeId`, `connections[]`, and `coordinates`.
 */

// ─── Helpers ───────────────────────────────────────────────────────────────
function buildPath(prev, endId, nodeMap) {
  const path = [];
  let walker = endId;
  while (walker) {
    const node = nodeMap.get(walker);
    if (node) path.unshift(node);
    walker = prev[walker];
  }
  return path;
}

function buildAdjacency(nodes) {
  const nodeMap = new Map(nodes.map((n) => [n.nodeId, n]));
  const adj = {};
  for (const n of nodes) {
    adj[n.nodeId] = [];
    for (const c of n.connections || []) {
      if (c?.nodeId && nodeMap.has(c.nodeId)) {
        adj[n.nodeId].push({ nodeId: c.nodeId, distance: Number(c.distance) || 1 });
      }
    }
  }
  return { nodeMap, adj };
}

// ─── 1. Dijkstra ──────────────────────────────────────────────────────────
export function dijkstra(startId, endId, nodes) {
  const { nodeMap, adj } = buildAdjacency(nodes);
  const dist = {};
  const prev = {};
  const visited = new Set();
  const queue = [];

  for (const n of nodes) { dist[n.nodeId] = Infinity; prev[n.nodeId] = null; }
  dist[startId] = 0;
  queue.push({ nodeId: startId, distance: 0 });

  while (queue.length > 0) {
    queue.sort((a, b) => a.distance - b.distance);
    const { nodeId } = queue.shift();
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);
    for (const neighbor of adj[nodeId] || []) {
      const alt = dist[nodeId] + neighbor.distance;
      if (alt < dist[neighbor.nodeId]) {
        dist[neighbor.nodeId] = alt;
        prev[neighbor.nodeId] = nodeId;
        queue.push({ nodeId: neighbor.nodeId, distance: alt });
      }
    }
  }
  return buildPath(prev, endId, nodeMap);
}

// ─── 2. A* (A-Star) ──────────────────────────────────────────────────────
function heuristic(a, b) {
  if (!a?.coordinates || !b?.coordinates) return 0;
  const dx = a.coordinates.x - b.coordinates.x;
  const dy = a.coordinates.y - b.coordinates.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function aStar(startId, endId, nodes) {
  const { nodeMap, adj } = buildAdjacency(nodes);
  const endNode = nodeMap.get(endId);
  if (!endNode) return [];

  const gScore = {};
  const fScore = {};
  const prev = {};
  const openSet = new Set([startId]);
  const closedSet = new Set();

  for (const n of nodes) { gScore[n.nodeId] = Infinity; fScore[n.nodeId] = Infinity; prev[n.nodeId] = null; }
  gScore[startId] = 0;
  fScore[startId] = heuristic(nodeMap.get(startId), endNode);

  while (openSet.size > 0) {
    // Pick node in openSet with lowest fScore
    let current = null;
    let lowestF = Infinity;
    for (const id of openSet) {
      if (fScore[id] < lowestF) { lowestF = fScore[id]; current = id; }
    }
    if (current === endId) return buildPath(prev, endId, nodeMap);

    openSet.delete(current);
    closedSet.add(current);

    for (const neighbor of adj[current] || []) {
      if (closedSet.has(neighbor.nodeId)) continue;
      const tentativeG = gScore[current] + neighbor.distance;
      if (tentativeG < gScore[neighbor.nodeId]) {
        prev[neighbor.nodeId] = current;
        gScore[neighbor.nodeId] = tentativeG;
        fScore[neighbor.nodeId] = tentativeG + heuristic(nodeMap.get(neighbor.nodeId), endNode);
        openSet.add(neighbor.nodeId);
      }
    }
  }
  return buildPath(prev, endId, nodeMap);
}

// ─── 3. BFS (Unweighted — fewest hops) ───────────────────────────────────
export function bfs(startId, endId, nodes) {
  const { nodeMap, adj } = buildAdjacency(nodes);
  const visited = new Set([startId]);
  const prev = {};
  const queue = [startId];

  for (const n of nodes) prev[n.nodeId] = null;

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === endId) return buildPath(prev, endId, nodeMap);
    for (const neighbor of adj[current] || []) {
      if (!visited.has(neighbor.nodeId)) {
        visited.add(neighbor.nodeId);
        prev[neighbor.nodeId] = current;
        queue.push(neighbor.nodeId);
      }
    }
  }
  return buildPath(prev, endId, nodeMap);
}

// ─── 4. Bellman-Ford ─────────────────────────────────────────────────────
export function bellmanFord(startId, endId, nodes) {
  const { nodeMap, adj } = buildAdjacency(nodes);
  const dist = {};
  const prev = {};

  for (const n of nodes) { dist[n.nodeId] = Infinity; prev[n.nodeId] = null; }
  dist[startId] = 0;

  const nodeIds = nodes.map(n => n.nodeId);
  // Relax edges |V| - 1 times
  for (let i = 0; i < nodeIds.length - 1; i++) {
    let changed = false;
    for (const u of nodeIds) {
      if (dist[u] === Infinity) continue;
      for (const neighbor of adj[u] || []) {
        const alt = dist[u] + neighbor.distance;
        if (alt < dist[neighbor.nodeId]) {
          dist[neighbor.nodeId] = alt;
          prev[neighbor.nodeId] = u;
          changed = true;
        }
      }
    }
    if (!changed) break; // Early exit optimisation
  }
  return buildPath(prev, endId, nodeMap);
}

// ─── Algorithm Registry ──────────────────────────────────────────────────
export const ALGORITHMS = {
  dijkstra: {
    name: "Dijkstra",
    fn: dijkstra,
    description: "Classic weighted shortest path. Guarantees optimal distance.",
    complexity: "O((V + E) log V)",
    badge: "Optimal",
  },
  aStar: {
    name: "A* (A-Star)",
    fn: aStar,
    description: "Heuristic-guided search. Fastest for spatial graphs.",
    complexity: "O(E)",
    badge: "Fastest",
  },
  bfs: {
    name: "BFS",
    fn: bfs,
    description: "Breadth-first search. Finds the path with fewest hops.",
    complexity: "O(V + E)",
    badge: "Fewest Hops",
  },
  bellmanFord: {
    name: "Bellman-Ford",
    fn: bellmanFord,
    description: "Handles negative weights. Robust but slower.",
    complexity: "O(V × E)",
    badge: "Robust",
  },
};
