import prisma from '@/lib/db';
import { redirect } from 'next/navigation';

const QuizPage = async ({ params }: { params: { id: string } }) => {
  const quiz = await prisma.quiz.findUnique({
    where: {
      courseId: params?.id,
      isPublished: true,
    },
  });

  if (!quiz) return redirect(`/courses/${params?.id}`);

  return redirect(`/courses/${params?.id}/quiz/${quiz?.id}`);
};

export default QuizPage;
