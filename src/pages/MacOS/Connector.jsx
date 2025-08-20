import React from 'react';

export default function Connector({
  windowId,
  onMouseDown,
  side = 'right', // 'right' | 'left'
  size = 16,
  color = 'bg-blue-500',
  title = 'Connect'
}) {
  const sideClasses = side === 'left' ? 'left-2' : 'right-2';
  const dimension = `${Math.max(8, Number(size))}px`;

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
      className={`ff-connector absolute ${sideClasses} top-1/2 -translate-y-1/2 rounded-full cursor-pointer shadow-sm ring-1 ring-white/40 ${color} hover:opacity-90 active:scale-95`}
      style={{ width: dimension, height: dimension, touchAction: 'none', userSelect: 'none' }}
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
