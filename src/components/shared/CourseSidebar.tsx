import prisma from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { Chapter, Course, UserProgress } from '@prisma/client';
import { redirect } from 'next/navigation';
import { CourseProgress } from './CourseProgress';
import { CourseSidebarItem } from './CourseSidebarItem';
import CourseSidebarQuizButton from './CourseSidebarQuizButton';

interface CourseSidebarProps {
  course: Course & {
    chapters: (Chapter & {
      userProgress: UserProgress[] | null;
    })[];
  };
  progressCount: number;
  quizId: string | undefined;
  quizTitle: string;
  isCompleted: boolean;
}

export const CourseSidebar = async ({
  course,
  quizId,
  quizTitle,
  progressCount,
  isCompleted,
}: CourseSidebarProps) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect('/');
  }

  const purchase = await prisma.purchase.findUnique({
    where: {
      clerkId_courseId: {
        clerkId: userId,
        courseId: course.id,
      },
    },
  });

  return (
    <div className="flex h-full flex-col overflow-y-auto border-r shadow-sm">
      <div className="flex flex-col border-b p-8 pb-6">
        <h1 className="font-semibold">{course.name}</h1>
        {purchase && (
          <div className="mt-10">
            <CourseProgress variant="success" value={progressCount} />
          </div>
        )}
      </div>

      <div className="flex w-full flex-col">
        {course.chapters.map((chapter) => (
          <CourseSidebarItem
            key={chapter.id}
            id={chapter.id}
            label={chapter.title}
            isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
            courseId={course.id}
            isLocked={!chapter.isFree && !purchase}
          />
        ))}

        {quizId && isCompleted && (
          <CourseSidebarQuizButton
            courseId={course.id}
            quizId={quizId}
            quizTitle={quizTitle}
          />
        )}
      </div>
    </div>
  );
};
