import { getAllAnswers, getUserByAnswer } from '@/lib/actions/answer.actions';
import { auth } from '@clerk/nextjs/server';
import { User } from '@prisma/client';
import { redirect } from 'next/navigation';
import AnswerCard from './AnswerCard';
import Pagination from './Pagination';

const AllAnswers = async ({
  questionId,
  searchParams,
}: {
  questionId: string;
  searchParams: { [key: string]: string | undefined };
}) => {
  const result = await getAllAnswers({
    questionId,
    pageNumber: searchParams?.page ? +searchParams.page : 1,
  });
  const { userId } = await auth();
  if (!userId) return redirect('/sign-in');

  if (!result?.answers || result?.answers.length === 0) {
    return (
      <div className="mt-10 text-gray-600">
        No answers yet. Be the first to provide an answer!
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-8">
      <h3 className="text-lg font-semibold text-gray-800">All Answers</h3>

      {result?.answers.map(async (answer, index) => (
        <AnswerCard
          key={index}
          answer={answer}
          isAuthor={answer.clerkId === userId}
          user={(await getUserByAnswer({ userId: answer.clerkId })) as User}
        />
      ))}

      <div className="mt-10">
        {result.totalCount > result.pageSize && (
          <Pagination
            currentPage={searchParams?.page ? +searchParams.page : 1}
            totalItems={result.totalCount}
            itemsPerPage={result.pageSize}
          />
        )}
      </div>
    </div>
  );
};

export default AllAnswers;
