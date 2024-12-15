'use client';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { deleteDocument } from '@/lib/actions/room.actions';
import { DeleteModalProps } from '@/types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';

export const DeleteModal = ({ roomId }: DeleteModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const deleteDocumentHandler = async () => {
    try {
      setLoading(true);
      await deleteDocument(roomId);
      setOpen(false);
      router.push('/collaboration');
      toast.success('Document deleted successfully');
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size={'icon'}
          className="bg-transparent shadow-none hover:bg-transparent"
        >
          <Image
            src="/assets/icons/delete.svg"
            alt="delete"
            width={24}
            height={24}
            className="mt-1"
          />
        </Button>
      </DialogTrigger>
      <DialogContent className="shad-dialog">
        <DialogHeader>
          <Image
            src="/assets/icons/delete-modal.svg"
            alt="delete"
            width={48}
            height={48}
            className="mb-4"
          />
          <DialogTitle>Delete document</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this document? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-5">
          <DialogClose asChild className="w-full bg-dark-400 text-white">
            Cancel
          </DialogClose>

          <Button
            variant="destructive"
            onClick={deleteDocumentHandler}
            disabled={loading}
            className="gradient-red w-full"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
