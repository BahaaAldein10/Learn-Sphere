'use server';

import { CreateDocumentParams, RoomAccesses, RoomMetadata } from '@/types';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { liveblocks } from '../liveblocks';
import { handleError, parseStringify } from '../utils';

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
