import CourseCard from '@/components/shared/CourseCard';
import { getAllCourses } from '@/lib/actions/course.actions';
import { auth } from '@clerk/nextjs/server';
import Image from 'next/image';
import { redirect } from 'next/navigation';

const Courses = async () => {
  const { userId } = auth();
  if (!userId) return redirect('/sign-in');

  const courses = await getAllCourses({
    userId,
  });

  return (
    <div className="p-6">
      {courses && courses.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {courses.map((course, index) => (
            <CourseCard
              key={index}
              id={course.id}
              name={course.name}
              imageUrl={course.imageUrl!}
              category={course.category?.name as string}
              chapters={course.chapters?.length as number}
              price={course.price!}
              progress={course.progress}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <Image
            src="/assets/no-courses.jpg"
            alt="No courses available"
            width={350}
            height={350}
            className="mb-6"
          />
          <h2 className="mb-2 text-2xl font-semibold">No Courses Available</h2>
          <p className="text-gray-600">
            We currently don’t have any courses available. Please check back
            later.
          </p>
        </div>
      )}
    </div>
  );
};

export default Courses;
