import { columns } from '@/components/courses/Columns';
import { DataTable } from '@/components/courses/DataTable';
import prisma from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const TeacherCourses = async () => {
  const { userId } = auth();

  if (!userId) redirect('/');

  const courses = await prisma.course.findMany({
    where: {
      clerkId: userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="p-6">
      <DataTable columns={columns} data={courses} />
    </div>
  );
};

export default TeacherCourses;
