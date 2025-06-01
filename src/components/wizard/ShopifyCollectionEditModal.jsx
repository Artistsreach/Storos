import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

const ShopifyCollectionEditModal = ({ isOpen, onClose, collection, onSave }) => {
  const [editedCollection, setEditedCollection] = useState(null);

  useEffect(() => {
    if (collection) {
      setEditedCollection({
        ...collection,
        name: collection.title || '', // Use name for editing, map back to title
      });
    } else {
      setEditedCollection(null);
    }
  }, [collection]);

  if (!isOpen || !editedCollection) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedCollection(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const collectionToSave = {
      ...editedCollection,
      title: editedCollection.name, // Map name back to title
    };
    onSave(collectionToSave);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Collection: {collection.title}</DialogTitle>
          <DialogDescription>
            Make changes to the collection details below.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1">
          <div className="grid gap-4 py-4 pr-3">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" name="name" value={editedCollection.name} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea id="description" name="description" value={editedCollection.description || ''} onChange={handleChange} className="col-span-3" rows={4} />
            </div>
            {/* TODO: Add product selection for collection if needed */}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShopifyCollectionEditModal;
