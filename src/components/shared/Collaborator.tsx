import {
  removeCollaborator,
  updateDocumentAccess,
} from '@/lib/actions/room.actions';
import { CollaboratorProps, UserType } from '@/types';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '../ui/button';
import UserTypeSelector from './UserTypeSelector';

const Collaborator = ({
  roomId,
  creatorId,
  collaborator,
  email,
  user,
}: CollaboratorProps) => {
  const [userType, setUserType] = useState(collaborator.userType || 'viewer');
  const [loading, setLoading] = useState(false);

  const shareDocumentHandler = async (type: string) => {
    setLoading(true);

    await updateDocumentAccess({
      roomId,
      email,
      userType: type as UserType,
      updatedBy: user,
    });

    setLoading(false);
  };

  const removeCollaboratorHandler = async (email: string) => {
    setLoading(true);

    await removeCollaborator({ roomId, email });

    setLoading(false);
  };

  return (
    <li className="flex-between gap-2 py-3">
      <div className="flex-center gap-2">
        <Image
          src={collaborator.avatar}
          alt={collaborator.name}
          width={36}
          height={36}
          className="size-9 rounded-full"
        />

        <div>
          <p className="line-clamp-1 text-base font-semibold leading-4 text-black">
            {collaborator.name}
            <span className="text-10-regular pl-2 text-muted-foreground">
              {loading && 'updating...'}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">{collaborator.email}</p>
        </div>
      </div>

      {creatorId === collaborator.id ? (
        <p className="text-sm text-purple-700">Owner</p>
      ) : (
        <div className="flex-center gap-2">
          <UserTypeSelector
            userType={userType as UserType}
            setUserType={setUserType || 'viewer'}
            onClickHandler={shareDocumentHandler}
          />
          <Button
            type="button"
            onClick={() => removeCollaboratorHandler(collaborator.email)}
          >
            Remove
          </Button>
        </div>
      )}
    </li>
  );
};

export default Collaborator;
