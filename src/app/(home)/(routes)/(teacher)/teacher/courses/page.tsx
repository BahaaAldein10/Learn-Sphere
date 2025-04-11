import { columns } from '@/components/courses/Columns';
import { DataTable } from '@/components/courses/DataTable';
import { isTeacher } from '@/lib/actions/user.actions';
import prisma from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Teacher Courses | LearnSphere',
  description:
    'Manage and create courses as a teacher on LearnSphere. Enhance your teaching with various tools and analytics.',
  keywords:
    'teacher courses, course management, create courses, educational tools for teachers',
};

const TeacherCourses = async () => {
  const { userId } = await auth();
  if (!userId) return redirect('/');

  const teacher = await isTeacher({ userId });
  if (!teacher) return redirect('/courses');

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
      <DataTable columns={columns} data={courses} mode="Teacher" />
    </div>
  );
};

export default TeacherCourses;
