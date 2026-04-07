"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Flag, ArrowUpDown, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { splitPathByFloor } from "../../utils/splitPathByFloor";

const BottomNavPanel = ({
  route = [],
  isNavigating = false,
  currentFloor,
  floors = [],
  onFloorChange,
  startNode,
  endNode,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    setIsMinimized(false);
  }, [route]);

  if (!isNavigating || route.length === 0) return null;

  const getFloorName = (id) => floors.find(f => String(f.id) === String(id))?.name || `Floor ${id}`;
  const segments = splitPathByFloor(route);
  const currentSegmentIndex = segments.findIndex(seg => String(seg.floor) === String(currentFloor));
  const isMultiFloor = segments.length > 1;

  // Find transition nodes (elevator/stair) for the current segment
  const findTransitionNode = (nodes, direction) => {
    const isTransition = (n) => {
      const type = n.type?.toLowerCase() || "";
      const name = n.name?.toLowerCase() || "";
      return type === "elevator" || type === "stair" || type === "stairs" ||
             name.includes("stair") || name.includes("elevator") || name.includes("lift");
    };
    if (direction === "end") {
      for (let i = nodes.length - 1; i >= 0; i--) {
        if (isTransition(nodes[i])) return nodes[i];
      }
    } else {
      for (let i = 0; i < nodes.length; i++) {
        if (isTransition(nodes[i])) return nodes[i];
      }
    }
    return null;
  };

  const currentSegment = segments[currentSegmentIndex];
  const currentNodes = currentSegment?.nodes || [];
  const nextSegment = segments[currentSegmentIndex + 1];
  const prevSegment = segments[currentSegmentIndex - 1];

  const transitionOut = findTransitionNode(currentNodes, "end");
  const transitionIn = findTransitionNode(currentNodes, "start");
  const steps = [];

  if (isMultiFloor) {
    const isFirstSegment = currentSegmentIndex === 0;
    const isLastSegment = currentSegmentIndex === segments.length - 1;

    if (isFirstSegment) {
      steps.push({
        label: startNode?.name || "Start",
        icon: <MapPin className="w-4 h-4" />,
        type: "start",
      });
      if (transitionOut) {
        const isElevator = transitionOut.type?.toLowerCase() === "elevator" ||
                           transitionOut.name?.toLowerCase().includes("elevator") ||
                           transitionOut.name?.toLowerCase().includes("lift");
        steps.push({
          label: transitionOut.name || (isElevator ? "Elevator" : "Stairs"),
          icon: isElevator ? <ArrowUpDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />,
          type: "transition",
        });
      }
    } else if (isLastSegment) {
      if (transitionIn) {
        const isElevator = transitionIn.type?.toLowerCase() === "elevator" ||
                           transitionIn.name?.toLowerCase().includes("elevator") ||
                           transitionIn.name?.toLowerCase().includes("lift");
        steps.push({
          label: transitionIn.name || (isElevator ? "Elevator" : "Stairs"),
          icon: isElevator ? <ArrowUpDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />,
          type: "transition",
        });
      }
      steps.push({
        label: endNode?.name || "Destination",
        icon: <Flag className="w-4 h-4" />,
        type: "end",
      });
    } else {
      if (transitionIn) {
        const isElevator = transitionIn.type?.toLowerCase() === "elevator" ||
                           transitionIn.name?.toLowerCase().includes("elevator");
        steps.push({
          label: transitionIn.name || (isElevator ? "Elevator" : "Stairs"),
          icon: isElevator ? <ArrowUpDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />,
          type: "transition",
        });
      }
      if (transitionOut && transitionOut.nodeId !== transitionIn?.nodeId) {
        const isElevator = transitionOut.type?.toLowerCase() === "elevator" ||
                           transitionOut.name?.toLowerCase().includes("elevator");
        steps.push({
          label: transitionOut.name || (isElevator ? "Elevator" : "Stairs"),
          icon: isElevator ? <ArrowUpDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />,
          type: "transition",
        });
      }
    }
  } else {
    steps.push({
      label: startNode?.name || "Start",
      icon: <MapPin className="w-4 h-4" />,
      type: "start",
    });
    steps.push({
      label: endNode?.name || "Destination",
      icon: <Flag className="w-4 h-4" />,
      type: "end",
    });
  }

  return (
    <AnimatePresence>
      <motion.div
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        onDragEnd={(e, info) => {
          if (info.offset.y > 50 || info.velocity.y > 200) {
            setIsMinimized(true);
          } else if (info.offset.y < -20 || info.velocity.y < -200) {
            setIsMinimized(false);
          }
        }}
        initial={{ y: 50, opacity: 0 }}
        animate={{ 
          y: isMinimized ? "calc(100% - 24px)" : 0, 
          opacity: 1 
        }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="max-w-4xl mx-auto w-full relative z-[9999] touch-none md:touch-auto"
      >
        <div
          className="rounded-t-3xl md:rounded-3xl px-3 md:px-6 pb-4 md:pb-5 pt-2 md:pt-5 border-2 border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-[0_30px_100px_rgba(0,0,0,1)] flex flex-col items-center"
          style={{ backgroundColor: '#0a0a0a' }}
        >
          <div 
            className="w-full flex justify-center pb-3 pt-1 md:hidden cursor-pointer"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <div className="w-12 h-1.5 bg-white/20 hover:bg-white/40 transition-colors rounded-full" />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 w-full">
            <div className="flex-shrink-0 w-full md:w-auto flex justify-between md:block order-2 md:order-1">
              {prevSegment ? (
                <button
                  onClick={() => onFloorChange(prevSegment.floor)}
                  className="bg-white/5 border border-white/10 text-white px-3 md:px-4 py-2 md:py-2.5 rounded-xl hover:bg-white/10 transition-all text-xs md:text-sm flex items-center gap-1 md:gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="font-medium">{getFloorName(prevSegment.floor)}</span>
                </button>
              ) : <div className="w-10 hidden md:block" />}
              {nextSegment ? (
                <button
                  onClick={() => onFloorChange(nextSegment.floor)}
                  className="bg-accent/20 border border-accent/30 text-accent px-3 py-2 rounded-xl hover:bg-accent hover:text-black transition-all text-xs font-semibold flex items-center gap-1 md:hidden"
                >
                  <span className="">{getFloorName(nextSegment.floor)}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : <div className="w-10 hidden md:block" />}
            </div>

            <div className="flex-1 flex flex-wrap md:flex-nowrap items-center justify-center gap-1.5 md:gap-2 min-w-0 order-1 md:order-2 w-full">
              {steps.map((step, idx) => (
                <React.Fragment key={idx}>
                  <div className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap ${
                    step.type === "start"
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : step.type === "end"
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  }`}>
                    <span className="scale-75 md:scale-100">{step.icon}</span>
                    <span className="truncate max-w-[80px] md:max-w-[140px]">{step.label}</span>
                  </div>
                  {idx < steps.length - 1 && (
                    <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-white/30 flex-shrink-0" strokeWidth={3} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Next floor button (Desktop) */}
            <div className="flex-shrink-0 hidden md:block order-3">
              {nextSegment ? (
                <button
                  onClick={() => onFloorChange(nextSegment.floor)}
                  className="bg-accent/20 border border-accent/30 text-accent px-4 py-2.5 rounded-xl hover:bg-accent hover:text-black transition-all text-sm font-semibold flex items-center gap-2"
                >
                  <span className="hidden sm:inline">{getFloorName(nextSegment.floor)}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : <div className="w-10" />}
            </div>
          </div>

          {/* Floor indicator for multi-floor routes */}
          {isMultiFloor && (
            <div className="flex items-center justify-center gap-1.5 mt-3 pt-3 border-t border-white/5">
              {segments.map((seg, idx) => (
                <React.Fragment key={idx}>
                  <button
                    onClick={() => onFloorChange(seg.floor)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg transition-all font-medium ${
                      String(seg.floor) === String(currentFloor)
                        ? "bg-accent/20 text-accent border border-accent/30"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {getFloorName(seg.floor)}
                  </button>
                  {idx < segments.length - 1 && (
                    <span className="text-gray-600 text-[10px]">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BottomNavPanel;