"use client";
import React from "react";
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

  // Determine what to show for the current floor segment
  const transitionOut = findTransitionNode(currentNodes, "end"); // stair/elevator to leave this floor
  const transitionIn = findTransitionNode(currentNodes, "start"); // stair/elevator entering this floor

  // Build the display steps
  const steps = [];

  if (isMultiFloor) {
    const isFirstSegment = currentSegmentIndex === 0;
    const isLastSegment = currentSegmentIndex === segments.length - 1;

    if (isFirstSegment) {
      // First floor: Start → ... → Elevator/Stair
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
      // Last floor: Elevator/Stair → ... → Destination
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
      // Middle floor: Stair/Elevator → ... → Stair/Elevator
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
    // Single floor: just show Start → Destination
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
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="max-w-4xl mx-auto w-full relative z-[9999]"
      >
        <div
          className="rounded-3xl px-6 py-5 border-2 border-white/10 shadow-[0_30px_100px_rgba(0,0,0,1)]"
          style={{ backgroundColor: '#0a0a0a' }}
        >
          {/* Floor navigation + Route info */}
          <div className="flex items-center gap-4">
            {/* Prev floor button */}
            <div className="flex-shrink-0">
              {prevSegment ? (
                <button
                  onClick={() => onFloorChange(prevSegment.floor)}
                  className="bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded-xl hover:bg-white/10 transition-all text-sm flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">{getFloorName(prevSegment.floor)}</span>
                </button>
              ) : <div className="w-10" />}
            </div>

            {/* Center: route steps */}
            <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
              {steps.map((step, idx) => (
                <React.Fragment key={idx}>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold whitespace-nowrap ${
                    step.type === "start"
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : step.type === "end"
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  }`}>
                    <span>{step.icon}</span>
                    <span className="truncate max-w-[140px]">{step.label}</span>
                  </div>
                  {idx < steps.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-white/30 flex-shrink-0" strokeWidth={3} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Next floor button */}
            <div className="flex-shrink-0">
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