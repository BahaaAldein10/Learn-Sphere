import { Chapter, Course, UserProgress } from '@prisma/client';
import { CourseMobileSidebar } from './CourseMobileSidebar';
import Navbar from './Navbar';

interface CourseNavbarProps {
  course: Course & {
    chapters: (Chapter & {
      userProgress: UserProgress[] | null;
    })[];
  };
  progressCount: number;
}

export const CourseNavbar = ({ course, progressCount }: CourseNavbarProps) => {
  return (
    <div className="flex-between border-b bg-white shadow-sm">
      <CourseMobileSidebar course={course} progressCount={progressCount} />
      <Navbar />
    </div>
  );
};
