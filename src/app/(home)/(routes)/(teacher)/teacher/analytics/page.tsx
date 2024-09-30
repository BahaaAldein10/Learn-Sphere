import { Chart } from '@/components/shared/Chart';
import { DataCard } from '@/components/shared/DataCard';
import { getAnalytics } from '@/lib/actions/course.actions';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const Analytics = async () => {
  const { userId } = auth();
  if (!userId) return redirect('/');

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
