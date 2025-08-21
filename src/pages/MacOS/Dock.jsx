import React, { useEffect, useMemo, useRef, useState, forwardRef } from 'react';
import { motion } from 'framer-motion';

const dockApps = [
  { id: 'video', name: 'Video', icon: '🎥', url: 'https://studio.freshfront.co' },
  { id: 'nft', name: 'NFT', icon: '🖼️', url: 'https://nft.freshfront.co' },
  { id: 'music', name: 'Music', icon: <img src="https://kmgahoiiiihmfjnsblij.supabase.co/storage/v1/object/public/music//Mmicon.png.png" alt="Music" className="w-8 h-8" />, url: 'https://musicmigo.com' },
  { id: 'product', name: 'Product', icon: '📦', url: 'https://freshfront.co/designer' },
  { id: 'podcast', name: 'Podcast', icon: '🎙️', url: 'https://freshfront.co/podcast' },
  { id: 'store', name: 'Store', icon: '🛍️', url: 'https://freshfront.co' },
  { id: 'app', name: 'App', icon: '⚙️', url: 'https://build.freshfront.co' },
  { id: 'website', name: 'Website', icon: '🌐', url: 'https://freshfront.co/page-generator' },
  { id: 'search', name: 'Search', icon: '🔍', url: 'https://freshfront.co/search' },
  { id: 'frontst', name: 'Front St.', icon: '🏘️', url: '/play' },
];

// Single item with its own dragControls so we can start drag after long-press
const DockItem = ({ app, index, onDrop, onClick, hoveredApp, setHoveredApp }) => {
  const draggedRef = useRef(false);
  const droppedOnceRef = useRef(false);
  const itemRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({ left: 0, top: 0 });
  const lastPointRef = useRef({ x: 0, y: 0 });


  // Clean label: avoid showing raw URLs as names
  let label = app.name;
  try {
    if (typeof app.name === 'string' && /^https?:\/\//.test(app.name) && app.url) {
      label = new URL(app.url, window.location.origin).hostname;
    }
  } catch {}

  // The draggable node rendered in-flow; during drag we switch it to fixed positioning
  const draggableNode = (
    <motion.div
      key={app.id}
      ref={itemRef}
      drag
      dragMomentum={false}
      onDrag={(event, info) => {
        lastPointRef.current = { x: info.point.x, y: info.point.y };
      }}
      onDragStart={(event, info) => {
        draggedRef.current = true;
        droppedOnceRef.current = false;
        // Measure current screen position
        try {
          const rect = itemRef.current?.getBoundingClientRect();
          if (rect) {
            setDragOrigin({ left: rect.left, top: rect.top });
          }
        } catch {}
        setIsDragging(true);
      }}
      onDragEnd={(event, info) => {
        if (onDrop && !droppedOnceRef.current) {
          const hitX = (event && event.clientX != null) ? event.clientX : info.point.x;
          const hitY = (event && event.clientY != null) ? event.clientY : info.point.y;
          onDrop(app, hitX, hitY);
          droppedOnceRef.current = true;
        }
        draggedRef.current = false;
        setIsDragging(false);
      }}
      className="relative"
      style={
        isDragging ? { position: 'fixed', left: dragOrigin.left, top: dragOrigin.top, zIndex: 1000 } : undefined
      }
      onMouseEnter={() => setHoveredApp(index)}
      onMouseLeave={() => setHoveredApp(null)}
      onPointerUp={(e) => {
        if (isDragging && !droppedOnceRef.current) {
          // Fallback to ensure drop occurs even if dragEnd is skipped
          const hitX = (e && e.clientX != null) ? e.clientX : lastPointRef.current.x;
          const hitY = (e && e.clientY != null) ? e.clientY : lastPointRef.current.y;
          if (onDrop) {
            onDrop(app, hitX, hitY);
            droppedOnceRef.current = true;
          }
          draggedRef.current = false;
          setIsDragging(false);
        }
      }}
      onClick={(e) => {
        if (draggedRef.current) return;
        onClick(app);
      }}
    >
      <motion.div
        className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing"
        animate={{
          scale: hoveredApp === index ? 1.2 : 1,
          y: hoveredApp === index ? -8 : 0,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        whileTap={{ scale: 0.98 }}
        whileDrag={{ scale: 1.05 }}
      >
      {
        React.isValidElement(app.icon)
          ? app.icon
          : (typeof app.icon === 'string' && (/^https?:\/\//.test(app.icon) || app.icon.startsWith('/')))
            ? (<img src={app.icon} alt={app.name} className="w-8 h-8 object-contain" draggable={false} />)
            : (<span className="text-2xl">{app.icon}</span>)
      }
      </motion.div>
      {!isDragging && hoveredApp === index && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap"
        >
          {label}
        </motion.div>
      )}
    </motion.div>
  );

  // Render in-flow; collapse its slot while dragging
  return (
    <div
      className="relative flex-shrink-0"
      style={isDragging ? { width: 0, marginLeft: 0, marginRight: 0 } : undefined}
    >
      {draggableNode}
    </div>
  );
}
;

const Dock = forwardRef(({ onClick, onDrop, customApps = [] }, ref) => {
  const [hoveredApp, setHoveredApp] = useState(null);
  const [items] = useState(() => dockApps);

  // Merge default apps with custom apps from parent
  const mergedItems = useMemo(() => {
    const map = new Map();
    for (const it of items) map.set(it.id, it);
    for (const extra of customApps) {
      const existing = map.get(extra.id);
      map.set(extra.id, existing ? { ...existing, ...extra } : { ...extra });
    }
    // Ensure defaults are present
    for (const def of dockApps) {
      const existing = map.get(def.id);
      map.set(def.id, existing ? { ...def, ...existing } : { ...def });
    }
    return Array.from(map.values());
  }, [items, customApps]);

  // Hide any items explicitly marked hidden via customApps overrides
  const visibleItems = useMemo(() => mergedItems.filter(it => !it.hidden), [mergedItems]);

  return (
    <div className="fixed bottom-2 inset-x-0 flex justify-center mx-4 z-40" ref={ref}>
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 flex gap-x-[5px] shadow-lg overflow-x-auto max-w-full">
        {visibleItems.map((app, index) => (
          <DockItem
            key={app.id}
            app={app}
            index={index}
            onDrop={onDrop}
            onClick={onClick}
            hoveredApp={hoveredApp}
            setHoveredApp={setHoveredApp}
          />
        ))}
      </div>
    </div>
  );
});

export default Dock;
