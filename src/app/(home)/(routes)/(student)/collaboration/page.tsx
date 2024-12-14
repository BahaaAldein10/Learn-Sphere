import AddDocumentBtn from '@/components/shared/AddDocumentBtn';
import { getDocuments } from '@/lib/actions/room.actions';
import { dateConverter } from '@/lib/utils';
import { currentUser } from '@clerk/nextjs/server';
import { RoomData } from '@liveblocks/node';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Collaboration | LearnSphere',
  description:
    'Collaborate with fellow students on projects, discussions, and group activities at LearnSphere.',
  keywords:
    'collaboration, group projects, student collaboration, online learning community',
};

const Collaboration = async () => {
  const clerkUser = await currentUser();
  if (!clerkUser) return redirect('/');

  const roomDocuments = await getDocuments(
    clerkUser.emailAddresses[0].emailAddress
  );

  return (
    <main className="flex-center p-6">
      {roomDocuments && roomDocuments.data.length > 0 ? (
        <div className="document-list-container">
          <div className="document-list-title">
            <h3 className="text-2xl font-semibold">All documents</h3>
            <AddDocumentBtn
              userId={clerkUser.id}
              email={clerkUser.emailAddresses[0].emailAddress}
            />
          </div>
          
          <ul className="document-ul">
            {roomDocuments.data.map(({ id, metadata, createdAt }: RoomData) => (
              <li key={id} className="document-list-item">
                <Link
                  href={`/collaboration/documents/${id}`}
                  className="flex flex-1 items-center gap-4"
                >
                  <div className="hidden rounded-md bg-purple-200 p-2 sm:block">
                    <Image
                      src="/assets/icons/doc.png"
                      alt="file"
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="line-clamp-1 text-lg font-semibold">
                      {metadata.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      Created about {dateConverter(createdAt)}
                    </p>
                  </div>
                </Link>
                {/* <DeleteModal roomId={id} /> */}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="document-list-empty">
          <Image
            src="/assets/icons/doc.png"
            alt="Document"
            width={50}
            height={50}
            className="mx-auto"
          />

          <AddDocumentBtn
            userId={clerkUser.id}
            email={clerkUser.emailAddresses[0].emailAddress}
          />
        </div>
      )}
    </main>
  );
};

export default Collaboration;
