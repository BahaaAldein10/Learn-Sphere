'use client';

import { updateDocumentAccess } from '@/lib/actions/room.actions';
import { ShareDocumentDialogProps, User, UserType } from '@/types';
import { useSelf } from '@liveblocks/react';
import Image from 'next/image';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import Collaborator from './Collaborator';
import UserTypeSelector from './UserTypeSelector';

const ShareModal = ({
  roomId,
  collaborators,
  creatorId,
  currentUserType,
}: ShareDocumentDialogProps) => {
  const user = useSelf() as { info: User };

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<UserType>('viewer');

  const shareDocumentHandler = async () => {
    try {
      setLoading(true);

      await updateDocumentAccess({
        roomId,
        email,
        userType: userType as UserType,
        updatedBy: user?.info,
      });

      setEmail('');
    } catch (error) {
      console.error('Error sharing document:', error);
      toast.error('Failed to share the document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button
          className="flex h-9 gap-1 px-4"
          disabled={currentUserType !== 'editor'}
        >
          <Image
            src="/assets/icons/share.svg"
            alt="share"
            width={20}
            height={20}
            className="min-w-4 md:size-5"
          />
          <p className="mr-1 hidden sm:block">Share</p>
        </Button>
      </DialogTrigger>

      <DialogContent className="shad-dialog">
        <DialogHeader>
          <DialogTitle>Manage who can view this project</DialogTitle>
          <DialogDescription>
            Select which users can view and edit this document
          </DialogDescription>
        </DialogHeader>

        <Label htmlFor="email" className="mt-6">
          Email address
        </Label>

        <div className="flex items-center gap-3">
          <div className="flex-center flex-1 gap-2 rounded-md">
            <Input
              id="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="no-focus bg-gray-100"
            />
            <UserTypeSelector userType={userType} setUserType={setUserType} />
          </div>

          <Button
            type="submit"
            onClick={shareDocumentHandler}
            className="flex h-full gap-1 px-5"
            disabled={loading || !email}
          >
            {loading ? 'Sending...' : 'Invite'}
          </Button>
        </div>

        <div className="my-2 space-y-2">
          <ul className="flex flex-col">
            {collaborators.map((collaborator) => (
              <Collaborator
                key={collaborator.id}
                roomId={roomId}
                creatorId={creatorId}
                email={collaborator.email}
                collaborator={collaborator}
                user={user?.info}
              />
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
