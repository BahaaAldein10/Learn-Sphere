'use client';

import { updateDocument } from '@/lib/actions/room.actions';
import { CollaborativeRoomProps } from '@/types';
import { ClientSideSuspense, RoomProvider } from '@liveblocks/react';
import Image from 'next/image';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Editor } from '../editor/Editor';
import { Input } from '../ui/input';
import ActiveCollaborators from './ActiveCollaborators';
import Loader from './Loader';
import ShareModal from './ShareModal';

const CollaborativeRoom = ({
  roomId,
  roomMetadata,
  currentUserType,
  users,
}: CollaborativeRoomProps) => {
  const [documentTitle, setDocumentTitle] = useState(roomMetadata.title);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reusable function for saving the title
  const saveTitle = async () => {
    if (documentTitle !== roomMetadata.title) {
      try {
        setLoading(true);
        const updatedDocument = await updateDocument({
          roomId,
          title: documentTitle,
        });
        if (updatedDocument) {
          setEditing(false);
        }
        toast.success('Title updated successfully');
      } catch (error) {
        console.log(error);
        toast.error('Something went wrong!');
      } finally {
        setLoading(false);
      }
    }
  };

  const updateTitleHandler = (e: KeyboardEvent) => {
    if (e.key === 'Enter') saveTitle();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        saveTitle();
        if (documentTitle === roomMetadata.title) {
          setEditing(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, documentTitle]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  return (
    <RoomProvider id={roomId}>
      <ClientSideSuspense fallback={<Loader />}>
        <div
          ref={containerRef}
          className="z-50 m-auto mb-4 flex max-w-2xl items-center justify-center gap-4"
        >
          {editing && !loading ? (
            <Input
              type="text"
              value={documentTitle}
              ref={inputRef}
              placeholder="Enter a new title"
              onChange={(e) => setDocumentTitle(e.target.value)}
              onKeyDown={updateTitleHandler}
              disabled={!editing}
              className="document-title-input"
              aria-label="Document title input"
            />
          ) : (
            <>
              <p className="document-title">{documentTitle}</p>
            </>
          )}

          {currentUserType === 'editor' && !editing && (
            <Image
              src="/assets/icons/edit.png"
              alt="Edit title"
              width={24}
              height={24}
              onClick={() => setEditing(true)}
              className="cursor-pointer"
              role="button"
              aria-label="Edit document title"
            />
          )}

          {loading && <p className="text-sm text-gray-600">saving...</p>}

          {currentUserType === 'editor' && (
            <ShareModal
              roomId={roomId}
              collaborators={users}
              creatorId={roomMetadata.creatorId}
              currentUserType={currentUserType}
            />
          )}

          <ActiveCollaborators />
        </div>

        <Editor roomId={roomId} currentUserType={currentUserType} />
      </ClientSideSuspense>
    </RoomProvider>
  );
};

export default CollaborativeRoom;
