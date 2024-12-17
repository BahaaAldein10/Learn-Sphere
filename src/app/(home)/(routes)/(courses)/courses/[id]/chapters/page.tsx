import prisma from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const ChaptersPage = async ({ params }: { params: { id: string } }) => {
  const { id } = params;

  const { userId } = await auth();
  if (!userId) return redirect('/');

  const chapter = await prisma.chapter.findFirst({
    where: {
      courseId: id,
      position: 1,
    },
  });

  return redirect(`/courses/${id}/chapters/${chapter?.id}`);
};

export default ChaptersPage;
