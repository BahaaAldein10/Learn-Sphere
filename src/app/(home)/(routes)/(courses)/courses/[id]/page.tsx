import prisma from '@/lib/db';
import { ParamsProps } from '@/types';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const CourseId = async ({ params }: ParamsProps) => {
  const { id } = params;
  const { userId } = auth();

  if (!userId) return redirect('/');

  const course = await prisma.course.findUnique({
    where: {
      id,
    },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        orderBy: {
          position: 'asc',
        },
      },
    },
  });

  if (!course) return redirect('/');

  return redirect(`/courses/${id}/chapters/${course?.chapters[0].id}`);
};

export default CourseId;
