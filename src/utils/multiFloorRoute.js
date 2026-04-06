import { dijkstra } from "./dijkstra.js";
export function findMultiFloorPath(projectSchema, startId, endId) {
  const allNodes = projectSchema.floors.flatMap(f =>
    f.nodes.map(n => ({
      ...n,
      floorId: f.id,
    }))
  );
  const allConnections = [];
  for (const floor of projectSchema.floors) {
    for (const node of floor.nodes) {
      for (const c of node.connections || []) {
        allConnections.push({
          from: node.nodeId,
          to: c.nodeId,
          distance: c.distance || 1,
        });
      }
    }
  }
  for (const c of projectSchema.connections || []) {
    allConnections.push({
      from: c.from,
      to: c.to,
      distance: c.distance || 10, 
    });
  }
  const nodeMap = new Map(allNodes.map(n => [n.nodeId, n]));
  const globalDijkstra = (start, end) => {
    const neighbors = {};
    for (const { from, to, distance } of allConnections) {
      if (!neighbors[from]) neighbors[from] = [];
      neighbors[from].push({ nodeId: to, distance });
      if (!neighbors[to]) neighbors[to] = [];
      neighbors[to].push({ nodeId: from, distance });
    }
    const dist = {};
    const prev = {};
    const visited = new Set();
    const queue = [];
    for (const n of allNodes) {
      dist[n.nodeId] = Infinity;
      prev[n.nodeId] = null;
    }
    dist[start] = 0;
    queue.push({ nodeId: start, distance: 0 });
    while (queue.length > 0) {
      queue.sort((a, b) => a.distance - b.distance);
      const { nodeId } = queue.shift();
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);
      for (const neighbor of neighbors[nodeId] || []) {
        const alt = dist[nodeId] + neighbor.distance;
        if (alt < dist[neighbor.nodeId]) {
          dist[neighbor.nodeId] = alt;
          prev[neighbor.nodeId] = nodeId;
          queue.push({ nodeId: neighbor.nodeId, distance: alt });
        }
      }
    }
    const path = [];
    let walker = end;
    while (walker) {
      const node = nodeMap.get(walker);
      if (node) path.unshift(node);
      walker = prev[walker];
    }
    return path;
  };
  const fullPath = globalDijkstra(startId, endId);
  if (!fullPath || fullPath.length === 0) {
    console.warn("❌ No valid global path found.");
    return [];
  }
  console.log("✅ [Global Multi-Floor Path]", fullPath.map(n => n.name));
  const splitByFloor = [];
  let currentSegment = { floor: fullPath[0].floorId, nodes: [] };
  for (let i = 0; i < fullPath.length; i++) {
    const node = fullPath[i];
    if (node.floorId !== currentSegment.floor) {
      splitByFloor.push(currentSegment);
      currentSegment = { floor: node.floorId, nodes: [] };
    }
    currentSegment.nodes.push(node);
  }
  splitByFloor.push(currentSegment);
  console.log("🗺️ [Floor Segments]", splitByFloor.map(s => s.floor));
  const refinedSegments = splitByFloor.map(seg => {
    if (seg.nodes.length <= 1) return seg;
    const floorNodes = allNodes.filter(n => n.floorId === seg.floor);
    const refined = dijkstra(
      seg.nodes[0].nodeId,
      seg.nodes[seg.nodes.length - 1].nodeId,
      floorNodes
    );
    return { floor: seg.floor, nodes: refined };
  });
  const refinedPath = refinedSegments.flatMap(seg => seg.nodes);
  console.log("🏁 [Refined Multi-Floor Route]", refinedPath.map(n => n.name));
  return refinedPath;
}