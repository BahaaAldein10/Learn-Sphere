import QuizQuestionForm from '@/components/forms/QuizQuestionForm';
import { Banner } from '@/components/ui/banner';
import { getAllQuizQuestions, getQuiz } from '@/lib/actions/quiz.actions';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const QuizIdPage = async ({
  params,
}: {
  params: { quizId: string; courseId: string };
}) => {
  const { quizId, courseId } = params;

  const { userId } = await auth();
  if (!userId) return redirect('/');

  const quiz = await getQuiz({ quizId });
  if (!quiz) return redirect(`/teacher/courses/${courseId}`);

  const questions = await getAllQuizQuestions({
    quizId,
  });
  if (!questions) return [];

  return (
    <>
      {!quiz.isPublished && (
        <Banner label="This quiz is unpublished. It will not be visible in the course." />
      )}

      <QuizQuestionForm
        quizTitle={quiz.title}
        courseId={courseId}
        quizId={quizId}
        questions={questions}
        isPublished={quiz.isPublished}
        language={quiz.language || 'English'}
        time={quiz.timeInMinutes as number}
        weightMCQ={quiz.defaultWeightMCQ}
        weightTF={quiz.defaultWeightTF}
        weightShort={quiz.defaultWeightShort}
        criteria={quiz.criteria || ''}
      />
    </>
  );
};

export default QuizIdPage;
