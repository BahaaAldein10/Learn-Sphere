'use client';

import { deleteQuestion } from '@/lib/actions/question.actions';
import { useAuth } from '@clerk/nextjs';
import { Edit, Trash2 } from 'lucide-react'; // Import Lucide icons
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';
import ConfirmModal from './ConfirmModal';

const LikeActions = ({ questionId }: { questionId: string }) => {
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
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        className="flex items-center bg-purple-600 text-white hover:bg-purple-700"
        onClick={() => {
          router.push(`/forum/edit/${questionId}`);
        }}
      >
        <Edit className="mr-2 size-5" />
        Edit
      </Button>

      <ConfirmModal onDelete={handleDelete} type="question">
        <Button
          className="flex items-center bg-red-500 text-white hover:bg-red-600"
          disabled={isLoading}
        >
          <Trash2 className="mr-2 size-5" />
          Delete
        </Button>
      </ConfirmModal>
    </div>
  );
};

export default LikeActions;
