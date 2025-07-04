import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

const SortableItem = ({ item }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="flex items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-2">
      <button {...listeners} className="cursor-grab mr-4">
        <GripVertical />
      </button>
      <img src={item.images[0]} alt={item.name} className="w-16 h-16 object-cover rounded-md mr-4" />
      <span className="text-lg font-semibold text-gray-900 dark:text-white">{item.name}</span>
    </div>
  );
};

const ReorderProductsModal = ({ isOpen, onClose, products, onSave }) => {
  const [items, setItems] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setItems(products);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, products]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require the mouse to move by 10 pixels before activating
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event) => {
    setIsDragging(false);
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = () => {
    onSave(items);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div 
        className="bg-gray-100 dark:bg-gray-900 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ overflowY: isDragging ? 'hidden' : 'auto' }}
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Reorder Products</h2>
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            {items.map(item => (
              <SortableItem key={item.id} item={item} />
            ))}
          </SortableContext>
        </DndContext>
        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-full mr-2 transition duration-300">
            Cancel
          </button>
          <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition duration-300">
            Save Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReorderProductsModal;
