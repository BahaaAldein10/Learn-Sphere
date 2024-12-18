import { getUserByAnswer } from '@/lib/actions/answer.actions';
import { formatTimeSince } from '@/lib/utils';
import { auth } from '@clerk/nextjs/server';
import { Answer } from '@prisma/client';
import Image from 'next/image';
import AnswerActions from './AnswerActions';
import Preview from './Preview';

const AnswerCard = async ({ answer }: { answer: Answer }) => {
  const user = await getUserByAnswer({ userId: answer.clerkId });
  if (!user) throw new Error('User not found!');

  const clerkUser = auth();
  const isAuthor = (await clerkUser).userId === user.clerkId;

  return (
    <div key={answer.id} className="rounded-lg border border-gray-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex-between w-full flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Image
              src={user?.picture}
              alt="profile picture"
              width={28}
              height={28}
              className="select-none rounded-full"
              loading="lazy"
            />
            <div className="text-sm">
              <span className="font-medium text-gray-800">
                {user?.username}
              </span>
              <span className="mx-2 text-gray-500">|</span>
              <span className="text-gray-500">
                answered {formatTimeSince(answer.createdAt)}
              </span>
            </div>
          </div>

          {isAuthor && (
            <div>
              <AnswerActions answerId={answer.id} />
            </div>
          )}
        </div>
      </div>

      {/* Answer Content */}
      <div className="mt-2">
        <Preview value={answer.content} />
      </div>
    </div>
  );
};

export default AnswerCard;
