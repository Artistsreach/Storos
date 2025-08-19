import React from 'react';

export default function Connector({ windowId, onMouseDown }) {
  return (
    <div
      className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-pointer"
      onMouseDown={(e) => onMouseDown(e, windowId)}
    />
  );
}
