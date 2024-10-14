'use client';

import { deleteChapter, publishChapter } from '@/lib/actions/chapter.actions';
import { Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import ConfirmModal from '../shared/ConfirmModal';
import { Button } from '../ui/button';

interface ChapterActionsProps {
  disabled: boolean;
  courseId: string;
  chapterId: string;
  isPublished: boolean;
}

const ChapterActions = ({
  disabled,
  courseId,
  chapterId,
  isPublished,
}: ChapterActionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePublish = async () => {
    try {
      setIsLoading(true);

      await publishChapter({
        chapterId,
        courseId,
        isPublished,
      });

      toast.success(
        `Chapter ${isPublished === true ? 'unpublished' : 'published'}`
      );
      router.refresh();
    } catch (error) {
      handleError(error);
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);

      await deleteChapter({
        chapterId,
        courseId,
      });

      toast.success('Chapter deleted');
      router.push(`/teacher/courses/${courseId}`);
    } catch (error) {
      handleError(error);
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePublish}
        disabled={disabled || isLoading}
      >
        {isPublished ? 'Unpublish' : 'Publish'}
      </Button>

      <ConfirmModal onDelete={handleDelete} type="chapter">
        <Button disabled={isLoading}>
          <Trash className="size-4" />
        </Button>
      </ConfirmModal>
    </div>
  );
};

export default ChapterActions;
