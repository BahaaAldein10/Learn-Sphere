import { AdminColumns } from '@/components/courses/AdminColumns';
import { DataTable } from '@/components/courses/DataTable';
import { getAdminCourses } from '@/lib/actions/course.actions';
import { isAdmin } from '@/lib/actions/user.actions';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const AdminCourses = async () => {
  const { userId } = await auth();
  if (!userId) return redirect('/');

  const admin = await isAdmin({ userId });
  if (!admin) return redirect('/courses');

  // ✅ Fix: Await the function call
  const adminCourses = (await getAdminCourses()) || [];

  return (
    <div className="p-6">
      <DataTable columns={AdminColumns} data={adminCourses} mode="Admin" />
    </div>
  );
};

export default AdminCourses;
