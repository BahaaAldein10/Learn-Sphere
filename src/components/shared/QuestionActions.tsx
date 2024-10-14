'use client';

import { deleteQuestion } from '@/lib/actions/question.actions';
import { useAuth } from '@clerk/nextjs';
import { Edit, Trash2 } from 'lucide-react'; // Import Lucide icons
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';
import ConfirmModal from './ConfirmModal';
import { handleError } from '@/lib/utils';

const QuestionActions = ({ questionId }: { questionId: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { userId } = useAuth();
  const router = useRouter();

  if (!userId) throw new Error('User not found');

  const handleDelete = async () => {
    try {
      setIsLoading(true);

      await deleteQuestion(questionId);

      toast.success('Question deleted');
      router.push('/forum');
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        className="bg-purple-600 text-white hover:bg-purple-700"
        onClick={() => {
          router.push(`/forum/edit/${questionId}`);
        }}
      >
        <Edit className="mr-2 size-5 max-sm:mr-0" />
        <span className="max-sm:hidden">Edit</span>
      </Button>

      <ConfirmModal onDelete={handleDelete} type="question">
        <Button
          className="bg-red-500 text-white hover:bg-red-600"
          disabled={isLoading}
        >
          <Trash2 className="mr-2 size-5 max-sm:mr-0" />
          <span className="max-sm:hidden">Delete</span>
        </Button>
      </ConfirmModal>
    </div>
  );
};

export default QuestionActions;
