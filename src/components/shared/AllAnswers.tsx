import { getAllAnswers } from '@/lib/actions/answer.actions';
import AnswerCard from './AnswerCard';
import Pagination from './Pagination';

const AllAnswers = async ({
  questionId,
  searchParams,
}: {
  questionId: string;
  searchParams?: { [key: string]: string | undefined };
}) => {
  const result = await getAllAnswers({
    questionId,
    pageNumber: searchParams?.page ? +searchParams.page : 1,
  });

  if (!result?.answers || result?.answers.length === 0) {
    return (
      <div className="mt-10 text-gray-600">
        No answers yet. Be the first to provide an answer!
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-8">
      <h3 className="text-lg font-semibold text-gray-800">
        {result?.totalCount} Answer{result?.answers.length > 1 ? 's' : ''}
      </h3>

      {result?.answers.map((answer, index) => (
        <AnswerCard key={index} answer={answer} />
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
