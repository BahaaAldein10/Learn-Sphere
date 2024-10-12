import Likes from '@/components/shared/Likes';
import Metric from '@/components/shared/Metric';
import Preview from '@/components/shared/Preview';
import { Badge } from '@/components/ui/badge';
import {
  getCategoryNameById,
  getQuestionById,
} from '@/lib/actions/question.actions';
import { getUser } from '@/lib/actions/user.actions';
import { timeSinceQuestionAsked } from '@/lib/utils';
import { ParamsProps } from '@/types';
import { auth } from '@clerk/nextjs/server';
import { Eye, MessageCircle, ThumbsUp } from 'lucide-react';
import Image from 'next/image';

const QuestionPage = async ({ params }: ParamsProps) => {
  const { id } = params;
  const { userId } = auth();

  const question = await getQuestionById({ id });
  const categoryName = await getCategoryNameById({
    categoryId: question?.categoryId as string,
  });
  const user = await getUser({
    userId: question?.clerkId as string,
  });

  if (!question) throw new Error('Question not found');

  return (
    <section className="p-5 sm:p-10">
      {/* User Info Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-gray-700">
          <Image
            src={user?.picture as string}
            alt="profile picture"
            width={32}
            height={32}
            className="select-none rounded-full border border-gray-300"
          />
          <div className="text-sm">
            <span className="font-medium text-gray-800">{user?.username}</span>
            <span className="mx-2 text-gray-500">|</span>
            <span className="text-gray-500">
              asked {timeSinceQuestionAsked(question.createdAt)}
            </span>
          </div>
        </div>

        <Likes
          questionId={id}
          hasLiked={question.likes.some((like) => like.clerkId === userId)}
          hasDisliked={question.disLikes.some(
            (disLike) => disLike.clerkId === userId
          )}
        />
      </div>

      {/* Question Title */}
      <div className="mt-4 text-xl font-semibold text-gray-900">
        {question.title}
      </div>

      {/* Question Description */}
      <div className="mt-4">
        <Preview value={question.description} />
      </div>

      {/* Category Badge */}
      <Badge className="mt-3 rounded-full bg-purple-100 px-3 py-1 text-purple-700">
        {categoryName}
      </Badge>

      {/* Metrics Section */}
      <div className="mt-4 flex items-center gap-4 max-sm:flex-wrap max-sm:gap-2">
        <Metric
          icon={<ThumbsUp className="size-4 text-gray-700" />}
          value={question.likes.length}
          title="Likes"
          textStyles="text-sm font-medium text-gray-700"
        />
        <Metric
          icon={<MessageCircle className="size-4 text-gray-700" />}
          value={question.answers.length}
          title="Answers"
          textStyles="text-sm font-medium text-gray-700"
        />
        <Metric
          icon={<Eye className="size-4 text-gray-700" />}
          value={question.views}
          title="Views"
          textStyles="text-sm font-medium text-gray-700"
        />
      </div>
    </section>
  );
};

export default QuestionPage;
