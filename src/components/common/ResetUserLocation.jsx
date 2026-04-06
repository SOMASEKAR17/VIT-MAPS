"use client";
import React from "react";
import { FiRefreshCw } from "react-icons/fi"; 
const ResetUserLocation = ({ onReset }) => {
  return (
    <div className="relative">
      <button
        onClick={onReset}
        className="w-14 h-14 flex items-center justify-center bg-[#0a0a0a]/90 backdrop-blur-xl text-white rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] border-2 border-white/10 hover:border-accent hover:text-accent transition-all group pointer-events-auto"
        title="Reset My Location"
      >
        <FiRefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
      </button>
    </div>
  );
};
export default ResetUserLocation;