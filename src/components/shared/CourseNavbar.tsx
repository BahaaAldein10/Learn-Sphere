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
  quizId: string | undefined;
  quizTitle: string;
  isCompleted: boolean;
}

export const CourseNavbar = ({
  course,
  quizId,
  quizTitle,
  progressCount,
  isCompleted,
}: CourseNavbarProps) => {
  return (
    <div className="flex-between h-20 border-b bg-white">
      <CourseMobileSidebar
        course={course}
        progressCount={progressCount}
        quizId={quizId}
        quizTitle={quizTitle}
        isCompleted={isCompleted}
      />
      <Navbar />
    </div>
  );
};
