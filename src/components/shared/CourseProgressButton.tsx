'use client';

import { updateProgress } from '@/lib/actions/chapter.actions';
import { useConfettiStore } from '@/store/confettiStore';
import { useAuth } from '@clerk/nextjs';
import { CheckCircle, XCircle } from 'lucide-react';
import { redirect, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';

interface CourseProgressButtonProps {
  chapterId: string;
  courseId: string;
  isCompleted?: boolean;
  nextChapterId?: string;
}

const CourseProgressButton = ({
  chapterId,
  courseId,
  isCompleted,
  nextChapterId,
}: CourseProgressButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const confetti = useConfettiStore();
  const router = useRouter();
  const { userId, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && !userId) {
      redirect('/');
    }
  }, [isLoaded, userId]);

  const onClick = async () => {
    try {
      setIsLoading(true);

      await updateProgress({
        chapterId,
        userId: userId!,
        isCompleted: !isCompleted,
      });

      if (!isCompleted && !nextChapterId) {
        confetti.onOpen();
      }

      if (!isCompleted && nextChapterId) {
        router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
      }

      toast.success('Progress updated');
      router.refresh();
    } catch (error) {
      toast.error('Something went wrong');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const Icon = isCompleted ? XCircle : CheckCircle;

  return (
    <Button
      onClick={onClick}
      disabled={isLoading || !isLoaded}
      type="button"
      variant={isCompleted ? 'outline' : 'default'}
      className="w-full md:w-auto"
    >
      {isCompleted ? 'Not completed' : 'Mark as complete'}
      <Icon className="ml-2 size-4" />
    </Button>
  );
};

export default CourseProgressButton;
