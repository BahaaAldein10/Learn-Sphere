import { CourseEnrollButton } from '@/components/shared/CourseEnrollButton';
import CourseProgressButton from '@/components/shared/CourseProgressButton';
import Preview from '@/components/shared/Preview';
import VideoPlayer from '@/components/shared/VideoPlayer';
import { Banner } from '@/components/ui/banner';
import { getChapter } from '@/lib/actions/chapter.actions';
import { auth } from '@clerk/nextjs/server';
import { Separator } from '@radix-ui/react-select';
import { File } from 'lucide-react';
import { redirect } from 'next/navigation';

const ChapterId = async ({
  params,
}: {
  params: { id: string; chapterId: string };
}) => {
  const { id, chapterId } = params;
  const { userId } = auth();

  if (!userId) return redirect('/');
  if (!id || !chapterId) return redirect('/');

  const {
    chapter,
    userProgress,
    nextChapter,
    attachments,
    purchase,
    course,
    videoUrl,
  } = await getChapter({
    chapterId,
    courseId: id,
    userId,
  });

  const isLocked = !purchase && !chapter?.isFree;
  const isCompleted = !!purchase && !userProgress?.isCompleted;

  return (
    <div>
      {userProgress?.isCompleted && (
        <Banner variant="success" label="You already completed this chapter." />
      )}
      {isLocked && (
        <Banner
          variant="warning"
          label="You need to purchase this course to watch this chapter."
        />
      )}
      <div className="mx-auto flex max-w-4xl flex-col pb-20">
        <div className="p-4">
          <VideoPlayer
            chapterId={params.chapterId}
            title={chapter?.title as string}
            courseId={params.id}
            nextChapterId={nextChapter?.id}
            videoUrl={videoUrl as string}
            isLocked={isLocked}
            isCompleted={isCompleted}
          />
        </div>
        <div>
          <div className="flex flex-col items-center justify-between p-4 md:flex-row">
            <h2 className="mb-2 text-2xl font-semibold">{chapter?.title}</h2>
            {purchase ? (
              <CourseProgressButton
                chapterId={chapterId}
                courseId={id}
                nextChapterId={nextChapter?.id}
                isCompleted={!!userProgress?.isCompleted}
              />
            ) : (
              <CourseEnrollButton
                courseId={id}
                price={course?.price as number}
              />
            )}
          </div>
          <Separator />
          <div>
            <Preview value={chapter?.description as string} />
          </div>
          {!!attachments?.length && (
            <>
              <Separator />
              <div className="p-4">
                {attachments.map((attachment) => (
                  <a
                    href={attachment.url}
                    target="_blank"
                    key={attachment.id}
                    className="flex w-full items-center bg-sky-200 text-purple-700 hover:underline"
                  >
                    <File />
                    <p className="line-clamp-1">{attachment.name}</p>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterId;
