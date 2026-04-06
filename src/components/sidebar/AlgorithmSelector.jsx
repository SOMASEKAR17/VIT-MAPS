"use client";
import React from "react";
import { ALGORITHMS } from "../../utils/pathAlgorithms";

const algorithmKeys = Object.keys(ALGORITHMS);

const AlgorithmSelector = ({ selected, onChange }) => {
  return (
    <div className="space-y-3 pl-2">
      <div className="text-lg font-bebas text-gray-500 tracking-[0.2em] border-b border-white/5 pb-2 uppercase">
        Pathfinding Algorithm
      </div>
      <div className="space-y-2">
        {algorithmKeys.map((key) => {
          const algo = ALGORITHMS[key];
          const isActive = selected === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`w-full text-left p-4 rounded-xl border transition-all group cursor-pointer ${
                isActive
                  ? "bg-accent/10 border-accent/40 neon-border scale-[1.02]"
                  : "bg-card border-border-custom hover:border-white/20 hover:bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`font-bebas text-xl tracking-wide transition-colors ${
                    isActive ? "text-accent" : "text-gray-200 group-hover:text-accent"
                  }`}
                >
                  {algo.name}
                </span>
                <span
                  className={`text-[10px] px-3 py-1 rounded-full uppercase font-sans font-bold border ${
                    isActive
                      ? "bg-accent/20 border-accent/30 text-accent"
                      : "bg-white/5 border-white/10 text-gray-500"
                  }`}
                >
                  {algo.badge}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
                {algo.description}
              </p>
              <div className="text-[9px] text-gray-600 font-mono mt-1 tracking-wider uppercase">
                Complexity: {algo.complexity}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AlgorithmSelector;
