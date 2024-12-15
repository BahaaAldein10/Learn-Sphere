'use server';

import {
  AccessType,
  CreateDocumentParams,
  RoomAccesses,
  RoomMetadata,
  ShareDocumentParams,
} from '@/types';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { liveblocks } from '../liveblocks';
import { getAccessType, handleError, parseStringify } from '../utils';

export async function createDocument(params: CreateDocumentParams) {
  try {
    const { email, userId } = params;
    const roomId = uuidv4();

    const metadata: RoomMetadata = {
      creatorId: userId,
      email,
      title: 'Untitled',
    };

    const usersAccesses: RoomAccesses = {
      [email]: ['room:write'],
    };

    const room = await liveblocks.createRoom(roomId, {
      defaultAccesses: ['room:write'],
      usersAccesses,
      metadata,
    });

    revalidatePath('/');

    return parseStringify(room);
  } catch (error) {
    handleError(error);
  }
}

export async function getDocument({
  roomId,
  userId,
}: {
  roomId: string;
  userId: string;
}) {
  try {
    const room = await liveblocks.getRoom(roomId);

    const hasAccess = Object.keys(room.usersAccesses).includes(userId);

    if (!hasAccess) throw Error("You don't have access to this document");

    return parseStringify(room);
  } catch (error) {
    console.error(error);
  }
}

export async function updateDocument({
  roomId,
  title,
}: {
  roomId: string;
  title: string;
}) {
  try {
    const room = await liveblocks.updateRoom(roomId, {
      metadata: {
        title,
      },
    });

    revalidatePath(`/collaboration/documents/${roomId}`);

    return parseStringify(room);
  } catch (error) {
    console.error(error);
  }
}

export async function getDocuments(email: string) {
  try {
    const rooms = await liveblocks.getRooms({ userId: email });

    return parseStringify(rooms);
  } catch (error) {
    console.error(error);
  }
}

export const updateDocumentAccess = async ({
  roomId,
  email,
  userType,
  updatedBy,
}: ShareDocumentParams) => {
  try {
    const usersAccesses: RoomAccesses = {
      [email]: getAccessType(userType) as AccessType,
    };

    const room = await liveblocks.updateRoom(roomId, {
      usersAccesses,
    });

    if (room) {
      const notificationId = uuidv4();

      await liveblocks.triggerInboxNotification({
        userId: email,
        kind: '$documentAccess',
        subjectId: notificationId,
        activityData: {
          userType,
          title: `You have been granted ${userType} access to the document by ${updatedBy.name}`,
          updatedBy: updatedBy.name,
          avatar: updatedBy.avatar,
          email: updatedBy.email,
        },
        roomId,
      });
    }

    revalidatePath(`/collaboration/documents/${roomId}`);
    return parseStringify(room);
  } catch (error) {
    console.log(`Error happened while updating a room access: ${error}`);
  }
};

export const removeCollaborator = async ({
  roomId,
  email,
}: {
  roomId: string;
  email: string;
}) => {
  try {
    const room = await liveblocks.getRoom(roomId);

    if (room.metadata.email === email) {
      throw new Error('You cannot remove yourself from the document');
    }

    const updatedRoom = await liveblocks.updateRoom(roomId, {
      usersAccesses: {
        [email]: null,
      },
    });

    revalidatePath(`/collaboration/documents/${roomId}`);
    return parseStringify(updatedRoom);
  } catch (error) {
    console.log(`Error happened while removing a collaborator: ${error}`);
  }
};

export const deleteDocument = async (roomId: string) => {
  try {
    await liveblocks.deleteRoom(roomId);
  } catch (error) {
    console.log(`Error happened while deleting a room: ${error}`);
  }
};
