import React, { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useStore } from '@/contexts/StoreContext';

const InlineTextEdit = ({ initialText, onSave, identifier, children, className, as: Component = 'div' }) => {
  const { viewMode } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(initialText);

  useEffect(() => {
    setEditText(initialText);
  }, [initialText]);

  const handleSave = () => {
    onSave(identifier, editText);
    setIsEditing(false);
  };

  if (viewMode !== 'edit') {
    return <Component className={className}>{children || initialText}</Component>;
  }

  return (
    <Component className={`relative group ${className}`}>
      {children || initialText}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-background/70 hover:bg-background/90 p-1 h-7 w-7"
        onClick={() => setIsEditing(true)}
        aria-label={`Edit ${identifier}`}
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Text Content</DialogTitle>
            <DialogDescription>
              Modify the text for: {identifier}. Changes will be applied upon saving.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={5}
            className="my-4"
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={() => setEditText(initialText)}> 
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Component>
  );
};

export default InlineTextEdit;
