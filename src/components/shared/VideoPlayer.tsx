'use client';

import { updateProgress } from '@/lib/actions/chapter.actions';
import { useConfettiStore } from '@/store/confettiStore';
import { useAuth } from '@clerk/nextjs';
import { Loader2, Lock } from 'lucide-react';
import { redirect, useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface VideoPlayerProps {
  videoUrl: string;
  courseId: string;
  chapterId: string;
  nextChapterId?: string;
  isLocked: boolean;
  isCompleted: boolean;
  title: string;
}

const VideoPlayer = ({
  chapterId,
  courseId,
  nextChapterId,
  videoUrl,
  isCompleted,
  isLocked,
}: VideoPlayerProps) => {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const confetti = useConfettiStore();

  const { userId } = useAuth();
  if (!userId) return redirect('/');

  const handleEnd = async () => {
    if (isCompleted)
      try {
        await updateProgress({
          userId,
          chapterId,
          isCompleted: true,
        });

        if (!nextChapterId) {
          confetti.onOpen();
        }

        toast.success('Progress updated');
        router.refresh();

        if (nextChapterId) {
          router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
          router.refresh();
        }
      } catch (error) {
        console.log(error);
        toast.error('Something went wrong');
      }
  };

  return (
    <div className="relative aspect-video">
      {!isReady && !isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <Loader2 className="size-8 animate-spin text-secondary" />
        </div>
      )}
      {isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-y-2 bg-slate-800 text-secondary">
          <Lock className="size-8" />
          <p className="text-sm">This chapter is locked</p>
        </div>
      )}
      {!isLocked && videoUrl && (
        <video
          src={videoUrl}
          controls
          onCanPlay={() => setIsReady(true)}
          onEnded={handleEnd}
          className={`size-full ${!isReady && 'hidden'}`}
        />
      )}
    </div>
  );
};

export default VideoPlayer;
