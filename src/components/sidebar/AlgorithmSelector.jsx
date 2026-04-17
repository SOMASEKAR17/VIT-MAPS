"use client";
import React from "react";
import { ALGORITHMS } from "../../utils/pathAlgorithms";

const algorithmKeys = Object.keys(ALGORITHMS);

const AlgorithmSelector = ({ selected, onChange, benchmarks = {} }) => {
  
  const hasBenchmarks = Object.keys(benchmarks).length > 0;
  let fastestKey = null;
  if (hasBenchmarks) {
    let minTime = Infinity;
    for (const key of algorithmKeys) {
      if (benchmarks[key] && benchmarks[key].timeMs < minTime) {
        minTime = benchmarks[key].timeMs;
        fastestKey = key;
      }
    }
  }

  return (
    <div className="space-y-3 pl-2">
      <div className="text-lg font-bebas text-gray-500 tracking-[0.2em] border-b border-white/5 pb-2 uppercase">
        Pathfinding Algorithm
      </div>
      <div className="space-y-2">
        {algorithmKeys.map((key) => {
          const algo = ALGORITHMS[key];
          const isActive = selected === key;
          const bench = benchmarks[key];
          const isFastest = fastestKey === key;

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
                <div className="flex items-center gap-2">
                  {isFastest && hasBenchmarks && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 font-sans font-bold uppercase">
                      ⚡ Fastest
                    </span>
                  )}
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
              </div>

              <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
                {algo.description}
              </p>

              <div className="flex items-center justify-between mt-2">
                <div className="text-[9px] text-gray-600 font-mono tracking-wider uppercase">
                  Complexity: {algo.complexity}
                </div>

                {bench && (
                  <div className="flex items-center gap-3">
                    <div className={`text-[11px] font-mono font-bold ${isFastest ? 'text-green-400' : 'text-accent/70'}`}>
                      {bench.timeMs < 1 ? `${(bench.timeMs * 1000).toFixed(0)}µs` : `${bench.timeMs.toFixed(2)}ms`}
                    </div>
                    <div className="text-[9px] text-gray-600 font-mono">
                      {bench.pathLength} nodes
                    </div>
                  </div>
                )}
              </div>

              {}
              {bench && hasBenchmarks && (() => {
                const maxTime = Math.max(...Object.values(benchmarks).map(b => b.timeMs));
                const pct = maxTime > 0 ? (bench.timeMs / maxTime) * 100 : 0;
                return (
                  <div className="mt-2 w-full h-1 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isFastest ? 'bg-green-400' : 'bg-accent/40'}`}
                      style={{ width: `${Math.max(pct, 3)}%` }}
                    />
                  </div>
                );
              })()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AlgorithmSelector;
