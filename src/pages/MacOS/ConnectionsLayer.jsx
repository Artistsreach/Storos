import React from 'react';

export default function ConnectionsLayer({ connections, openWindows, newConnection }) {
  const getConnectorPosition = (windowId) => {
    const window = openWindows.find((w) => w.id === windowId);
    if (!window) return null;
    return {
      x: window.position.left + (window.width || 800) - 8,
      y: window.position.top + 20,
    };
  };

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 9999 }}>
      {connections.map((conn, index) => {
        const fromPos = getConnectorPosition(conn.from);
        const toPos = getConnectorPosition(conn.to);
        if (!fromPos || !toPos) return null;
        return (
          <line
            key={index}
            x1={fromPos.x}
            y1={fromPos.y}
            x2={toPos.x}
            y2={toPos.y}
            stroke="black"
            strokeWidth="2"
          />
        );
      })}
      {newConnection && newConnection.from && (
        <line
          x1={getConnectorPosition(newConnection.from)?.x}
          y1={getConnectorPosition(newConnection.from)?.y}
          x2={newConnection.to.x}
          y2={newConnection.to.y}
          stroke="black"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
      )}
    </svg>
  );
}
