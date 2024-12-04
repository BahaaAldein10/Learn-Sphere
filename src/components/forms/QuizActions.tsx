'use client';

import { deleteQuiz, publishQuiz } from '@/lib/actions/quiz.actions';
import { Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import ConfirmModal from '../shared/ConfirmModal';
import { Button } from '../ui/button';

interface QuizActionsProps {
  disabled: boolean;
  courseId: string;
  quizId: string;
  isPublished: boolean;
}

const QuizActions = ({
  disabled,
  isPublished,
  courseId,
  quizId,
}: QuizActionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePublish = async () => {
    try {
      setIsLoading(true);

      await publishQuiz({
        quizId,
        isPublished,
      });

      toast.success(
        `Quiz ${isPublished === true ? 'unpublished' : 'published'}`
      );
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

      await deleteQuiz({
        quizId,
      });

      toast.success('Quiz deleted');
      router.push(`/teacher/courses/${courseId}`);
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
        {isPublished ? 'Unpublish' : 'Publish'}
      </Button>

      <ConfirmModal onDelete={handleDelete} type="quiz">
        <Button
          disabled={isLoading}
          size="icon"
          className="bg-red-500 hover:bg-red-500/90"
        >
          <Trash className="size-4" />
        </Button>
      </ConfirmModal>
    </div>
  );
};

export default QuizActions;
