import ChapterAccessForm from '@/components/forms/ChapterAccessForm';
import ChapterActions from '@/components/forms/ChapterActions';
import ChapterDescriptionForm from '@/components/forms/ChapterDescriptionForm';
import ChapterTitleForm from '@/components/forms/ChapterTitleForm';
import ChapterVideoForm from '@/components/forms/ChapterVideoForm';
import { Banner } from '@/components/ui/banner';
import prisma from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { ArrowLeft, Eye, LayoutDashboard, Video } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const ChapterIdPage = async ({
  params,
}: {
  params: { courseId: string; chapterId: string };
}) => {
  const { courseId, chapterId } = params;
  const { userId } = await auth();

  if (!userId) redirect('/');

  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
      courseId,
    },
  });

  if (!chapter) redirect('/');

  const requiredFields = [chapter.title, chapter.description, chapter.videoUrl];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `${completedFields}/${totalFields}`;

  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!chapter.isPublished && (
        <Banner label="This chapter is unpublished. It will not be visible in the course." />
      )}

      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <Link
              href={`/teacher/courses/${courseId}`}
              className="mb-6 flex w-fit items-center text-sm transition hover:opacity-75"
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to course setup
            </Link>
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">Chapter Creation</h1>
              </div>
            </div>
            <span className="text-sm text-slate-700 dark:text-slate-300 ">
              Fields completed: {completionText}
            </span>
          </div>
          <ChapterActions
            disabled={!isComplete}
            courseId={courseId}
            chapterId={chapterId}
            isPublished={chapter.isPublished}
          />
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-purple-200 p-1">
                  <LayoutDashboard color="#581c87" className="size-6" />
                </div>
                <h2 className="text-xl font-medium">Customize your chapter</h2>
              </div>
              <ChapterTitleForm
                initialData={chapter}
                courseId={courseId}
                chapterId={chapterId}
              />
              <ChapterDescriptionForm
                initialData={chapter}
                courseId={courseId}
                chapterId={chapterId}
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-purple-200 p-1">
                <Eye color="#581c87" className="size-6" />
              </div>
              <h2 className="text-xl font-medium">Access Settings</h2>
            </div>
            <ChapterAccessForm
              initialData={chapter}
              courseId={courseId}
              chapterId={chapterId}
            />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-purple-200 p-1">
                <Video color="#581c87" className="size-6" />
              </div>
              <h2 className="text-xl font-medium">Add a video</h2>
            </div>
            <ChapterVideoForm
              initialData={chapter}
              courseId={courseId}
              chapterId={chapterId}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChapterIdPage;
