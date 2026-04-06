"use client";
import React from "react";
import { FiRefreshCw } from "react-icons/fi"; 
const ResetUserLocation = ({ onReset }) => {
  return (
    <div className="relative">
      <button
        onClick={onReset}
        className="w-14 h-14 flex items-center justify-center glass text-white rounded-full shadow-glass hover:neon-border transition-all group"
        title="Reset My Location"
      >
        <FiRefreshCw className="w-6 h-6 group-hover:text-accent transition-colors" />
      </button>
    </div>
  );
};
export default ResetUserLocation;