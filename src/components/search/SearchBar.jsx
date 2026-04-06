"use client";
import React, { useEffect, useRef, useState } from 'react';
import SearchResult from './SearchResult';
import useDebounce from '../../hooks/useDebounce';
const MIN_SEARCH_CHARS = 1;
const SearchBar = ({ nodes = [], onSelectNode, onSetLocation, mode = "search" }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  useEffect(() => {
    const trimmed = debouncedQuery.trim().toLowerCase();
    if (trimmed.length >= MIN_SEARCH_CHARS) {
      const filtered = nodes.filter((n) => {
        const name = n.name || n.nodeId || "";
        return name.toLowerCase().includes(trimmed);
      });
      setResults(filtered);
      setShowDropdown(true);
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  }, [debouncedQuery, nodes]);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!wrapperRef.current?.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);
  const handleSelect = (node) => {
    if (mode === "setLocation") {
      onSetLocation?.(node);
    } else {
      onSelectNode?.(node);
    }
    setQuery(''); 
    setShowDropdown(false);
  };
  return (
    <div
      ref={wrapperRef}
      className="relative w-full z-50"
    >
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-500 group-focus-within:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder={
            mode === "setLocation" ? "Set your starting location…" : "Search destinations…"
          }
          className="w-full pl-11 pr-4 py-3 rounded-full bg-card border border-border-custom focus:neon-border outline-none transition-all text-sm placeholder:text-gray-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() =>
            query.trim().length >= MIN_SEARCH_CHARS && setShowDropdown(true)
          }
        />
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 mt-3 max-h-72 overflow-y-auto bg-card border border-border-custom shadow-glass rounded-2xl text-sm z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {results.length > 0 ? (
            <ul className="divide-y divide-border-custom">
              {results.map((node) => (
                <SearchResult
                  key={node.nodeId}
                  node={{
                    ...node,
                    displayName: `${node.name || node.nodeId} (Floor ${
                      node.coordinates?.floor || "?"
                    })`,
                  }}
                  onSelect={() => handleSelect(node)}
                />
              ))}
            </ul>
          ) : (
            <div className="px-5 py-4 text-gray-500 text-center">No locations found</div>
          )}
        </div>
      )}
    </div>
  );
};
export default SearchBar;