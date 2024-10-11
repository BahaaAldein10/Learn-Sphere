import Filter from '@/components/shared/Filter';
import Pagination from '@/components/shared/Pagination';
import QuestionCard from '@/components/shared/QuestionCard';
import SearchInput from '@/components/shared/SearchInput';
import { Button } from '@/components/ui/button';
import { QuestionFilters } from '@/constants';
import { getAllQuestions } from '@/lib/actions/question.actions';
import { SearchParamsProps } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

const Forum = async ({ searchParams }: SearchParamsProps) => {
  const result = await getAllQuestions({
    searchQuery: searchParams.q,
    filterQuery: searchParams.filter,
    pageNumber: searchParams.page ? +searchParams.page : 1,
  });

  return (
    <section className="p-5 sm:p-10">
      <div className="flex-between">
        <h1 className="text-2xl font-semibold">All Questions</h1>
        <Button asChild>
          <Link href="/forum/ask-question">Ask a Question</Link>
        </Button>
      </div>

      <div className="flex-center mt-5 w-full gap-4">
        <SearchInput
          placeholder="Search for a Question..."
          classes="sm:w-1/2 w-full h-12"
        />
        <Filter
          filters={QuestionFilters}
          classes="sm:w-1/2 w-full h-12 no-focus bg-gray-100"
        />
      </div>

      <div className="mt-10 flex flex-col gap-8">
        {result && result.questions?.length > 0 ? (
          result.questions?.map((question, index) => (
            <QuestionCard
              key={index}
              title={question.title}
              category={question.categoryId}
              url={question.id}
              userId={question.clerkId}
              QuestionAsked={question.createdAt}
              upvotes={question.likes}
              answers={question.answers}
              views={question.views}
            />
          ))
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Image
              src="/assets/no-courses.jpg"
              alt="No questions available"
              width={350}
              height={350}
              className="mb-6"
            />
            <h2 className="mb-2 text-2xl font-semibold">
              No Questions Available
            </h2>
            <p className="text-gray-600">
              No questions found. Try searching for a different keyword.
            </p>
          </div>
        )}
      </div>

      <div className="mt-10">
        {result.totalCount > result.pageSize && (
          <Pagination
            currentPage={searchParams.page ? +searchParams.page : 1}
            totalItems={result.totalCount}
            itemsPerPage={result.pageSize}
          />
        )}
      </div>
    </section>
  );
};

export default Forum;
