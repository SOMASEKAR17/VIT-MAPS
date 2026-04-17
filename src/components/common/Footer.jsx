"use client";
import React, { useState, useEffect, useRef } from "react";
import { Info, Mail, MessageSquare } from "lucide-react";
const Footer = () => {
  const [showHelp, setShowHelp] = useState(false);
  const [viewCount, setViewCount] = useState(null);
  const hasIncremented = useRef(false);
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/views");
        const data = await res.json();
        setViewCount(data.count);
      } catch (err) {
        console.error("Failed to fetch global view count:", err);
      }
    };
    if (!hasIncremented.current) {
      fetchCount();
      hasIncremented.current = true;
    }
  }, []);
  return (
    <>
      <footer className="w-full bg-surface border-t border-border-custom py-4 px-4 overflow-hidden">
        <div className="flex flex-col gap-2 text-xs text-gray-500">
          <div className="truncate">
            © 2026{" "}
            <span
              onClick={() => setShowHelp(true)}
              className="font-bold text-accent cursor-pointer hover:brightness-110 transition font-bruno tracking-wider"
            >
              VIT-MAPS
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHelp(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-border-custom hover:neon-border text-gray-300 py-2 rounded-xl transition text-xs"
            >
              <Info size={14} />
              <span>How to Navigate</span>
            </button>
            <a
              href="https://somasekar.vercel.app/contact"
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-border-custom hover:neon-border text-gray-300 py-2 rounded-xl transition text-xs"
            >
              <MessageSquare size={14} />
              <span>Feedback</span>
            </a>
          </div>
        </div>
      </footer>
      {showHelp && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-[999]"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:w-[420px] max-h-[80vh] overflow-y-auto p-5 sm:p-6 text-gray-700 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bebas text-2xl text-gray-300 tracking-widest">
                How to Navigate with vitMaps
              </h4>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-500 hover:text-gray-700 transition text-sm"
              >
                ✕
              </button>
            </div>
            <ul className="list-disc list-inside space-y-2 text-[14px] leading-relaxed">
              <li>
                <span className="font-medium">Step 1: Set Your Start:</span> Look for the 
                <span className="text-accent font-semibold ml-1">"Set Your Location"</span> box. 
                Search for your current room or tap anywhere on the map to drop your 
                <span className="text-accent font-semibold ml-1">starting pin</span>.
              </li>
              <li>
                <span className="font-medium">Step 2: Find Your Destination:</span> Once your start is set, 
                the <span className="text-accent font-semibold ml-1">"Find Your Room"</span> box will activate. 
                Search for where you want to go.
              </li>
              <li>
                <span className="font-medium">Navigate:</span> Your route will appear as a 
                <span className="text-accent font-semibold ml-1">glowing neon path</span>. 
                Follow the arrows in the navigation panel.
              </li>
            </ul>
            <div className="mt-3 border-t border-gray-200 pt-2">
              <p className="text-xs text-gray-600 sm:text-[13px]">
                <span className="font-semibold">Note:</span> If your route includes
                stairs or an elevator, the map{" "}
                <span className="font-semibold">won’t switch floors automatically</span>.
                Tap the{" "}
                <span className="font-medium text-gray-800">⏩ map button</span> in the
                bottom-left to change floors.
              </p>
            </div>
            <div className="mt-4 flex justify-center items-center gap-1 text-gray-500 text-xs">
              <span>
                {viewCount !== null
                  ? `This site has been opened ${viewCount} times globally`
                  : "Loading view count..."}
              </span>
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowHelp(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition w-full sm:w-auto"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Footer;