"use client";
import React from 'react';
import clsx from 'clsx';
const SearchResult = ({ node, onSelect, isHighlighted }) => {
  const handlePick = () => onSelect(node);
  return (
    <li
      className={clsx(
        'px-4 py-2 cursor-pointer hover:bg-blue-100',
        isHighlighted && 'bg-blue-100'
      )}
      onMouseDown={handlePick}   
      onTouchStart={handlePick}  
    >
      {node.displayName || node.name || node.nodeId}
    </li>
  );
};
export default SearchResult;