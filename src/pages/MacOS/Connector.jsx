import React from 'react';

export default function Connector({
  windowId,
  onMouseDown,
  side = 'right', // 'right' | 'left'
  size = 32, // interpreted as height of the tab
  tabWidth = 12,
  color = 'bg-blue-500',
  title = 'Connect'
}) {
  const isLeft = side === 'left';
  const sideClasses = isLeft
    ? 'left-0 -translate-x-full rounded-l-md'
    : 'right-0 translate-x-full rounded-r-md';
  const heightPx = `${Math.max(16, Number(size))}px`;
  const widthPx = `${Math.max(8, Number(tabWidth))}px`;

  const handleMouseDown = (e) => {
    // Prevent parent window drag handlers and default drag behavior
    e.preventDefault();
    e.stopPropagation();
    if (typeof onMouseDown === 'function') onMouseDown(e, windowId);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof onMouseDown === 'function') onMouseDown(e, windowId);
  };

  const handleDragStart = (e) => {
    // Disable native HTML5 drag which could interfere with window dragging
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof onMouseDown === 'function') onMouseDown(e, windowId);
  };

  return (
    <button
      type="button"
      aria-label={title}
      title={title}
      data-side={side}
      className={`ff-connector absolute ${sideClasses} top-1/2 -translate-y-1/2 cursor-pointer shadow-sm ring-1 ring-white/40 ${color} hover:opacity-90 active:scale-95`}
      style={{ width: widthPx, height: heightPx, touchAction: 'none', userSelect: 'none', zIndex: 1000, pointerEvents: 'auto' }}
      draggable={false}
      onPointerDownCapture={handlePointerDown}
      onMouseDownCapture={handleMouseDown}
      onTouchStartCapture={handleTouchStart}
      onPointerDown={handlePointerDown}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onDragStart={handleDragStart}
    />
  );
}
