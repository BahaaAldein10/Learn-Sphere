import { CourseNavbar } from '@/components/shared/CourseNavbar';
import { CourseSidebar } from '@/components/shared/CourseSidebar';
import { getProgress } from '@/lib/actions/chapter.actions';
import prisma from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react';

const CourseLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect('/');
  }

  const course = await prisma.course.findFirst({
    where: {
      id: params.id,
    },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        include: {
          userProgress: {
            where: {
              clerkId: userId,
            },
          },
        },
        orderBy: {
          position: 'asc',
        },
      },
    },
  });

  const quiz = await prisma.quiz.findUnique({
    where: {
      courseId: course?.id,
    },
  });
  const quizId = quiz?.id;

  if (!course) {
    return redirect('/');
  }

  const progressCount: number = await getProgress({
    courseId: params.id,
    userId,
  });

  const isCompleted: boolean = progressCount === 100;

  return (
    <div className="h-full">
      <div className="fixed inset-y-0 z-10 h-[80px] w-full md:pl-80">
        <CourseNavbar
          course={course}
          progressCount={progressCount}
          quizId={quizId}
          quizTitle={quiz?.title as string}
          isCompleted={isCompleted}
        />
      </div>
      <div className="fixed inset-y-0 z-10 hidden h-full w-80 flex-col md:flex">
        <CourseSidebar
          course={course}
          progressCount={progressCount}
          quizId={quizId}
          quizTitle={quiz?.title as string}
          isCompleted={isCompleted}
        />
      </div>
      <main className="h-full pt-[80px] md:pl-80">{children}</main>
    </div>
  );
};

export default CourseLayout;
