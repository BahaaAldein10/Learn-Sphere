import { getCategoryNameById } from '@/lib/actions/question.actions';
import { getUser } from '@/lib/actions/user.actions';
import { timeSinceQuestionAsked } from '@/lib/utils';
import { Answer } from '@prisma/client';
import { Eye, MessageCircle, ThumbsUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import Metric from './Metric';

interface QuestionCardProps {
  title: string;
  category: string;
  url: string;
  userId: string;
  QuestionAsked: Date;
  likes: number;
  answers: Answer[];
  views: number;
}

const QuestionCard = async ({
  title,
  category,
  url,
  userId,
  QuestionAsked,
  likes,
  answers,
  views,
}: QuestionCardProps) => {
  const categoryName = await getCategoryNameById({ categoryId: category });
  const user = await getUser({
    userId,
  });

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
      {/* Title */}
      <Link
        href={`/forum/${url}`}
        className="line-clamp-1 block text-xl font-semibold text-gray-900 transition-colors hover:text-purple-700"
      >
        {title}
      </Link>

      {/* Category Badge */}
      <Badge className="mt-3 select-none rounded-full bg-purple-100 px-3 py-1 text-purple-700">
        {categoryName}
      </Badge>

      {/* User Info, Metrics, and Time */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
              asked {timeSinceQuestionAsked(QuestionAsked)}
            </span>
          </div>
        </div>

        {/* Metrics Section */}
        <div className="flex select-none items-center gap-4 max-sm:flex-wrap max-sm:gap-2">
          <Metric
            icon={<ThumbsUp className="size-4 text-gray-700" />}
            value={likes}
            title="Likes"
            textStyles="text-sm font-medium text-gray-700"
          />
          <Metric
            icon={<MessageCircle className="size-4 text-gray-700" />}
            value={answers.length}
            title="Answers"
            textStyles="text-sm font-medium text-gray-700"
          />
          <Metric
            icon={<Eye className="size-4 text-gray-700" />}
            value={views}
            title="Views"
            textStyles="text-sm font-medium text-gray-700"
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
