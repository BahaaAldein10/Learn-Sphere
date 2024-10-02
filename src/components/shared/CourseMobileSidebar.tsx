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
}

export const CourseMobileSidebar = ({
  course,
  progressCount,
}: CourseMobileSidebarProps) => {
  return (
    <Sheet>
      <SheetTrigger className="block w-fit pl-4 transition hover:opacity-75 md:hidden">
        <Menu size={30} className='text-gray-900' />
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <CourseSidebar course={course} progressCount={progressCount} />
      </SheetContent>
    </Sheet>
  );
};
