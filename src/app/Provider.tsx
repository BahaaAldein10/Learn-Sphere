'use client';

import { getClerkUsers, getDocumentUsers } from '@/lib/actions/user.actions';
import { useUser } from '@clerk/nextjs';
import {
  ClientSideSuspense,
  LiveblocksProvider,
} from '@liveblocks/react/suspense';
import { ReactNode } from 'react';

const Provider = ({ children }: { children: ReactNode }) => {
  const { user: clerkUser } = useUser();

  return (
    <LiveblocksProvider
      authEndpoint="/api/liveblocks-auth"
      resolveUsers={async ({ userIds }) => {
        const users = await getClerkUsers({ userIds });

        return users;
      }}
      resolveMentionSuggestions={async ({ text, roomId }) => {
        const roomUsers = await getDocumentUsers({
          text,
          roomId,
          currentUser: clerkUser?.emailAddresses[0].emailAddress as string,
        });

        return roomUsers || [];
      }}
    >
      <ClientSideSuspense fallback={<></>}>{children}</ClientSideSuspense>
    </LiveblocksProvider>
  );
};

export default Provider;
