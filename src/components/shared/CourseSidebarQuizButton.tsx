'use client';

import { cn } from '@/lib/utils';
import { NotebookPen } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

const CourseSidebarQuizButton = ({
  courseId,
  quizId,
  quizTitle,
}: {
  courseId: string;
  quizId: string | undefined;
  quizTitle: string;
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = pathname.includes('quiz');

  return (
    <button
      onClick={() => router.push(`/courses/${courseId}/quiz/${quizId}`)}
      type="button"
      className={cn(
        'flex items-center gap-x-2 text-slate-500 text-sm font-[500] pl-6 transition-all hover:text-slate-600 hover:bg-purple-200/20',
        isActive &&
          'text-slate-700 bg-purple-100 hover:bg-purple-100 hover:text-slate-700'
      )}
    >
      <div
        className={cn(
          'flex-center gap-2 py-4',
          isActive && 'text-purple-900 font-semibold'
        )}
      >
        <NotebookPen
          size={22}
          className={cn('text-slate-500', isActive && 'text-purple-900')}
        />
        <span className="text-left">{quizTitle}</span>
      </div>
      <div
        className={cn(
          'ml-auto opacity-0 border-2 border-slate-700 h-full transition-all',
          isActive && 'opacity-100 border-purple-900'
        )}
      />
    </button>
  );
};

export default CourseSidebarQuizButton;
