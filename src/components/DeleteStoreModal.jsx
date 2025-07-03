import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useStore } from '../contexts/StoreContext';
import { useToast } from './ui/use-toast';

const DeleteStoreModal = ({ store, isOpen, onOpenChange }) => {
  const [confirmationText, setConfirmationText] = useState('');
  const { deleteStore } = useStore();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (confirmationText === 'delete') {
      try {
        await deleteStore(store.id);
        toast({
          title: 'Store Deleted',
          description: `The store "${store.name}" has been permanently deleted.`,
        });
        onOpenChange(false);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete the store. Please try again.',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Confirmation Failed',
        description: 'Please type "delete" to confirm.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            store and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-4">
          <label htmlFor="delete-confirm" className="text-sm font-medium">
            Please type "delete" to confirm.
          </label>
          <Input
            id="delete-confirm"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            className="mt-2"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={confirmationText !== 'delete'}
          >
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteStoreModal;
