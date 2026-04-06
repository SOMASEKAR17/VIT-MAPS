"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
const Map = dynamic(() => import("../../components/map/Map"), { ssr: false });
import SearchBar from "../../components/search/SearchBar";
import BottomNavPanel from "../../components/navigation/BottomNavPanel";
import FloorSelector from "../../components/sidebar/FloorSelector";
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
    if (!startNode?.nodeId) return; 
    setEndNode(node);
    const path = findMultiFloorPath(projectSchema, startNode.nodeId, node.nodeId);
    setRoute(path);
    setIsNavigating(true);
    const segments = splitPathByFloor(path);
    const firstSegment = segments.find((seg) => seg.nodes.length > 0);
    if (firstSegment) {
      setCurrentFloor(floors.find((f) => f.id === firstSegment.floor));
      setUserLoc(firstSegment.nodes[0].coordinates);
      setStartNode(firstSegment.nodes[0]);
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
  if (showSplash) return <SplashScreen />;
  return (
    <div className="flex flex-col w-full h-screen bg-gray-100 overflow-hidden">
      <div className="z-50">
        <SearchBar
          nodes={nodes}
          mode={searchMode}
          onSetLocation={handleSetUserLocation}
          onSelectNode={handleDestSelect}
        />
      </div>
      <div className="flex-1 relative z-10">
        <Map
          userLocation={userLoc}
          Endnode={endNode?.nodeId}
          onSelectLocation={handleMapClick}
          nodes={nodes}
          route={currentSegment}
          currentFloor={currentFloor}
        />
      </div>
      <div className="z-20 relative">
        <ResetUserLocation onReset={handleResetUserLocation} />
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
      <Footer />
    </div>
  );
};
export default Home;