"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
const FloorSelector = ({ floors = [], currentFloor, onChange }) => {
  const [open, setOpen] = useState(false);
  const handleSelect = (floorObj) => {
    onChange?.(floorObj);
    setOpen(false);
  };
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="glass text-white text-sm px-5 py-3 rounded-full shadow-glass hover:neon-border transition-all flex items-center gap-2"
      >
        <span>Floor: {currentFloor?.name || "Select"}</span>
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full right-0 mb-3 bg-surface border border-border-custom rounded-2xl shadow-glass p-2 min-w-[160px] flex flex-col space-y-1"
          >
            {floors.map((floor) => (
              <button
                key={floor.id}
                onClick={() => handleSelect(floor)}
                className={`px-4 py-2.5 rounded-xl text-left text-sm transition-all ${
                  floor.id === currentFloor?.id
                    ? "bg-accent/20 text-accent font-medium"
                    : "text-gray-300 hover:bg-white/5"
                }`}
              >
                {floor.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default FloorSelector;