import CourseCard from '@/components/shared/CourseCard';
import CourseFilters from '@/components/shared/CourseFilters';
import {
  getAllCourses,
  getRecommendations,
} from '@/lib/actions/course.actions';
import { SearchParamsProps } from '@/types';
import { auth } from '@clerk/nextjs/server';
import Image from 'next/image';
import { redirect } from 'next/navigation';

const Courses = async ({ searchParams }: SearchParamsProps) => {
  const { userId } = auth();
  if (!userId) return redirect('/');

  let courses;

  if (searchParams.filter === 'recommended') {
    courses = await getRecommendations(userId);
  } else {
    courses = await getAllCourses({
      userId,
      searchQuery: searchParams.q,
      filterQuery: searchParams.filter,
    });
  }

  return (
    <>
      <CourseFilters />

      <div className="p-6">
        {courses.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {courses.map((course, index) => (
              <CourseCard
                key={index}
                id={course?.id as string}
                name={course?.name as string}
                imageUrl={course?.imageUrl as string}
                category={course?.category?.name as string}
                chapters={course?.chapters?.length as number}
                price={course?.price as number}
                progress={course?.progress}
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
            <h2 className="mb-2 text-2xl font-semibold">
              No Courses Available
            </h2>
            <p className="text-gray-600">
              We currently don’t have any courses available. Please check back
              later.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Courses;
