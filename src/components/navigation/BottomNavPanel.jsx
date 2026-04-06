"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { splitPathByFloor } from "../../utils/splitPathByFloor";

const BottomNavPanel = ({
  route = [],
  isNavigating = false,
  currentFloor,
  floors = [],
  onFloorChange,
}) => {
  if (!isNavigating || route.length === 0) return null;

  const getFloorName = (id) => floors.find(f => String(f.id) === String(id))?.name || `Floor ${id}`;
  const segments = splitPathByFloor(route);
  const currentSegmentIndex = segments.findIndex(seg => String(seg.floor) === String(currentFloor));
  const currentSegment = segments[currentSegmentIndex];
  const overviewNodes = currentSegment?.nodes || [];

  let displayNodes = [];
  if (overviewNodes.length > 0) {
    if (currentSegmentIndex === 0 && segments.length > 1) {
      const firstNode = overviewNodes[0];
      const stairNode = overviewNodes.find(n => n.name.toLowerCase().includes("stair") || n.name.toLowerCase().includes("lift"));
      displayNodes = stairNode ? [firstNode, stairNode] : [firstNode];
    } else if (currentSegmentIndex === segments.length - 1 && segments.length > 1) {
      const stairNode = overviewNodes.find(n => n.name.toLowerCase().includes("stair") || n.name.toLowerCase().includes("lift"));
      const lastNode = overviewNodes[overviewNodes.length - 1];
      displayNodes = stairNode ? [stairNode, lastNode] : [lastNode];
    } else {
      displayNodes = overviewNodes;
    }
  }

  const nextSegment = segments[currentSegmentIndex + 1];
  const prevSegment = segments[currentSegmentIndex - 1];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{ background: '#121212', opacity: 1 }}
        className="rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] px-10 py-6 flex items-center justify-between space-x-6 border-2 border-white/10 max-w-3xl mx-auto w-full"
      >
        <div className="flex gap-3">
          {prevSegment && (
            <button
              onClick={() => onFloorChange(prevSegment.floor)}
              className="bg-white/5 border border-border-custom text-white px-4 py-2 rounded-xl hover:neon-border transition-all text-sm flex items-center gap-2"
            >
              <span>⏪</span>
              <span className="hidden sm:inline font-medium">{getFloorName(prevSegment.floor)}</span>
            </button>
          )}
          {nextSegment && (
            <button
              onClick={() => onFloorChange(nextSegment.floor)}
              className="bg-accent/20 border border-accent/30 text-accent px-4 py-2 rounded-xl hover:bg-accent hover:text-black transition-all text-sm font-semibold flex items-center gap-2"
            >
              <span>⏩</span>
              <span className="hidden sm:inline">{getFloorName(nextSegment.floor)}</span>
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-wrap justify-center items-center gap-3 text-[15px] text-white font-bold tracking-wide">
          {displayNodes.map((n, idx) => (
            <React.Fragment key={idx}>
              <span className={idx === displayNodes.length - 1 ? "text-accent" : ""}>
                {(!n.name || n.name.startsWith("Node")) ? `Step ${idx + 1}` : n.name}
              </span>
              {idx < displayNodes.length - 1 && (
                <svg className="w-4 h-4 text-accent/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </React.Fragment>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BottomNavPanel;