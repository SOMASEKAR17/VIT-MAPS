import { ALGORITHMS } from "./pathAlgorithms.js";

export function findMultiFloorPath(projectSchema, startId, endId, algorithmKey = "dijkstra") {
  const selectedAlgo = ALGORITHMS[algorithmKey]?.fn || ALGORITHMS.dijkstra.fn;

  const allNodes = projectSchema.floors.flatMap(f =>
    f.nodes.map(n => ({
      ...n,
      floorId: f.id,
    }))
  );

  // Build global connection list
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

  // Global pathfinding across all floors using the selected algorithm
  const globalPath = (() => {
    // Build a synthetic node list with cross-floor connections baked in
    const syntheticNodes = allNodes.map(n => {
      const existingConnections = [...(n.connections || [])];
      // Add any cross-floor connections
      for (const c of allConnections) {
        if (c.from === n.nodeId && !existingConnections.find(ec => ec.nodeId === c.to)) {
          existingConnections.push({ nodeId: c.to, distance: c.distance });
        }
        if (c.to === n.nodeId && !existingConnections.find(ec => ec.nodeId === c.from)) {
          existingConnections.push({ nodeId: c.from, distance: c.distance });
        }
      }
      return { ...n, connections: existingConnections };
    });

    return selectedAlgo(startId, endId, syntheticNodes);
  })();

  if (!globalPath || globalPath.length === 0) {
    console.warn("❌ No valid global path found.");
    return [];
  }

  // Restore floorId on each node
  const fullPath = globalPath.map(n => ({
    ...n,
    floorId: nodeMap.get(n.nodeId)?.floorId || n.floorId,
  }));

  console.log(`✅ [${ALGORITHMS[algorithmKey]?.name || "Dijkstra"} Multi-Floor Path]`, fullPath.map(n => n.name));

  // Split by floor segments
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

  // Refine each floor segment using the same algorithm
  const refinedSegments = splitByFloor.map(seg => {
    if (seg.nodes.length <= 1) return seg;
    const floorNodes = allNodes.filter(n => n.floorId === seg.floor);
    const refined = selectedAlgo(
      seg.nodes[0].nodeId,
      seg.nodes[seg.nodes.length - 1].nodeId,
      floorNodes
    );
    return { floor: seg.floor, nodes: refined };
  });

  const refinedPath = refinedSegments.flatMap(seg => seg.nodes);
  console.log(`🏁 [Refined ${ALGORITHMS[algorithmKey]?.name || "Dijkstra"} Route]`, refinedPath.map(n => n.name));
  return refinedPath;
}

/**
 * Runs every registered algorithm and returns benchmark results.
 * Returns: { [algorithmKey]: { timeMs, pathLength, path } }
 */
export function benchmarkAllAlgorithms(projectSchema, startId, endId) {
  const results = {};
  for (const key of Object.keys(ALGORITHMS)) {
    const t0 = performance.now();
    const path = findMultiFloorPath(projectSchema, startId, endId, key);
    const t1 = performance.now();
    results[key] = {
      timeMs: parseFloat((t1 - t0).toFixed(3)),
      pathLength: path.length,
      path,
    };
  }
  return results;
}