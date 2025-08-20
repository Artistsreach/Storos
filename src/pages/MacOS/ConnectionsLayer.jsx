import React from 'react';

export default function ConnectionsLayer({ connections, openWindows, newConnection, panOffset }) {
  const getConnectorPosition = (windowId) => {
    const win = openWindows.find((w) => w.id === windowId);
    if (!win || !win.position) return null;
    const width = win.width || 800;
    const x = (win.position.left || 0) + width - 8 + (panOffset?.x || 0);
    const y = (win.position.top || 0) + 20 + (panOffset?.y || 0);
    return { x, y };
  };

  const pathBetween = (a, b, sideStart, sideEnd) => {
    if (!a || !b) return '';
    const dx = b.x - a.x;
    const adx = Math.abs(dx);
    const d = Math.max(40, adx * 0.4);
    // Determine control x for start
    let c1x;
    if (sideStart === 'left') c1x = a.x - d; else if (sideStart === 'right') c1x = a.x + d; else c1x = a.x + (dx >= 0 ? d : -d);
    // Determine control x for end
    let c2x;
    if (sideEnd === 'left') {
      c2x = b.x - d;
    } else if (sideEnd === 'right') {
      c2x = b.x + d;
    } else if (sideStart === 'right') {
      // pull end handle back to the left so the curve flows outward from the right connector
      c2x = b.x - d;
    } else if (sideStart === 'left') {
      // pull end handle back to the right so the curve flows outward from the left connector
      c2x = b.x + d;
    } else {
      c2x = b.x - (dx >= 0 ? d : -d);
    }
    const c1y = a.y;
    const c2y = b.y;
    return `M ${a.x},${a.y} C ${c1x},${c1y} ${c2x},${c2y} ${b.x},${b.y}`;
  };

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 9999 }}>
      {connections.map((conn, index) => {
        const fromPos = getConnectorPosition(conn.from);
        const toPos = getConnectorPosition(conn.to);
        if (!fromPos || !toPos) return null;
        const d = pathBetween(fromPos, toPos);
        return (
          <path
            key={index}
            d={d}
            fill="none"
            stroke="black"
            strokeWidth="2"
          />
        );
      })}
      {newConnection && newConnection.from && (
        (() => {
          const usingLocal = !!newConnection.startLocal;
          const start = usingLocal
            ? { x: newConnection.startLocal.x + (panOffset?.x || 0), y: newConnection.startLocal.y + (panOffset?.y || 0) }
            : getConnectorPosition(newConnection.from);
          if (!start) return null;
          const end = usingLocal
            ? { x: newConnection.to.x + (panOffset?.x || 0), y: newConnection.to.y + (panOffset?.y || 0) }
            : {
                x: newConnection.to.x + (panOffset?.x || 0),
                y: newConnection.to.y + (panOffset?.y || 0),
              };
          const d = pathBetween(start, end, newConnection.side, undefined);
          return (
            <path
              d={d}
              fill="none"
              stroke="black"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          );
        })()
      )}
    </svg>
  );
}
