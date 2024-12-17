import { CoursesList } from '@/components/shared/CoursesList';
import { InfoCard } from '@/components/shared/InfoCard';
import { getDashboardCourses } from '@/lib/actions/course.actions';
import { auth } from '@clerk/nextjs/server';
import { CheckCircle, Clock } from 'lucide-react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Dashboard | LearnSphere',
  description:
    'Access your personalized dashboard on LearnSphere to track your courses, progress, and achievements.',
  keywords:
    'dashboard, learning progress, student dashboard, courses tracking, achievements',
};

export default async function Dashboard() {
  const { userId } = await auth();

  if (!userId) {
    return redirect('/');
  }

  const { completedCourses, coursesInProgress } =
    await getDashboardCourses(userId);

  return (
    <div className="space-y-4 p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InfoCard
          icon={Clock}
          label="In Progress"
          numberOfItems={coursesInProgress.length}
        />
        <InfoCard
          icon={CheckCircle}
          label="Completed"
          numberOfItems={completedCourses.length}
          variant="success"
        />
      </div>
      <CoursesList items={[...coursesInProgress, ...completedCourses]} />
    </div>
  );
}
