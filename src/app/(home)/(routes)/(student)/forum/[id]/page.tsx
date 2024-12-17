import AnswerForm from '@/components/forms/AnswerForm';
import AllAnswers from '@/components/shared/AllAnswers';
import Likes from '@/components/shared/Likes';
import Metric from '@/components/shared/Metric';
import Preview from '@/components/shared/Preview';
import QuestionActions from '@/components/shared/QuestionActions';
import { Badge } from '@/components/ui/badge';
import {
  getCategoryNameById,
  getQuestionById,
} from '@/lib/actions/question.actions';
import { getUser } from '@/lib/actions/user.actions';
import { formatTimeSince } from '@/lib/utils';
import { ParamsProps } from '@/types';
import { auth } from '@clerk/nextjs/server';
import { Eye, MessageCircle, ThumbsUp } from 'lucide-react';
import Image from 'next/image';

const QuestionPage = async ({ params }: ParamsProps) => {
  const { id } = params;
  const { userId } = await auth();

  const question = await getQuestionById({ id });
  const categoryName = await getCategoryNameById({
    categoryId: question?.categoryId as string,
  });
  const user = await getUser({
    userId: question?.clerkId as string,
  });

  const isAuthor = userId === user?.clerkId;

  if (!question) throw new Error('Question not found');

  return (
    <section className="p-5 sm:p-10">
      <div className="flex w-full flex-wrap items-center gap-4">
        {/* User and Date Section */}
        <div className="flex-center gap-3">
          <Image
            src={user?.picture as string}
            alt="profile picture"
            width={32}
            height={32}
            className="select-none rounded-full"
            loading="lazy"
          />
          <div className="text-sm">
            <span className="font-medium text-gray-800">{user?.username}</span>
            <span className="mx-2 text-gray-500">|</span>
            <span className="text-gray-500">
              asked {formatTimeSince(question.createdAt)}
            </span>
          </div>
        </div>

        {/* Likes and Action Section */}
        <div className="flex flex-1 items-center justify-between gap-4">
          <Likes
            questionId={id}
            hasLiked={question.likes.some((like) => like.clerkId === userId)}
            hasDisliked={question.disLikes.some(
              (disLike) => disLike.clerkId === userId
            )}
          />

          {isAuthor && <QuestionActions questionId={id} />}
        </div>
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
      <Badge className="mt-3 select-none rounded-full bg-purple-100 px-3 py-1 text-purple-700">
        {categoryName}
      </Badge>

      {/* Metrics Section */}
      <div className="mt-4 flex select-none items-center gap-4 max-sm:flex-wrap max-sm:gap-2">
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

      <AllAnswers questionId={id} />

      <AnswerForm questionId={id} questionTitle={question.title} />
    </section>
  );
};

export default QuestionPage;
