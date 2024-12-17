import CourseCard from '@/components/shared/CourseCard';
import CourseFilters from '@/components/shared/CourseFilters';
import Pagination from '@/components/shared/Pagination';
import {
  getAllCourses,
  getRecommendations,
} from '@/lib/actions/course.actions';
import { SearchParamsProps } from '@/types';
import { auth } from '@clerk/nextjs/server';
import { Metadata } from 'next';
import Image from 'next/image';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Browse | LearnSphere',
  description: 'Browse a variety of educational courses at LearnSphere.',
  keywords: 'courses, education, learning, online courses',
};

const Courses = async ({ searchParams }: SearchParamsProps) => {
  const { userId } = await auth();
  if (!userId) return redirect('/');

  let result;

  if (searchParams.filter === 'recommended') {
    result = await getRecommendations({
      userId,
      searchQuery: searchParams.q,
      pageNumber: searchParams.page ? +searchParams.page : 1,
    });
  } else {
    result = await getAllCourses({
      userId,
      searchQuery: searchParams.q,
      filterQuery: searchParams.filter,
      pageNumber: searchParams.page ? +searchParams.page : 1,
    });
  }

  return (
    <>
      <CourseFilters />

      <div className="p-6">
        {result.coursesWithProgress.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {result.coursesWithProgress.map((course, index) => (
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
              loading="lazy"
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

        <div className="mt-10">
          {result.totalCount > result.pageSize && (
            <Pagination
              currentPage={searchParams.page ? +searchParams.page : 1}
              totalItems={result.totalCount}
              itemsPerPage={result.pageSize}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Courses;
