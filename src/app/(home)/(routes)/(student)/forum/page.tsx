import Filter from '@/components/shared/Filter';
import QuestionCard from '@/components/shared/QuestioinCard';
import SearchInput from '@/components/shared/SearchInput';
import { Button } from '@/components/ui/button';
import { QuestionFilters } from '@/constants';
import Link from 'next/link';

const ForumPage = () => {
  return (
    <section className="p-5 sm:p-10">
      <div className="flex-between">
        <h1 className="text-xl font-semibold">All Questions</h1>
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
        <QuestionCard />
        <QuestionCard />
      </div>
    </section>
  );
};

export default ForumPage;
