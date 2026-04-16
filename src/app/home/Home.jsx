"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Maximize2, Minimize2 } from "lucide-react";
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
import { findMultiFloorPath, benchmarkAllAlgorithms } from "../../utils/multiFloorRoute";
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
  const [benchmarks, setBenchmarks] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarState, setSidebarState] = useState("half"); // "minimized", "half", "full"

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isNavigating) {
      setSidebarState("minimized");
    } else {
      setSidebarState("half");
    }
  }, [isNavigating]);
  useEffect(() => {
    const { floors } = projectSchema;
    setFloors(floors);
    const mergedNodes = floors.flatMap((f) =>
      f.nodes.map((n) => ({ ...n, floorId: f.id }))
    );
    setNodes(mergedNodes);

    try {
      const savedStart = localStorage.getItem("vitmaps_startNode");
      const savedEnd = localStorage.getItem("vitmaps_endNode");
      const savedAlgo = localStorage.getItem("vitmaps_algorithm");

      let start = null;
      let end = null;
      let initialFloor = floors.length > 0 ? floors[0] : null;

      if (savedAlgo) {
        setSelectedAlgorithm(savedAlgo);
      }

      if (savedStart) {
        start = JSON.parse(savedStart);
        setStartNode(start);
        setUserLoc(start.coordinates);
        setSearchMode("search");
        initialFloor = floors.find((f) => f.id === start.floorId) || initialFloor;
      }

      if (savedStart && savedEnd) {
        end = JSON.parse(savedEnd);
        setEndNode(end);
        const results = benchmarkAllAlgorithms(projectSchema, start.nodeId, end.nodeId);
        setBenchmarks(results);
        const algoToUse = savedAlgo || "dijkstra";
        const path = results[algoToUse]?.path || [];
        setRoute(path);
        setIsNavigating(true);
      }

      setCurrentFloor(initialFloor);
    } catch (e) {
      console.warn("Could not restore navigation state", e);
      if (floors.length > 0) setCurrentFloor(floors[0]);
    }

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

    try {
      localStorage.setItem("vitmaps_startNode", JSON.stringify(node));
      localStorage.removeItem("vitmaps_endNode");
    } catch (e) {}
  };
  const handleDestSelect = (node) => {
    setEndNode(node);

    try {
      localStorage.setItem("vitmaps_endNode", JSON.stringify(node));
    } catch (e) {}

    if (!startNode?.nodeId) {
      setIsNavigating(false);
      setRoute([]);
      setBenchmarks({});
      const floorObj = floors.find((f) => f.id === node.floorId);
      if (floorObj) setCurrentFloor(floorObj);
      return; 
    }

    // Run ALL algorithms and benchmark them
    const results = benchmarkAllAlgorithms(projectSchema, startNode.nodeId, node.nodeId);
    setBenchmarks(results);

    // Use selected algorithm's path for the map
    const path = results[selectedAlgorithm]?.path || [];
    setRoute(path);
    setIsNavigating(true);

    const startFloorObj = floors.find(f => f.id === startNode.floorId);
    if (startFloorObj) {
      setCurrentFloor(startFloorObj);
    }
  };
  const handleResetUserLocation = useCallback(() => {
    setUserLoc(null);
    setStartNode(null);
    setEndNode(null);
    setRoute([]);
    setIsNavigating(false);
    setBenchmarks({});
    setSearchMode("setLocation"); 
    try {
      localStorage.removeItem("vitmaps_startNode");
      localStorage.removeItem("vitmaps_endNode");
    } catch (e) {}
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
    <div className="flex flex-col-reverse md:flex-row w-full h-[100dvh] bg-background text-foreground overflow-hidden font-sans relative">
      <motion.aside 
        drag={isMobile ? "y" : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.05}
        onDragEnd={(e, info) => {
          if (!isMobile) return;
          if (info.offset.y > 50 || info.velocity.y > 200) {
            setSidebarState(prev => prev === "full" ? "half" : "minimized");
          } else if (info.offset.y < -50 || info.velocity.y < -200) {
            setSidebarState(prev => prev === "minimized" ? "half" : "full");
          }
        }}
        animate={{ 
          height: isMobile 
            ? (sidebarState === "minimized" ? "40px" : sidebarState === "half" ? "55dvh" : "90dvh") 
            : "100%",
          y: 0 
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full md:w-96 absolute bottom-0 md:relative flex flex-col bg-surface border-t md:border-t-0 md:border-r border-border-custom z-[50000] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-glass flex-shrink-0 rounded-t-3xl md:rounded-none touch-none md:touch-auto overflow-hidden"
      >
        {/* Drag Handle (Mobile only) */}
        <div 
          className="w-full flex items-center justify-between px-6 h-[40px] md:hidden cursor-pointer flex-shrink-0"
          onClick={() => setSidebarState(prev => prev === "minimized" ? "half" : "minimized")}
        >
          <div className="w-8" />
          <div className="w-12 h-1.5 bg-white/20 hover:bg-white/40 transition-colors rounded-full" />
          <button 
             className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white"
             onClick={(e) => {
               e.stopPropagation();
               setSidebarState(prev => prev === "full" ? "half" : "full");
             }}
          >
            {sidebarState === "full" ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        <div className="px-4 md:px-6 pb-4 md:pb-6 pt-1 md:pt-6 space-y-4 md:space-y-8 flex flex-col flex-1 overflow-hidden">
          <div className="space-y-0.5 md:space-y-1 flex-shrink-0">
            <h1 className="text-3xl md:text-4xl font-bruno tracking-tighter text-accent inline-block">vitMaps</h1>
            <div className="text-[9px] md:text-[10px] font-bebas tracking-[0.3em] text-gray-500 uppercase">Indoor Navigation Suite</div>
          </div>
          
          <div className="space-y-3 md:space-y-4 flex-shrink-0">
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

          <div className="flex-1 overflow-y-auto space-y-4 md:space-y-6 pr-1 scrollbar-hide pb-2">
            <AlgorithmSelector
              selected={selectedAlgorithm}
              benchmarks={benchmarks}
              onChange={(key) => {
                setSelectedAlgorithm(key);
                try {
                  localStorage.setItem("vitmaps_algorithm", key);
                } catch (e) {}
                if (benchmarks[key]?.path) {
                  setRoute(benchmarks[key].path);
                  setIsNavigating(true);
                }
              }}
            />
          </div>
        </div>
        
        <div className="mt-auto p-3 md:p-4 border-t border-border-custom hidden md:block">
            <Footer />
        </div>
      </motion.aside>

      <main className="flex-1 w-full h-full relative z-10 bg-[#0a0a0a]">
        <Map
          userLocation={userLoc}
          Endnode={endNode?.nodeId}
          onSelectLocation={handleMapClick}
          onMarkerClick={handleMarkerClick}
          nodes={nodes}
          route={currentSegment}
          currentFloor={currentFloor}
        />

        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-[10000] space-y-4">
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

        <div className={`absolute left-4 right-4 md:left-6 md:right-6 z-[10000] transition-all duration-300 ${
           isMobile 
             ? (sidebarState === "minimized" ? "bottom-[56px]" : sidebarState === "half" ? "bottom-[calc(55dvh+16px)]" : "bottom-[100dvh]") 
             : "bottom-4 md:bottom-6"
        }`}>
          <BottomNavPanel
            route={route}
            startNode={startNode}
            endNode={endNode}
            isNavigating={isNavigating}
            loading={false}
            currentFloor={currentFloor?.id}
            floors={floors}
            onResetLocation={handleResetUserLocation}
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