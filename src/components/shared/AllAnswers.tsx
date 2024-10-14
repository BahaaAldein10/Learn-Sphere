import { getAllAnswers } from '@/lib/actions/answer.actions';
import { timeSinceQuestionAsked } from '@/lib/utils';
import { User } from '@prisma/client';
import Image from 'next/image';
import Preview from './Preview';

const AllAnswers = async ({
  user,
  questionId,
}: {
  user: User;
  questionId: string;
}) => {
  const answers = await getAllAnswers(questionId);

  if (!answers || answers.length === 0) {
    return (
      <div className="mt-10 text-gray-600">
        No answers yet. Be the first to provide an answer!
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-8">
      <h3 className="text-lg font-semibold text-gray-800">
        {answers.length} Answer{answers.length > 1 ? 's' : ''}
      </h3>

      {answers.map((answer) => (
        <div key={answer.id} className="rounded-lg border border-gray-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src={user?.picture}
                alt="profile picture"
                width={28}
                height={28}
                className="select-none rounded-full"
              />
              <div className="text-sm">
                <span className="font-medium text-gray-800">
                  {user?.username}
                </span>
                <span className="mx-2 text-gray-500">|</span>
                <span className="text-gray-500">
                  answered {timeSinceQuestionAsked(answer.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Answer Content */}
          <div className="mt-2">
            <Preview value={answer.content} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AllAnswers;
