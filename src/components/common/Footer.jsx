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
      <footer className="fixed bottom-0 left-0 w-full bg-white shadow-inner border-t border-gray-200 py-2.5 px-4 z-50">
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
          <div className="truncate">
            © 2026{" "}
            <span
              onClick={() => setShowHelp(true)}
              className="font-semibold text-gray-800 cursor-pointer hover:text-blue-600 transition"
              title="How to Navigate"
            >
              VIT-MAPS
            </span>{" "}
            · Engineered by{" "}
            <span
              onClick={() => setShowContact(true)}
              className="text-gray-800 cursor-pointer hover:text-blue-600 transition"
              title="Contact Team"
            >
              Illuminati Team
            </span>{" "}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowHelp(true)}
              className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-md text-xs sm:text-sm transition"
            >
              <Info size={14} />
              <span className="hidden sm:inline">How to Navigate</span>
            </button>
            <a
              href="https://forms.gle/vbZHzFdV8WAhCZEDA"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs sm:text-sm transition"
            >
              <MessageSquare size={14} />
              <span className="hidden sm:inline">Feedback</span>
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
              <h4 className="font-semibold text-gray-800 text-lg">
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
                <span className="font-medium">Set Your Start:</span> Double-tap your
                location on the map or search your nearest location in the search bar
                to drop the{" "}
                <span className="text-green-600 font-semibold">green starting pin</span>.
              </li>
              <li>
                <span className="font-medium">Find Your Destination:</span> Use the
                top search bar to type your destination (e.g.,{" "}
                <span className="italic">Library</span> or{" "}
                <span className="italic">Room 301</span>).
              </li>
              <li>
                <span className="font-medium">Select & Go:</span> Pick your destination
                — your route appears as a{" "}
                <span className="text-blue-600 font-semibold">blue line</span>.
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