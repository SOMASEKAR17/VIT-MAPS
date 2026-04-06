"use client";
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
  initial={{ y: 100, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  exit={{ y: 100, opacity: 0 }}
  transition={{ type: "spring", stiffness: 300, damping: 25 }}
  className="fixed bottom-14 left-4 right-4 z-60 bg-white text-gray-800 px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between space-x-2"
>
        <div className="flex gap-2">
          {prevSegment && (
            <button
              onClick={() => onFloorChange(prevSegment.floor)}
              className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
            ⏪ {getFloorName(prevSegment.floor)}
            </button>
          )}
          {nextSegment && (
            <button
              onClick={() => onFloorChange(nextSegment.floor)}
              className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            > 
               ⏩  {getFloorName(nextSegment.floor)}
            </button>
          )}
        </div>
        <div className="flex-1 text-center truncate font-medium">
          {displayNodes.map((n, idx) => (
            <span key={idx}>
              {n.name}
              {idx < displayNodes.length - 1 && " → "}
            </span>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
export default BottomNavPanel;