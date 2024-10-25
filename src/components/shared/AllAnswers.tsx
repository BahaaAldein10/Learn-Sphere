import { getAllAnswers } from '@/lib/actions/answer.actions';
import AnswerCard from './AnswerCard';

const AllAnswers = async ({ questionId }: { questionId: string }) => {
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

      {answers.map((answer, index) => (
        <AnswerCard key={index} answer={answer} />
      ))}
    </div>
  );
};

export default AllAnswers;
