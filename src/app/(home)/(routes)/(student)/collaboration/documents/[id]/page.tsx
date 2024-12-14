import CollaborativeRoom from '@/components/shared/CollaborativeRoom';
import { getDocument } from '@/lib/actions/room.actions';
import { getClerkUsers } from '@/lib/actions/user.actions';
import { RoomMetadata, User, UserType } from '@/types';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const Document = async ({ params }: { params: { id: string } }) => {
  const { id } = params;

  const clerkUser = await currentUser();
  if (!clerkUser) return redirect('/sign-in');

  const room = await getDocument({
    roomId: id,
    userId: clerkUser.emailAddresses[0].emailAddress,
  });
  if (!room) return redirect('/collaboration');

  const userIds = Object.keys(room.usersAccesses);
  const users = await getClerkUsers({ userIds });

  const usersData = users
    ?.filter((user): user is User => !!user) // Filter out undefined values
    .map((user) => {
      const accessType = room.usersAccesses[user.email] as string[];
      const userType = accessType?.includes('room:write') ? 'editor' : 'viewer';
      return { ...user, userType };
    });

  const currentAccessType = room.usersAccesses[
    clerkUser.emailAddresses[0].emailAddress
  ] as string[];
  const currentUserType = currentAccessType.includes('room:write')
    ? 'editor'
    : 'viewer';

  return (
    <main className="p-6">
      <CollaborativeRoom
        roomId={room?.id as string}
        roomMetadata={room.metadata as RoomMetadata}
        currentUserType={currentUserType as UserType}
        users={usersData as User[]}
      />
    </main>
  );
};

export default Document;
