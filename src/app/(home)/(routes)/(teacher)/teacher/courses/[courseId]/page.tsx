import AttachmentForm from '@/components/forms/AttachmentForm';
import { CategoryForm } from '@/components/forms/CategoryForm';
import ChaptersForm from '@/components/forms/ChaptersForm';
import CourseActions from '@/components/forms/CourseActions';
import DescriptionForm from '@/components/forms/DescriptionForm';
import ImageForm from '@/components/forms/ImageForm';
import PriceForm from '@/components/forms/PriceForm';
import TitleForm from '@/components/forms/TitleForm';
import { Banner } from '@/components/ui/banner';
import { getCourse } from '@/lib/actions/course.actions';
import prisma from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import {
  CircleDollarSign,
  File,
  LayoutDashboard,
  ListCheck,
} from 'lucide-react';
import { redirect } from 'next/navigation';

type Chapter = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  position: number;
  isPublished: boolean;
  isFree: boolean;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
};

type Category = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
  const { userId } = auth();

  if (!userId) {
    return redirect('/');
  }

  const course = await getCourse({
    id: params.courseId,
    clerkId: userId,
  });

  if (!course) {
    return redirect('/teacher/courses');
  }

  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  const requiredFields = [
    course.name,
    course.description,
    course.imageUrl,
    course.categoryId,
    course.price,
    course.chapters.some((chapter: Chapter) => chapter.isPublished),
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `${completedFields}/${totalFields}`;

  const isCompleted = requiredFields.every(Boolean);

  return (
    <>
      {!course.isPublished && (
        <Banner label="This course is unpublished. It will not be visible to the students." />
      )}

      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">Course Setup</h1>
            <span className="text-sm text-slate-700">
              {`Fields completed: ${completionText}`}
            </span>
          </div>

          <CourseActions
            disabled={!isCompleted}
            courseId={course.id}
            isPublished={course.isPublished}
          />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-purple-200 p-1">
                <LayoutDashboard color="#581c87" className="size-6" />
              </div>
              <h2 className="text-xl font-semibold">Customize your course</h2>
            </div>

            <TitleForm initialData={course} courseId={course.id} />
            <DescriptionForm initialData={course} courseId={course.id} />
            <ImageForm initialData={course} courseId={course.id} />
            <CategoryForm
              initialData={course}
              courseId={course.id}
              categories={categories.map((category: Category) => ({
                label: category.name,
                value: category.id,
              }))}
            />
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-purple-200 p-1">
                  <ListCheck color="#581c87" className="size-6" />
                </div>
                <h2 className="text-xl font-semibold">Course chapters</h2>
              </div>

              <ChaptersForm initialData={course} courseId={course.id} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-purple-200 p-1">
                  <CircleDollarSign color="#581c87" className="size-6" />
                </div>
                <h2 className="text-xl font-semibold">Sell your course</h2>
              </div>

              <PriceForm initialData={course} courseId={course.id} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-purple-200 p-1">
                  <File color="#581c87" className="size-6" />
                </div>
                <h2 className="text-xl font-semibold">
                  Resources & Attachments
                </h2>
              </div>

              <AttachmentForm initialData={course} courseId={course.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseIdPage;
