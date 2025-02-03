import { ColumnUsers } from '@/components/courses/ColumnUsers';
import { DataTable } from '@/components/courses/DataTable';
import { getAdminUsers, isAdmin } from '@/lib/actions/user.actions';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const AdminUsers = async () => {
  const { userId } = await auth();
  if (!userId) return redirect('/sign-in');

  const admin = await isAdmin({ userId });
  if (!admin) return redirect('/courses');

  const adminUsers = (await getAdminUsers({ userId })) || [];

  return (
    <div className="p-6">
      <DataTable columns={ColumnUsers} data={adminUsers} mode="Admin" />
    </div>
  );
};

export default AdminUsers;
