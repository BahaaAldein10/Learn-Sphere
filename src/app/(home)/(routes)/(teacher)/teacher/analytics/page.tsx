import { Chart } from '@/components/shared/Chart';
import { DataCard } from '@/components/shared/DataCard';
import { getAnalytics } from '@/lib/actions/course.actions';
import { isTeacher } from '@/lib/actions/user.actions';
import { auth } from '@clerk/nextjs/server';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Teacher Analytics | LearnSphere',
  description:
    'Track and analyze your students’ progress and engagement with LearnSphere’s analytics dashboard.',
  keywords:
    'teacher analytics, student performance tracking, educational data, engagement analytics',
};

const Analytics = async () => {
  const { userId } = auth();
  if (!userId) return redirect('/');

  const teacher = await isTeacher({ userId });
  if (!teacher) return redirect('/courses');

  const { data, totalRevenue, totalSales } = await getAnalytics(userId);

  return (
    <div className="p-6">
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <DataCard label="Total Revenue" value={totalRevenue} shouldFormat />
        <DataCard label="Total Sales" value={totalSales} shouldFormat={false} />
      </div>
      <Chart data={data} />
    </div>
  );
};

export default Analytics;
