"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
const Map = dynamic(() => import("../../components/map/Map"), { ssr: false });
import SearchBar from "../../components/search/SearchBar";
import BottomNavPanel from "../../components/navigation/BottomNavPanel";
import FloorSelector from "../../components/sidebar/FloorSelector";
import AlgorithmSelector from "../../components/sidebar/AlgorithmSelector";
import ResetUserLocation from "../../components/common/ResetUserLocation";
import SplashScreen from "../../components/splash/SplashScreen";
import Footer from "../../components/common/Footer";
import projectSchema from "../../data/project-schema-final.json";
import { distanceSq } from "../../utils/math";
import { splitPathByFloor } from "../../utils/splitPathByFloor";
import { findMultiFloorPath } from "../../utils/multiFloorRoute";
const Home = () => {
  const [nodes, setNodes] = useState([]);
  const [floors, setFloors] = useState([]);
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);
  const [route, setRoute] = useState([]);
  const [currentFloor, setCurrentFloor] = useState(null);
  const [userLoc, setUserLoc] = useState(null);
  const [showSplash, setShowSplash] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [searchMode, setSearchMode] = useState("setLocation"); 
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("dijkstra");
  useEffect(() => {
    const { floors } = projectSchema;
    setFloors(floors);
    const mergedNodes = floors.flatMap((f) =>
      f.nodes.map((n) => ({ ...n, floorId: f.id }))
    );
    setNodes(mergedNodes);
    if (floors.length > 0) setCurrentFloor(floors[0]); 
    setTimeout(() => setShowSplash(false), 1500);
  }, []);
  const nearestNode = useCallback(
    (pt, floorId) => {
      let best = null,
        bestD = Infinity;
      nodes.forEach((n) => {
        if (String(n.coordinates.floor) !== String(floorId)) return;
        const d = distanceSq(pt.x, pt.y, n.coordinates.x, n.coordinates.y);
        if (d < bestD) {
          best = n;
          bestD = d;
        }
      });
      return best;
    },
    [nodes]
  );
  const handleMapClick = (pt) => {
    const floorMeta = projectSchema.floors.find(
      (f) => f.id === currentFloor?.id
    );
    const floorWidth = floorMeta?.width || 100;
    const floorHeight = floorMeta?.height || 100;
    const clamped = {
      x: Math.max(0, Math.min(pt.x, floorWidth)),
      y: Math.max(0, Math.min(pt.y, floorHeight)),
      floor: currentFloor?.id,
    };
    const nearest = nearestNode(clamped, currentFloor?.id);
    if (nearest) {
      setUserLoc(clamped);
      setStartNode(nearest);
      if (searchMode === "setLocation") setSearchMode("search");
    }
  };
  const handleSetUserLocation = (node) => {
    setUserLoc(node.coordinates);
    setStartNode(node);
    setEndNode(null);
    setRoute([]);
    setIsNavigating(false);
    const floorObj = floors.find((f) => f.id === node.floorId);
    if (floorObj) setCurrentFloor(floorObj);
    setSearchMode("search");
  };
  const handleDestSelect = (node) => {
    setEndNode(node);
    const floorObj = floors.find((f) => f.id === node.floorId);
    if (floorObj) setCurrentFloor(floorObj);

    if (!startNode?.nodeId) {
      setIsNavigating(false);
      setRoute([]);
      return; 
    }

    const path = findMultiFloorPath(projectSchema, startNode.nodeId, node.nodeId, selectedAlgorithm);
    setRoute(path);
    setIsNavigating(true);

    const segments = splitPathByFloor(path);
    const currentSeg = segments.find(s => s.floor === currentFloor?.id);
    if (!currentSeg && segments.length > 0) {
      setCurrentFloor(floors.find(f => f.id === segments[0].floor));
    }
  };
  const handleResetUserLocation = useCallback(() => {
    setUserLoc(null);
    setStartNode(null);
    setEndNode(null);
    setRoute([]);
    setIsNavigating(false);
    setSearchMode("setLocation"); 
  }, []);
  const segments = useMemo(() => splitPathByFloor(route), [route]);
  const currentSegment =
    segments.find((seg) => seg.floor === currentFloor?.id)?.nodes || [];
  const handleMarkerClick = (node) => {
    if (!startNode) {
       handleSetUserLocation(node);
    } else {
       handleDestSelect(node);
    }
  };

  if (showSplash) return <SplashScreen />;
  return (
    <div className="flex w-full h-screen bg-background text-foreground overflow-hidden font-sans">
      <aside className="w-96 flex flex-col bg-surface border-r border-border-custom z-50 shadow-glass">
        <div className="p-6 space-y-8 flex flex-col h-full overflow-hidden">
          <div className="space-y-1">
            <h1 className="text-4xl font-bruno tracking-tighter text-accent inline-block">vitMaps</h1>
            <div className="text-[10px] font-bebas tracking-[0.3em] text-gray-500 uppercase">Indoor Navigation Suite</div>
          </div>
          
          <div className="space-y-4">
            <div className={`p-3 rounded-2xl border transition-all ${searchMode === 'setLocation' ? 'bg-accent/10 border-accent/30' : 'bg-white/5 border-white/5 opacity-60'}`}>
              <div className="text-[10px] font-bebas tracking-widest text-accent mb-2">Step 1: Set Your Location</div>
              <SearchBar
                nodes={nodes}
                floors={floors}
                mode="setLocation"
                onSetLocation={handleSetUserLocation}
                onSelectNode={handleDestSelect}
              />
              {startNode && (
                <div className="mt-2 text-xs text-gray-400 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                   <span>Starting from: <b className="text-white">{(startNode.name && !startNode.name.startsWith("Node")) ? startNode.name : "Location"}</b></span>
                </div>
              )}
            </div>

            <div className={`p-3 rounded-2xl border transition-all ${searchMode === 'search' ? 'bg-accent/10 border-accent/30' : 'bg-white/5 border-white/5 opacity-60'}`}>
              <div className="text-[10px] font-bebas tracking-widest text-accent mb-2">Step 2: Find Your Room</div>
              <SearchBar
                nodes={nodes}
                floors={floors}
                mode="search"
                onSetLocation={handleSetUserLocation}
                onSelectNode={handleDestSelect}
              />
              {endNode && (
                <div className="mt-2 text-xs text-gray-400 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-accent" />
                   <span>Going to: <b className="text-white">{endNode.name}</b></span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 pr-1 scrollbar-hide">
            <AlgorithmSelector
              selected={selectedAlgorithm}
              onChange={(key) => {
                setSelectedAlgorithm(key);
                if (startNode?.nodeId && endNode?.nodeId) {
                  const path = findMultiFloorPath(projectSchema, startNode.nodeId, endNode.nodeId, key);
                  setRoute(path);
                  setIsNavigating(true);
                }
              }}
            />
          </div>
        </div>
        
        <div className="mt-auto p-4 border-t border-border-custom">
            <Footer />
        </div>
      </aside>

      <main className="flex-1 relative z-10 bg-[#0a0a0a]">
        <Map
          userLocation={userLoc}
          Endnode={endNode?.nodeId}
          onSelectLocation={handleMapClick}
          onMarkerClick={handleMarkerClick}
          nodes={nodes}
          route={currentSegment}
          currentFloor={currentFloor}
        />

        <div className="absolute top-6 right-6 z-[10000] space-y-4">
           <FloorSelector
            floors={floors}
            currentFloor={currentFloor}
            onChange={(next) => {
              if (!next || next.id === currentFloor?.id) return;
              setCurrentFloor(next);
              const seg = segments.find((s) => s.floor === next.id);
              if (isNavigating && seg && seg.nodes.length > 0) {
                const stairNode = seg.nodes[0];
                setStartNode(stairNode);
                setUserLoc(stairNode.coordinates);
              }
            }}
          />
        </div>

        <div className="absolute bottom-24 right-6 z-[10000]">
           <ResetUserLocation onReset={handleResetUserLocation} />
        </div>

        <div className="absolute bottom-6 left-6 right-6 z-[10000]">
          <BottomNavPanel
            route={route}
            destination={endNode}
            isNavigating={isNavigating}
            loading={false}
            currentFloor={currentFloor?.id}
            floors={floors}
            onFloorChange={(nextFloorId) => {
              const floorObj = floors.find((f) => f.id === nextFloorId);
              if (!floorObj) return;
              setCurrentFloor(floorObj);
              const seg = segments.find((s) => s.floor === nextFloorId);
              if (isNavigating && seg && seg.nodes.length > 0) {
                const stairNode = seg.nodes[0];
                setStartNode(stairNode);
                setUserLoc(stairNode.coordinates);
              }
            }}
          />
        </div>
      </main>
    </div>
  );
};
export default Home;