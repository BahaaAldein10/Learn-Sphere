'use client';

import { deleteCourse, publishCourse } from '@/lib/actions/course.actions';
import { useConfettiStore } from '@/store/confettiStore';
import { Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import ConfirmModal from '../shared/ConfirmModal';
import { Button } from '../ui/button';

interface CourseActionsProps {
  disabled: boolean;
  courseId: string;
  isPublished: boolean;
}

const CourseActions = ({
  disabled,
  courseId,
  isPublished,
}: CourseActionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { onOpen } = useConfettiStore();

  const handlePublish = async () => {
    try {
      setIsLoading(true);

      await publishCourse({
        courseId,
        isPublished,
      });

      toast.success(
        `Course ${isPublished === true ? 'unpublished' : 'published'}`
      );

      if (!isPublished) {
        onOpen();
      }

      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);

      await deleteCourse({
        courseId,
      });

      toast.success('Course deleted');
      router.push(`/teacher/courses`);
      router.refresh();
    } catch (error) {
      console.log(error);
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
        {isLoading ? 'Publishing...' : isPublished ? 'Unpublish' : 'Publish'}
      </Button>

      <ConfirmModal onDelete={handleDelete} type="course">
        <Button disabled={isLoading}>
          <Trash className="size-4" />
        </Button>
      </ConfirmModal>
    </div>
  );
};

export default CourseActions;
