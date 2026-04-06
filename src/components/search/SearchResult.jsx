"use client";
import React from 'react';
import clsx from 'clsx';
const SearchResult = ({ node, onSelect, isHighlighted }) => {
  const handlePick = () => onSelect(node);
  return (
    <li
      className={clsx(
        'px-5 py-3 cursor-pointer transition-colors hover:bg-white/5 text-gray-300',
        isHighlighted && 'bg-white/10 text-accent font-medium'
      )}
      onMouseDown={handlePick}   
      onTouchStart={handlePick}  
    >
      {node.displayName || node.name || node.nodeId}
    </li>
  );
};
export default SearchResult;