import { Chapter, Course, UserProgress } from '@prisma/client';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { CourseSidebar } from './CourseSidebar';

interface CourseMobileSidebarProps {
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

export const CourseMobileSidebar = ({
  course,
  quizId,
  quizTitle,
  progressCount,
  isCompleted,
}: CourseMobileSidebarProps) => {
  return (
    <Sheet>
      <SheetTrigger className="block w-fit pl-4 transition hover:opacity-75 md:hidden">
        <Menu size={30} className="text-gray-900" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <CourseSidebar
          course={course}
          progressCount={progressCount}
          quizId={quizId}
          quizTitle={quizTitle}
          isCompleted={isCompleted}
        />
      </SheetContent>
    </Sheet>
  );
};
