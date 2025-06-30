import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight, GripVertical, Trash2 } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableProductItem = ({ product, isAdmin, onRemove, storeUrlSlug, onClose }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: product.id, disabled: !isAdmin });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const content = (
    <div className="flex items-center gap-3 flex-1">
      {isAdmin && (
        <div {...attributes} {...listeners} className="cursor-grab p-2">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      {(product.images && product.images.length > 0) ? (
        <img src={product.images[0]} alt={product.name || 'Product image'} className="w-16 h-16 object-cover rounded-md border" />
      ) : (
        <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
          No Image
        </div>
      )}
      <div>
        <p className="font-semibold">{product.name || 'Untitled Product'}</p>
        <p className="text-sm text-muted-foreground">
          {product.price ? `$${parseFloat(product.price).toFixed(2)}` : 'Price not available'}
        </p>
      </div>
    </div>
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
    >
      {isAdmin ? (
        <>
          {content}
          <Button variant="ghost" size="icon" onClick={() => onRemove(product.id)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </>
      ) : (
        <Link to={`/${storeUrlSlug}/product/${product.id}`} className="flex items-center justify-between w-full" onClick={onClose}>
          {content}
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </Link>
      )}
    </div>
  );
};

const CollectionProductsDialog = ({ isOpen, onClose, collection: initialCollection, store, storeId, isPublishedView }) => {
  const { updateStoreCollections, viewMode, user, currentStore } = useStore();
  const isAdmin = viewMode === 'edit';
  const [products, setProducts] = useState([]);

  useEffect(() => {
    setProducts(initialCollection.products || []);
  }, [initialCollection]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSaveChanges = async () => {
    if (!initialCollection?.id || !storeId) {
      console.error("Collection ID or Store ID is missing.");
      return;
    }
    await updateStoreCollections(storeId, initialCollection.id, products, user);
    onClose();
  };

  const handleRemoveProduct = (productIdToRemove) => {
    setProducts(currentProducts => currentProducts.filter(p => p.id !== productIdToRemove));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setProducts((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (!initialCollection) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialCollection.name || 'Collection Products'}</DialogTitle>
          <DialogDescription>
            {isAdmin ? "Reorder or remove products in this collection." : `Browse products available in the "${initialCollection.name || 'Unnamed'}" collection.`}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1">
          <div className="py-4 space-y-3">
            {products && products.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={products.map(p => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {products.map((product) => (
                    <SortableProductItem
                      key={product.id}
                      product={product}
                      isAdmin={isAdmin}
                      onRemove={handleRemoveProduct}
                      storeUrlSlug={(currentStore || store)?.urlSlug || (currentStore || store)?.name}
                      onClose={onClose}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No products found in this collection.
              </p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="sm:justify-between">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {isAdmin ? "Cancel" : "Close"}
            </Button>
          </DialogClose>
          {isAdmin && (
            <Button type="button" onClick={handleSaveChanges}>
              Save Changes
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CollectionProductsDialog;
