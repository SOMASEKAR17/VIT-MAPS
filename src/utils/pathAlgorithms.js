

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


export function bellmanFord(startId, endId, nodes) {
  const { nodeMap, adj } = buildAdjacency(nodes);
  const dist = {};
  const prev = {};

  for (const n of nodes) { dist[n.nodeId] = Infinity; prev[n.nodeId] = null; }
  dist[startId] = 0;

  const nodeIds = nodes.map(n => n.nodeId);
  
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
    if (!changed) break; 
  }
  return buildPath(prev, endId, nodeMap);
}


export function floydWarshall(startId, endId, nodes) {
  const { nodeMap, adj } = buildAdjacency(nodes);
  const ids = nodes.map(n => n.nodeId);
  const idx = new Map(ids.map((id, i) => [id, i]));
  const n = ids.length;

  
  const dist = Array.from({ length: n }, () => new Float64Array(n).fill(Infinity));
  const next = Array.from({ length: n }, () => new Array(n).fill(-1));

  for (let i = 0; i < n; i++) dist[i][i] = 0;

  for (const u of ids) {
    const ui = idx.get(u);
    for (const neighbor of adj[u] || []) {
      const vi = idx.get(neighbor.nodeId);
      if (vi !== undefined) {
        dist[ui][vi] = neighbor.distance;
        next[ui][vi] = vi;
      }
    }
  }

  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
          next[i][j] = next[i][k];
        }
      }
    }
  }

  
  const si = idx.get(startId);
  const ei = idx.get(endId);
  if (si === undefined || ei === undefined || next[si][ei] === -1) return [];

  const path = [];
  let cur = si;
  while (cur !== ei) {
    path.push(nodeMap.get(ids[cur]));
    cur = next[cur][ei];
    if (cur === -1) return [];
  }
  path.push(nodeMap.get(ids[ei]));
  return path.filter(Boolean);
}


export function johnsons(startId, endId, nodes) {
  const { nodeMap, adj } = buildAdjacency(nodes);
  const ids = nodes.map(n => n.nodeId);

  
  const h = {};
  for (const id of ids) h[id] = 0; 

  for (let i = 0; i < ids.length - 1; i++) {
    let changed = false;
    for (const u of ids) {
      for (const neighbor of adj[u] || []) {
        const alt = h[u] + neighbor.distance;
        if (alt < h[neighbor.nodeId]) {
          h[neighbor.nodeId] = alt;
          changed = true;
        }
      }
    }
    if (!changed) break;
  }

  
  const dist = {};
  const prev = {};
  const visited = new Set();
  const queue = [];

  for (const id of ids) { dist[id] = Infinity; prev[id] = null; }
  dist[startId] = 0;
  queue.push({ nodeId: startId, distance: 0 });

  while (queue.length > 0) {
    queue.sort((a, b) => a.distance - b.distance);
    const { nodeId } = queue.shift();
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    for (const neighbor of adj[nodeId] || []) {
      
      const reweighted = neighbor.distance + (h[nodeId] || 0) - (h[neighbor.nodeId] || 0);
      const alt = dist[nodeId] + reweighted;
      if (alt < dist[neighbor.nodeId]) {
        dist[neighbor.nodeId] = alt;
        prev[neighbor.nodeId] = nodeId;
        queue.push({ nodeId: neighbor.nodeId, distance: alt });
      }
    }
  }

  return buildPath(prev, endId, nodeMap);
}


export function bidirectional(startId, endId, nodes) {
  const { nodeMap, adj } = buildAdjacency(nodes);

  
  const radj = {};
  for (const n of nodes) radj[n.nodeId] = [];
  for (const u of nodes) {
    for (const c of adj[u.nodeId] || []) {
      if (!radj[c.nodeId]) radj[c.nodeId] = [];
      radj[c.nodeId].push({ nodeId: u.nodeId, distance: c.distance });
    }
  }

  const distF = {}, distB = {};
  const prevF = {}, prevB = {};
  const visitedF = new Set(), visitedB = new Set();
  const queueF = [], queueB = [];

  for (const n of nodes) {
    distF[n.nodeId] = Infinity; prevF[n.nodeId] = null;
    distB[n.nodeId] = Infinity; prevB[n.nodeId] = null;
  }

  distF[startId] = 0; queueF.push({ nodeId: startId, distance: 0 });
  distB[endId] = 0;   queueB.push({ nodeId: endId, distance: 0 });

  let mu = Infinity; 
  let meetNode = null;

  const step = (queue, dist, prev, visited, otherDist, otherVisited, adjList) => {
    if (queue.length === 0) return;
    queue.sort((a, b) => a.distance - b.distance);
    const { nodeId } = queue.shift();
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    for (const neighbor of adjList[nodeId] || []) {
      const alt = dist[nodeId] + neighbor.distance;
      if (alt < dist[neighbor.nodeId]) {
        dist[neighbor.nodeId] = alt;
        prev[neighbor.nodeId] = nodeId;
        queue.push({ nodeId: neighbor.nodeId, distance: alt });
      }
      
      if (otherVisited.has(neighbor.nodeId)) {
        const totalCost = alt + otherDist[neighbor.nodeId];
        if (totalCost < mu) {
          mu = totalCost;
          meetNode = neighbor.nodeId;
        }
      }
    }
  };

  const MAX_ITER = nodes.length * 2;
  for (let i = 0; i < MAX_ITER; i++) {
    if (queueF.length === 0 && queueB.length === 0) break;

    step(queueF, distF, prevF, visitedF, distB, visitedB, adj);
    step(queueB, distB, prevB, visitedB, distF, visitedF, radj);

    
    if (queueF.length > 0 && queueB.length > 0) {
      const minF = queueF.reduce((m, x) => Math.min(m, x.distance), Infinity);
      const minB = queueB.reduce((m, x) => Math.min(m, x.distance), Infinity);
      if (minF + minB >= mu) break;
    }
  }

  if (meetNode === null) return buildPath(prevF, endId, nodeMap); 

  
  const forwardPath = [];
  let w = meetNode;
  while (w) { const nd = nodeMap.get(w); if (nd) forwardPath.unshift(nd); w = prevF[w]; }

  const backwardPath = [];
  w = prevB[meetNode];
  while (w) { const nd = nodeMap.get(w); if (nd) backwardPath.push(nd); w = prevB[w]; }

  return [...forwardPath, ...backwardPath];
}


export function spfa(startId, endId, nodes) {
  const { nodeMap, adj } = buildAdjacency(nodes);
  const dist = {};
  const prev = {};
  const inQueue = new Set();

  for (const n of nodes) { dist[n.nodeId] = Infinity; prev[n.nodeId] = null; }
  dist[startId] = 0;

  const queue = [startId];
  inQueue.add(startId);

  while (queue.length > 0) {
    const u = queue.shift();
    inQueue.delete(u);

    for (const neighbor of adj[u] || []) {
      const alt = dist[u] + neighbor.distance;
      if (alt < dist[neighbor.nodeId]) {
        dist[neighbor.nodeId] = alt;
        prev[neighbor.nodeId] = u;
        if (!inQueue.has(neighbor.nodeId)) {
          
          if (queue.length > 0 && alt < dist[queue[0]]) {
            queue.unshift(neighbor.nodeId);
          } else {
            queue.push(neighbor.nodeId);
          }
          inQueue.add(neighbor.nodeId);
        }
      }
    }
  }

  return buildPath(prev, endId, nodeMap);
}


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
  floydWarshall: {
    name: "Floyd-Warshall",
    fn: floydWarshall,
    description: "All-pairs shortest paths. Computes every route at once.",
    complexity: "O(V³)",
    badge: "All-Pairs",
  },
  johnsons: {
    name: "Johnson's",
    fn: johnsons,
    description: "Reweights edges via Bellman-Ford, then runs Dijkstra. Best for sparse graphs.",
    complexity: "O(V² log V + VE)",
    badge: "Sparse",
  },
  bidirectional: {
    name: "Bidirectional",
    fn: bidirectional,
    description: "Searches from both ends simultaneously. Halves the search space.",
    complexity: "O(b^(d/2))",
    badge: "Dual Search",
  },
  spfa: {
    name: "SPFA",
    fn: spfa,
    description: "Queue-based Bellman-Ford with SLF optimisation. Very fast in practice.",
    complexity: "O(V × E) avg O(E)",
    badge: "Queue-Based",
  },
};
