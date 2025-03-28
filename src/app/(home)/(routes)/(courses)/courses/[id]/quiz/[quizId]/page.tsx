import QuizInterface from '@/components/shared/QuizInterface ';
import { getQuiz } from '@/lib/actions/quiz.actions';
import { redirect } from 'next/navigation';

const QuizIdPage = async ({
  params,
}: {
  params: { id: string; quizId: string };
}) => {
  const { id, quizId } = params;

  const quiz = await getQuiz({ quizId });
  if (!quiz) return redirect(`/courses/${id}`);

  return (
    <div className="p-6">
      <QuizInterface
        quizTitle={quiz?.title as string}
        questions={quiz.questions}
        language="English"
      />
    </div>
  );
};

export default QuizIdPage;
